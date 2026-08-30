import mongoose from "mongoose";
import pasteModel from "@/models/Paste.js";
import commentModel from "@/models/Comment.js";
import collaboratorModel from "@/models/Collaborator.js";
import User from "@/models/User.js";
import type {
	CommentData,
	UpdatePasteData,
	CreatePasteData,
	ShareEntry,
	IPaste,
} from "@/types/index.js";
import { dateConverter, uniqueIdGenerator } from "@/lib/utils.js";
import bcrypt from "bcryptjs";
import type EmailService from "./email.service.js";
import configurations from "@/config/configurations.js";
import { deletePasteStorageFiles } from "@/lib/supabase.js";
import { expirationScheduler } from "./expiration-scheduler.service.js";

class PasteService {
	constructor(private readonly emailService?: EmailService) {}

	async createPaste(
		data: CreatePasteData,
		ownerId: string | null,
	): Promise<IPaste> {
		const {
			expiresTime,
			burnAfterRead,
			customId,
			password,
			collaborators,
			...rest
		} = data;

		const finalCollaborators = collaborators;

		let expiresAt = expiresTime
			? dateConverter(expiresTime)
			: dateConverter("1d");

		if (expiresTime === "one-time") {
			expiresAt = dateConverter("1d");
		} else if (expiresTime === "never") {
			expiresAt = null;
		}

		let hashedPassword = undefined;
		if (password) {
			const salt = await bcrypt.genSalt(10);
			hashedPassword = await bcrypt.hash(password, salt);
		}

		const pasteId = customId || uniqueIdGenerator();

		try {
			const paste = await pasteModel.create({
				...rest,
				id: pasteId,
				owner: ownerId,
				expiresAt,
				burnAfterRead: burnAfterRead || expiresTime === "one-time",
				expiresTime: expiresTime || "1d",
				password: hashedPassword,
			});

			if (paste.expiresAt) {
				expirationScheduler.schedule(paste.id, paste.expiresAt);
			}

			if (finalCollaborators && finalCollaborators.length > 0) {
				await this.addCollaborators(paste.id, finalCollaborators);
				if (this.emailService) {
					await this.sendShareEmails(paste, finalCollaborators);
				}
			}

			return paste;
		} catch (error: unknown) {
			if (error && typeof error === "object" && "code" in error) {
				const err = error as { code: number };
				if (err.code === 11000) {
					if (customId) {
						// Atomically verify and remove expired paste in a single step to prevent race conditions
						const expiredPaste = await pasteModel.findOneAndDelete({
							id: pasteId,
							expiresAt: { $ne: null, $lte: new Date() },
						});

						if (expiredPaste) {
							expirationScheduler.cancel(pasteId);
							await deletePasteStorageFiles(expiredPaste);
							await collaboratorModel.deleteMany({ pasteId });
							return this.createPaste(data, ownerId);
						}

						throw new Error("ID_ALREADY_EXISTS", {
							cause: error,
						});
					}
					// Retry with new ID if system generated
					return this.createPaste(
						{ ...data, customId: uniqueIdGenerator() },
						ownerId,
					);
				}
			}
			throw error;
		}
	}

	async getPasteById(id: string) {
		const paste = await pasteModel.findOne({ id });
		if (!paste) return null;

		// Lazy On-Access Expiration Purge
		if (
			paste.expiresAt &&
			new Date(paste.expiresAt).getTime() <= Date.now()
		) {
			await this.deletePaste(id);
			return null;
		}

		return paste;
	}

	async incrementViews(id: string) {
		return await pasteModel.findOneAndUpdate(
			{ id },
			{ $inc: { views: 1 } },
			{ new: true },
		);
	}

	async deletePaste(
		id: string,
	): Promise<{ acknowledged: boolean; deletedCount: number }> {
		expirationScheduler.cancel(id);
		const paste = await pasteModel.findOne({ id });
		if (paste) {
			await deletePasteStorageFiles(paste);
		}
		await collaboratorModel.deleteMany({ pasteId: id });
		return await pasteModel.deleteOne({ id });
	}

	async updatePaste(id: string, data: UpdatePasteData) {
		const paste = await pasteModel.findOne({ id });
		if (!paste) return null;

		const { newId, expiresTime, password, collaborators, ...updates } =
			data;

		const finalCollaborators = collaborators;

		if (newId && newId !== id) {
			const existing = await pasteModel.findOne({ id: newId });
			if (existing) {
				const expired = await pasteModel.findOneAndDelete({
					id: newId,
					expiresAt: { $ne: null, $lte: new Date() },
				});
				if (expired) {
					expirationScheduler.cancel(newId);
					await deletePasteStorageFiles(expired);
					await collaboratorModel.deleteMany({ pasteId: newId });
				} else {
					throw new Error("ID_ALREADY_EXISTS");
				}
			}
			paste.id = newId;
		}

		if (expiresTime) {
			let expiresAt = dateConverter(expiresTime);
			if (expiresTime === "one-time") expiresAt = dateConverter("1d");
			else if (expiresTime === "never") expiresAt = null;
			paste.expiresAt = expiresAt;
			paste.expiresTime = expiresTime;
			expirationScheduler.schedule(paste.id, expiresAt);
		}

		if (password === null) {
			paste.password = undefined;
		} else if (password) {
			const salt = await bcrypt.genSalt(10);
			paste.password = await bcrypt.hash(password, salt);
		}

		const oldCollaborators = await collaboratorModel.find({ pasteId: id });
		const oldShareMap = new Map();
		for (const col of oldCollaborators) {
			oldShareMap.set(col.email, col.role);
		}

		paste.set(updates);

		if (updates.files) {
			paste.markModified("files");
		}

		// Sync logic: only update the other field if only one of them was changed
		const roleModified = paste.isModified("publicRole");
		const commentsModified = paste.isModified("allowComments");

		if (roleModified && !commentsModified) {
			if (paste.publicRole === "commenter") {
				paste.allowComments = true;
			} else if (paste.publicRole === "viewer") {
				paste.allowComments = false;
			}
		} else if (commentsModified && !roleModified) {
			if (paste.publicRole !== "editor") {
				paste.publicRole = paste.allowComments ? "commenter" : "viewer";
			}
		}

		const updatedPaste = await paste.save();

		if (finalCollaborators) {
			await collaboratorModel.deleteMany({ pasteId: id });
			await this.addCollaborators(id, finalCollaborators);

			if (this.emailService) {
				const newShares = finalCollaborators.filter(
					(s) => oldShareMap.get(s.email) !== s.role,
				);
				if (newShares.length > 0) {
					await this.sendShareEmails(updatedPaste, newShares);
				}
			}
		}

		return updatedPaste;
	}

