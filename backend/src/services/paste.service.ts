import pasteModel from "@/models/Paste.js";
import type { PasteData, CommentData } from "@/types/index.js";

class PasteService {
	async savePaste(pastedata: PasteData) {
		return await pasteModel.create(pastedata);
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
		return await pasteModel.deleteOne({ id });
	}
	async updatePaste(
		id: string,
		content: string,
		redirectUrl?: boolean,
		language?: string,
		visibility?: "public" | "private" | "shared",
		allowedUsers?: string[],
		newId?: string,
		password?: string,
		editPermission?: "owner" | "shared" | "public",
		shareList?: {
			email: string;
			role: "viewer" | "editor" | "admin" | "commenter";
		}[],
		publicRole?: "viewer" | "editor" | "commenter",
		allowComments?: boolean,
		expiresTime?: string,
		expiresAt?: Date | null,
		contentMode?: "text" | "code" | "link" | "file",
	) {
		const paste = await pasteModel.findOne({ id });
		if (!paste) return null;

		// If changing ID, check if new ID is already taken
		if (newId && newId !== id) {
			const existing = await pasteModel.findOne({ id: newId });
			if (existing) {
				throw new Error("ID_ALREADY_EXISTS");
			}
			paste.id = newId;
		}

		paste.content = content;
		if (redirectUrl !== undefined) paste.redirectUrl = redirectUrl;
		if (language !== undefined) paste.language = language;
		if (contentMode !== undefined) paste.contentMode = contentMode;

		if (visibility !== undefined) {
			paste.visibility = visibility;
			paste.markModified("visibility");
		}

		if (allowedUsers !== undefined) {
			paste.allowedUsers = allowedUsers;
			paste.markModified("allowedUsers");
		}

		if (password !== undefined) {
			paste.password = password;
		}

		if (editPermission !== undefined) {
			paste.editPermission = editPermission;
		}

		if (shareList !== undefined) {
			paste.shareList = shareList;
			paste.markModified("shareList");
		}

		if (publicRole !== undefined) {
			paste.publicRole = publicRole;
		}
		if (allowComments !== undefined) {
			paste.allowComments = allowComments;
		}
		if (expiresTime !== undefined) {
			paste.expiresTime = expiresTime;
		}
		if (expiresAt !== undefined && expiresAt !== null) {
			paste.expiresAt = expiresAt;
		}

		console.log(`[PasteService] Final Save Object for ${id}:`, {
			contentMode: paste.contentMode,
			language: paste.language,
			visibility: paste.visibility,
			redirectUrl: paste.redirectUrl,
			expiresTime: paste.expiresTime,
		});

		return await paste.save();
	}
	async isPasteExpired(id: string): Promise<boolean> {
		const paste = await pasteModel.findOne({ id });
		return paste ? new Date() > paste.expiresAt : false;
	}
	async getUserPastes(ownerId: string) {
		return await pasteModel
			.find({ owner: ownerId })
			.sort({ createdAt: -1 });
	}
	async addComment(id: string, comment: CommentData) {
		return await pasteModel.findOneAndUpdate(
			{ id },
			{ $push: { comments: comment } },
			{ new: true },
		);
	}
}

export default PasteService;
