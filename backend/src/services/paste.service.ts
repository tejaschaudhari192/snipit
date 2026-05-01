import mongoose from "mongoose";
import pasteModel from "@/models/Paste.js";
import type { PasteData, CommentData, UpdatePasteData, IPaste } from "@/types/index.js";
import { dateConverter, uniqueIdGenerator } from "@/lib/utils.js";
import bcrypt from "bcryptjs";
import type EmailService from "./email.service.js";
import configurations from "@/config/configurations.js";
import { deleteFileFromStorage } from "@/lib/supabase.js";

class PasteService {
	constructor(private readonly emailService?: EmailService) {}

	async createPaste(data: any, ownerId: string | null): Promise<IPaste> {
		const { expiresTime, burnAfterRead, customId, idType, password, shareList, ...rest } = data;

		let expiresAt = expiresTime ? dateConverter(expiresTime) : dateConverter("1d");
		let finalBurnAfterRead = !!burnAfterRead;

		if (expiresTime === "one-time") {
			expiresAt = dateConverter("1d");
			finalBurnAfterRead = true;
		}

		if (!expiresAt && !["never"].includes(expiresTime)) {
			expiresAt = dateConverter("1d");
		}

		const pasteId = customId || uniqueIdGenerator();

		const pasteData: PasteData = {
			...rest,
			id: pasteId,
			expiresAt,
			burnAfterRead: finalBurnAfterRead,
			expiresTime,
			owner: ownerId || undefined,
			shareList,
		};

		if (password) {
			const salt = await bcrypt.genSalt(10);
			pasteData.password = await bcrypt.hash(password, salt);
		}

		try {
			const paste = await pasteModel.create(pasteData);
			
			if (shareList && this.emailService) {
				await this.sendShareEmails(paste, shareList);
			}

			return paste;
		} catch (error: any) {
			if (error.code === 11000) {
				if (customId) {
					const expired = await this.isPasteExpired(pasteId);
					if (expired) {
						await this.deletePaste(pasteId);
						return this.createPaste(data, ownerId);
					}
			throw new Error("ID_ALREADY_EXISTS", { cause: error });
				}
				// Retry with new ID if system generated
				return this.createPaste({ ...data, customId: uniqueIdGenerator() }, ownerId);
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
		return await pasteModel.deleteOne({ id });
	}

	async updatePaste(id: string, data: UpdatePasteData) {
		const paste = await pasteModel.findOne({ id });
		if (!paste) return null;

		const { newId, expiresTime, password, shareList, ...updates } = data;

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

		const oldShareMap = new Map();
		if (paste.shareList) {
			for (const share of paste.shareList) {
				oldShareMap.set(share.email, share.role);
			}
		}

		paste.set(updates);
		if (shareList) paste.shareList = shareList;
		
		const updatedPaste = await paste.save();

		if (shareList && this.emailService) {
			const newShares = shareList.filter(s => oldShareMap.get(s.email) !== s.role);
			if (newShares.length > 0) {
				await this.sendShareEmails(updatedPaste, newShares);
			}
		}

		return updatedPaste;
	}

	private async sendShareEmails(paste: IPaste, shares: any[]) {
		if (!this.emailService) return;
		const frontendUrl = configurations.domain;
		const emailPromises = shares.map(share => {
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

	async getUserPastes(ownerId: string, page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit;
		const pastes = await pasteModel
			.find({ owner: ownerId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await pasteModel.countDocuments({ owner: ownerId });

		return {
			pastes,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasMore: page * limit < total,
		};
	}

	async addComment(id: string, comment: CommentData) {
		return await pasteModel.findOneAndUpdate(
			{ id },
			{ $push: { comments: comment } },
			{ new: true },
		);
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
			languages: string[] 
		};

		// Calculate most used language
		const langCounts = languages.reduce((acc: Record<string, number>, lang: string) => {
			const l = lang || "text";
			acc[l] = (acc[l] || 0) + 1;
			return acc;
		}, {});

		const sortedEntries = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
		const mostUsedLanguage = sortedEntries[0]?.[0] || "N/A";

		return {
			totalSnippets,
			totalViews,
			mostUsedLanguage,
		};
	}
}

export default PasteService;