	async addCollaborators(pasteId: string, collaborators: ShareEntry[]) {
		const collaboratorPromises = collaborators.map(async (col) => {
			const user = await User.findOne({ email: col.email });
			return collaboratorModel.findOneAndUpdate(
				{ pasteId, email: col.email },
				{
					userId: user?._id || undefined,
					role: col.role,
				},
				{ upsert: true, new: true },
			);
		});
		await Promise.all(collaboratorPromises);
	}

	async getCollaboratorsByPasteId(pasteId: string) {
		return await collaboratorModel.find({ pasteId });
	}

	async removeCollaborator(pasteId: string, email: string) {
		return await collaboratorModel.deleteOne({ pasteId, email });
	}

	async sendShareEmails(paste: IPaste, shares: ShareEntry[]) {
		if (!this.emailService) return;
		const frontendUrl = configurations.domain;
		const emailPromises = shares.map((share) => {
			const pasteUrl = `${frontendUrl}/${paste.id}`;
			return this.emailService!.sendAccessGrantedEmail(
				share.email,
				share.role,
				paste.id,
				pasteUrl,
			);
		});
		await Promise.all(emailPromises);
	}

	async isPasteExpired(id: string): Promise<boolean> {
		const paste = await pasteModel.findOne({ id }).lean();
		return !!(paste && paste.expiresAt && new Date() > paste.expiresAt);
	}

	async getUserPastes(userId: string, page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit;
		const user = await User.findById(userId);
		if (!user) throw new Error("User not found");

		// Find all paste IDs where the user is a collaborator
		const collaborations = await collaboratorModel.find({
			$or: [{ userId: user._id }, { email: user.email }],
		});
		const collaboratedPasteIds = collaborations.map((c) => c.pasteId);

		const matchQuery = {
			$or: [
				{ owner: new mongoose.Types.ObjectId(userId) },
				{ id: { $in: collaboratedPasteIds } },
			],
		};

		const pastes = await pasteModel
			.find(matchQuery)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await pasteModel.countDocuments(matchQuery);

		return {
			pastes,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasMore: page * limit < total,
		};
	}

	async addComment(pasteId: string, comment: CommentData) {
		return await commentModel.create({
			...comment,
			pasteId,
		});
	}

	async getCommentsByPasteId(pasteId: string) {
		return await commentModel.find({ pasteId }).sort({ createdAt: -1 });
	}

	async updateComment(pasteId: string, commentId: string, content: string) {
		return await commentModel.findOneAndUpdate(
			{ id: commentId, pasteId },
			{ $set: { content } },
			{ new: true },
		);
	}

	async deleteComment(pasteId: string, commentId: string) {
		return await commentModel.deleteOne({ id: commentId, pasteId });
	}

	async getUserStats(ownerId: string) {
		const stats = await pasteModel.aggregate([
			{ $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
			{
				$group: {
					_id: null,
					totalSnippets: { $sum: 1 },
					totalViews: { $sum: "$views" },
					languages: { $push: "$language" },
				},
			},
		]);

		if (stats.length === 0) {
			return {
				totalSnippets: 0,
				totalViews: 0,
				mostUsedLanguage: "N/A",
			};
		}

		const { totalSnippets, totalViews, languages } = stats[0] as {
			totalSnippets: number;
			totalViews: number;
			languages: string[];
		};

		// Calculate most used language
		const langCounts = languages.reduce(
			(acc: Record<string, number>, lang: string) => {
				const l = lang || "text";
				acc[l] = (acc[l] || 0) + 1;
				return acc;
			},
			{},
		);

		const sortedEntries = Object.entries(langCounts).sort(
			(a, b) => b[1] - a[1],
		);
		const mostUsedLanguage = sortedEntries[0]?.[0] || "N/A";

		return {
			totalSnippets,
			totalViews,
			mostUsedLanguage,
		};
	}

	async checkIdAvailability(id: string): Promise<boolean> {
		const existing = await pasteModel.findOne({ id }).lean();
		if (!existing) return true;

		const expired = await this.isPasteExpired(id);
		return expired;
	}
}

export default PasteService;
