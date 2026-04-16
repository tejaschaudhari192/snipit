import pasteModel from "@/models/Paste.js";
import type {
	PasteData,
	CommentData,
	ContentMode,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
	UpdatePasteData,
} from "@/types/index.js";

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
	async updatePaste(id: string, data: UpdatePasteData) {
		const paste = await pasteModel.findOne({ id });
		if (!paste) return null;

		const { newId, ...updates } = data;

		// If changing ID, check if new ID is already taken
		if (newId && newId !== id) {
			const existing = await pasteModel.findOne({ id: newId });
			if (existing) {
				throw new Error("ID_ALREADY_EXISTS");
			}
			paste.id = newId;
		}

		// Apply updates using Mongoose set()
		// This handles casting and only updates fields present in the object
		paste.set(updates);

		console.log(`[PasteService] Saving update for ${id}:`, updates);
		return await paste.save();
	}
	async isPasteExpired(id: string): Promise<boolean> {
		const paste = await pasteModel.findOne({ id }).lean();
		return paste && paste.expiresAt ? new Date() > paste.expiresAt : false;
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
}

export default PasteService;
