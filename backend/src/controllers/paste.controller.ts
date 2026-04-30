import type { NextFunction, Request, Response } from "express";
import type { Logger } from "winston";
import User from "@/models/User.js";
import type PasteService from "@/services/paste.service.js";
import type PermissionService from "@/services/permission.service.js";
import { uniqueIdGenerator } from "@/lib/utils.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";

class PasteController {
	constructor(
		private readonly pasteService: PasteService,
		private readonly permissionService: PermissionService,
		private readonly logger: Logger,
	) {}

	private getUserId(req: Request | AuthRequest): string | null {
		if ("user" in req && req.user) return req.user._id.toString();
		return null;
	}

	async createPaste(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const owner = this.getUserId(req);
			if (req.body.visibility && req.body.visibility !== "public" && !owner) {
				return res.status(401).json({ error: "Login required for private/shared pastes" });
			}

			const result = await this.pasteService.createPaste(req.body, owner);
			this.logger.info(`Created paste with id: ${result.id}`);
			return res.status(201).json(result.toObject());
		} catch (error: any) {
			if (error.message === "ID_ALREADY_EXISTS") {
				return res.status(409).json({ error: "ID already in use" });
			}
			next(error);
		}
	}

	async getPaste(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		try {
			const result = await this.pasteService.incrementViews(id);
			if (!result) return res.status(404).json({ error: "Paste not found" });

			if (result.expiresAt && new Date() > result.expiresAt) {
				await this.pasteService.deletePaste(id);
				return res.status(404).json({ error: "Paste expired" });
			}

			if (result.burnAfterRead && result.views > 3) {
				await this.pasteService.deletePaste(id);
				this.logger.info(`Paste burned after 3rd public read: ${id}`);
			}

			const userId = this.getUserId(req);
			const canView = await this.permissionService.canView(userId, result);

			if (!canView) {
				return res.status(403).json({ error: "Access denied. Private or Shared snippet." });
			}

			if (result.password) {
				const isOwner = result.owner && userId && result.owner.toString() === userId;
				if (!isOwner) {
					const { content: _, password: __, ...rest } = result.toObject();
					return res.json({ ...rest, isPasswordProtected: true });
				}
			}

			return res.json(result.toObject());
		} catch (error) {
			next(error);
		}
	}

	async deletePaste(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		try {
			const paste = await this.pasteService.getPasteById(id);
			if (!paste) return res.status(404).json({ error: "Paste not found" });

			const canDelete = await this.permissionService.canDelete(this.getUserId(req), paste);
			if (!canDelete) {
				return res.status(403).json({ error: "Unauthorized: You do not have permission to delete this paste" });
			}

			const result = await this.pasteService.deletePaste(id);
			return res.json(result);
		} catch (error) {
			next(error);
		}
	}

	async updatePaste(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		try {
			const paste = await this.pasteService.getPasteById(id);
			if (!paste) return res.status(404).json({ error: "Paste not found" });

			const role = await this.permissionService.getUserRole(this.getUserId(req), paste);
			if (role === "viewer" || role === "commenter") {
				return res.status(403).json({ error: "Unauthorized: You do not have permission to edit this paste" });
			}

			const updates = { ...req.body };
			if (role === "editor") {
				// Restricted fields for editors
				const restricted = ["visibility", "allowedUsers", "newId", "password", "editPermission", "shareList", "publicRole", "allowComments"];
				restricted.forEach(field => delete updates[field]);
			}

			const result = await this.pasteService.updatePaste(id, updates);
			return res.json(result!.toObject());
		} catch (error: any) {
			if (error.message === "ID_ALREADY_EXISTS") {
				return res.status(409).json({ error: "ID already in use" });
			}
			next(error);
		}
	}

	async getUserPastes(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = this.getUserId(req);
			if (!userId) return res.status(401).json({ error: "Unauthorized" });

			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;

			const result = await this.pasteService.getUserPastes(userId, page, limit);
			return res.json({
				...result,
				pastes: result.pastes.map((p) => p.toObject()),
			});
		} catch (error) {
			next(error);
		}
	}

	async verifyPassword(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		const { password } = req.body;
		try {
			const paste = await this.pasteService.getPasteById(id);
			if (!paste) return res.status(404).json({ error: "Paste not found" });
			if (!paste.password) return res.json(paste.toObject());

			const bcrypt = await import("bcryptjs");
			const isMatch = await bcrypt.compare(password, paste.password);

			if (isMatch) return res.json(paste.toObject());
			return res.status(401).json({ error: "Incorrect password" });
		} catch (error) {
			next(error);
		}
	}

	async addComment(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		const { content, author } = req.body;
		try {
			const paste = await this.pasteService.getPasteById(id);
			if (!paste) return res.status(404).json({ error: "Paste not found" });

			if (!paste.allowComments) {
				return res.status(403).json({ error: "Comments are disabled for this snippet" });
			}

			const role = await this.permissionService.getUserRole(this.getUserId(req), paste);
			if (!["admin", "editor", "commenter"].includes(role)) {
				return res.status(403).json({ error: "Unauthorized: You do not have permission to comment" });
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
			return res.status(201).json(result?.toObject());
		} catch (error) {
			next(error);
		}
	}
}

export default PasteController;

