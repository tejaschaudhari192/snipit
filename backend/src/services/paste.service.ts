import pasteModel from "@/models/Paste.js";
import type { PasteData } from "@/types/index.js";

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
		visibility?: string,
		allowedUsers?: string[],
	) {
		const paste = await pasteModel.findOne({ id });
		if (!paste) return null;

		paste.content = content;
		if (redirectUrl !== undefined) paste.redirectUrl = redirectUrl;
		if (language !== undefined) paste.language = language;

		if (visibility !== undefined) {
			paste.visibility = visibility as any;
			paste.markModified("visibility");
		}

		if (allowedUsers !== undefined) {
			paste.allowedUsers = allowedUsers;
			paste.markModified("allowedUsers");
		}

		return await paste.save();
	}
	async isPasteExpired(id: string): Promise<boolean> {
		const paste = await pasteModel.findOne({ id });
		return paste ? new Date() > paste.expiresAt : false;
	}
}

export default PasteService;
