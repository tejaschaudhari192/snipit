import type { Response, NextFunction } from "express";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import type PasteService from "@/services/paste.service.js";
import type PermissionService from "@/services/permission.service.js";
import logger from "@/config/logger.js";
import { uniqueIdGenerator } from "@/lib/utils.js";
import User from "@/models/User.js";

class CommentController {
	constructor(
		private readonly pasteService: PasteService,
		private readonly permissionService: PermissionService,
	) {}

	private getUserId(req: AuthRequest): string | null {
		if (req.user) return req.user._id.toString();
		return null;
	}

	async addComment(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		const { content, author } = req.body;
		try {
			const paste = await this.pasteService.getPasteById(id);
			if (!paste)
				return res.status(404).json({ error: "Paste not found" });

			const canComment = await this.permissionService.canComment(
				this.getUserId(req),
				paste,
			);

			if (!canComment) {
				if (!paste.allowComments) {
					return res.status(403).json({
						error: "Comments are disabled for this snippet",
					});
				}
				return res.status(403).json({
					error: "Unauthorized: You do not have permission to comment",
				});
			}

			const userId = this.getUserId(req);
			let finalAuthor: string = author || "Anonymous";

			if (userId && !author) {
				const user = await User.findById(userId);
				if (user) finalAuthor = user.username || user.email;
			}

			const comment = {
				id: uniqueIdGenerator(),
				author: finalAuthor,
				content: content as string,
				createdAt: new Date(),
				userId: userId || undefined,
			};

			const result = await this.pasteService.addComment(id, comment);
			logger.info(`Comment added to paste ${id} by ${finalAuthor}`);
			return res.status(201).json(result.toObject());
		} catch (error) {
			logger.error(`Failed to add comment to paste ${id}`, { error });
			next(error);
		}
	}

	async getComments(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		try {
			const comments = await this.pasteService.getCommentsByPasteId(id);
			return res.json(comments);
		} catch (error) {
			next(error);
		}
	}

	async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
		const pasteId = req.params.id as string;
		const commentId = req.params.commentId as string;
		const { content } = req.body;
		try {
			const userId = this.getUserId(req);
			if (!userId) return res.status(401).json({ error: "Unauthorized" });

			const comments = await this.pasteService.getCommentsByPasteId(pasteId);
			const comment = comments.find(c => c.id === commentId);
			if (!comment) return res.status(404).json({ error: "Comment not found" });

			if (comment.userId !== userId) {
				return res.status(403).json({ error: "Forbidden: You can only edit your own comments" });
			}

			const updated = await this.pasteService.updateComment(pasteId, commentId, content);
			return res.json(updated);
		} catch (error) {
			logger.error(`Failed to update comment ${commentId} on paste ${pasteId}`, { error });
			next(error);
		}
	}

	async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
		const pasteId = req.params.id as string;
		const commentId = req.params.commentId as string;
		try {
			const userId = this.getUserId(req);
			if (!userId) return res.status(401).json({ error: "Unauthorized" });

			const comments = await this.pasteService.getCommentsByPasteId(pasteId);
			const comment = comments.find(c => c.id === commentId);
			if (!comment) return res.status(404).json({ error: "Comment not found" });

			const paste = await this.pasteService.getPasteById(pasteId);
			const isPasteOwner = paste && paste.owner && paste.owner.toString() === userId;

			if (comment.userId !== userId && !isPasteOwner) {
				return res.status(403).json({ error: "Forbidden: You can only delete your own comments" });
			}

			await this.pasteService.deleteComment(pasteId, commentId);
			return res.json({ success: true });
		} catch (error) {
			logger.error(`Failed to delete comment ${commentId} on paste ${pasteId}`, { error });
			next(error);
		}
	}
}

export default CommentController;
