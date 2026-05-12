import mongoose from "mongoose";
import pasteModel from "@/models/Paste.js";
import commentModel from "@/models/Comment.js";
import collaboratorModel from "@/models/Collaborator.js";
import User from "@/models/User.js";
import type {
	PasteData,
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
import { deleteFileFromStorage } from "@/lib/supabase.js";

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

		let expiresAt = expiresTime
			? dateConverter(expiresTime)
			: dateConverter("1d");
		let finalBurnAfterRead = !!burnAfterRead;

		if (expiresTime === "one-time") {
			expiresAt = dateConverter("1d");
			finalBurnAfterRead = true;
		}

		if (!expiresAt && expiresTime !== "never") {
			expiresAt = dateConverter("1d");
		}

		const pasteId = customId || uniqueIdGenerator();
		const pasteData: PasteData = {
			...rest,
			id: pasteId,
			expiresAt: expiresAt || dateConverter("1d"),
			burnAfterRead: finalBurnAfterRead,
			expiresTime: expiresTime || "1d",
			owner: ownerId || undefined,
			createdAt: new Date(),
		};

		if (password) {
			const salt = await bcrypt.genSalt(10);
			pasteData.password = await bcrypt.hash(password, salt);
		}

		try {
			const paste = await pasteModel.create(pasteData);

			if (collaborators && collaborators.length > 0) {
				await this.addCollaborators(paste.id, collaborators);
				if (this.emailService) {
					await this.sendShareEmails(paste, collaborators);
				}
			}

			return paste;
		} catch (error: unknown) {
			if (error && typeof error === "object" && "code" in error) {
				const err = error as { code: number };
				if (err.code === 11000) {
					if (customId) {
						const expired = await this.isPasteExpired(pasteId);
						if (expired) {
							await this.deletePaste(pasteId);
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
		return await pasteModel.findOne({ id });
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
		const paste = await this.getPasteById(id);
		if (paste?.fileUrl) {
			await deleteFileFromStorage(paste.fileUrl);
		}
		await collaboratorModel.deleteMany({ pasteId: id });
		return await pasteModel.deleteOne({ id });
	}

	async updatePaste(id: string, data: UpdatePasteData) {
		const paste = await pasteModel.findOne({ id });
		if (!paste) return null;

		const { newId, expiresTime, password, collaborators, ...updates } =
			data;

		if (newId && newId !== id) {
			const existing = await pasteModel.findOne({ id: newId });
			if (existing) throw new Error("ID_ALREADY_EXISTS");
			paste.id = newId;
		}

		if (expiresTime) {
			let expiresAt = dateConverter(expiresTime);
			if (expiresTime === "one-time") expiresAt = dateConverter("1d");
			else if (expiresTime === "never") expiresAt = null;
			paste.expiresAt = expiresAt;
		}

		if (password) {
			const salt = await bcrypt.genSalt(10);
			paste.password = await bcrypt.hash(password, salt);
		}

		const oldCollaborators = await collaboratorModel.find({ pasteId: id });
		const oldShareMap = new Map();
		for (const col of oldCollaborators) {
			oldShareMap.set(col.email, col.role);
		}

		paste.set(updates);

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

		if (collaborators) {
			await collaboratorModel.deleteMany({ pasteId: id });
			await this.addCollaborators(id, collaborators);

			if (this.emailService) {
				const newShares = collaborators.filter(
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
			return collaboratorModel.create({
				pasteId,
				email: col.email,
				userId: user?._id || undefined,
				role: col.role,
			});
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

		const pastes = await pasteModel.aggregate([
			{ $match: matchQuery },
			{ $sort: { createdAt: -1 } },
			{ $skip: skip },
			{ $limit: limit },
			{
				$lookup: {
					from: "labels",
					let: { paste_id: "$id" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$pasteId", "$$paste_id"] },
										{
											$eq: [
												"$userId",
												new mongoose.Types.ObjectId(
													userId,
												),
											],
										},
									],
								},
							},
						},
					],
					as: "labelData",
				},
			},
			{
				$addFields: {
					labels: {
						$ifNull: [
							{ $arrayElemAt: ["$labelData.labels", 0] },
							[],
						],
					},
				},
			},
			{ $project: { labelData: 0 } },
		]);

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
