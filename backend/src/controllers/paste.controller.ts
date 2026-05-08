import type { NextFunction, Response } from "express";
import type { Logger } from "winston";
import User from "@/models/User.js";
import { type ICollaborator } from "@/models/Collaborator.js";
import type PasteService from "@/services/paste.service.js";
import type PermissionService from "@/services/permission.service.js";
import { uniqueIdGenerator } from "@/lib/utils.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import type { IPaste } from "@/types/index.js";

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
			if (
				req.body.visibility &&
				req.body.visibility !== "public" &&
				!owner
			) {
				return res.status(401).json({
					error: "Login required for private/shared pastes",
				});
			}

			const result = await this.pasteService.createPaste(req.body, owner);
			this.logger.info(`Created paste with id: ${result.id}`);
			return res.status(201).json(result.toObject());
		} catch (error: unknown) {
			if (
				error instanceof Error &&
				error.message === "ID_ALREADY_EXISTS"
			) {
				return res.status(409).json({ error: "ID already in use" });
			}
			next(error);
		}
	}

	async getPaste(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		try {
			const result = await this.pasteService.incrementViews(id);
			if (!result)
				return res.status(404).json({ error: "Paste not found" });

			if (result.expiresAt && new Date() > result.expiresAt) {
				await this.pasteService.deletePaste(id);
				return res.status(404).json({ error: "Paste expired" });
			}

			if (result.burnAfterRead && result.views > 3) {
				await this.pasteService.deletePaste(id);
				this.logger.info(`Paste burned after 3rd public read: ${id}`);
			}

			const userId = this.getUserId(req);
			const canView = await this.permissionService.canView(
				userId,
				result,
			);

			if (!canView) {
				return res.status(403).json({
					error: "Access denied. Private or Shared snippet.",
				});
			}

			const role = await this.permissionService.getUserRole(
				userId,
				result,
			);
			const pasteObj = result.toObject();

			// Fetch collaborators separately
			const collaborators =
				await this.pasteService.getCollaboratorsByPasteId(id);

			// Filter collaborators based on role: only admins see everyone, others only see themselves
			let filteredCollaborators: ICollaborator[] = [];
			if (role === "admin") {
				filteredCollaborators = collaborators;
			} else if (userId) {
				const user = await User.findById(userId);
				if (user) {
					filteredCollaborators = collaborators.filter(
						(c: ICollaborator) =>
							c.email === user.email ||
							(c.userId && c.userId.toString() === userId),
					);
				}
			}

			// Fetch comments for this paste
			const comments = await this.pasteService.getCommentsByPasteId(id);
			const responseData = {
				...pasteObj,
				role,
				comments,
				collaborators: filteredCollaborators,
			};

			if (result.password) {
				const isOwner = role === "admin";
				if (!isOwner) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { content, password, ...rest } = responseData;
					return res.json({ ...rest, isPasswordProtected: true });
				}
			}

			return res.json(responseData);
		} catch (error) {
			next(error);
		}
	}

	async deletePaste(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		try {
			const paste = await this.pasteService.getPasteById(id);
			if (!paste)
				return res.status(404).json({ error: "Paste not found" });

			const canDelete = await this.permissionService.canDelete(
				this.getUserId(req),
				paste,
			);
			if (!canDelete) {
				return res.status(403).json({
					error: "Unauthorized: You do not have permission to delete this paste",
				});
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
			if (!paste)
				return res.status(404).json({ error: "Paste not found" });

			const userId = this.getUserId(req);
			const canEdit = await this.permissionService.canEdit(userId, paste);
			if (!canEdit) {
				return res.status(403).json({
					error: "Unauthorized: You do not have permission to edit this paste",
				});
			}

			const role = (await this.permissionService.getUserRole(
				userId,
				paste,
			))!;

			const updates = { ...req.body };
			if (role === "editor") {
				// Restricted fields for editors
				const restricted = [
					"visibility",
					"newId",
					"password",
					"editPermission",
					"collaborators",
					"publicRole",
					"allowComments",
				];
				restricted.forEach((field) => delete updates[field]);
			}

			const result = await this.pasteService.updatePaste(id, updates);
			return res.json(result!.toObject());
		} catch (error: unknown) {
			if (
				error instanceof Error &&
				error.message === "ID_ALREADY_EXISTS"
			) {
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

			const result = await this.pasteService.getUserPastes(
				userId,
				page,
				limit,
			);
			return res.json({
				...result,
				pastes: result.pastes.map((p: IPaste) =>
					p.toObject ? p.toObject() : p,
				),
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
			if (!paste)
				return res.status(404).json({ error: "Paste not found" });

			const userId = this.getUserId(req);
			const canView = await this.permissionService.canView(userId, paste);
			if (!canView) {
				return res.status(403).json({
					error: "Access denied. Private or Shared snippet.",
				});
			}

			const role = await this.permissionService.getUserRole(
				userId,
				paste,
			);
			const pasteObj = paste.toObject();

			// Fetch collaborators
			const collaborators =
				await this.pasteService.getCollaboratorsByPasteId(id);

			let filteredCollaborators: ICollaborator[] = [];
			if (role === "admin") {
				filteredCollaborators = collaborators;
			} else if (userId) {
				const user = await User.findById(userId);
				if (user) {
					filteredCollaborators = collaborators.filter(
						(c: ICollaborator) =>
							c.email === user.email ||
							(c.userId && c.userId.toString() === userId),
					);
				}
			}

			// Fetch comments for this paste
			const comments = await this.pasteService.getCommentsByPasteId(id);
			const responseData = {
				...pasteObj,
				role,
				comments,
				collaborators: filteredCollaborators,
			};

			if (!paste.password) return res.json(responseData);

			const bcrypt = await import("bcryptjs");
			const isMatch = await bcrypt.compare(password, paste.password);

			if (isMatch) return res.json(responseData);
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
			return res.status(201).json(result?.toObject());
		} catch (error) {
			next(error);
		}
	}

	async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = this.getUserId(req);
			if (!userId) return res.status(401).json({ error: "Unauthorized" });

			const stats = await this.pasteService.getUserStats(userId);
			return res.json(stats);
		} catch (error) {
			next(error);
		}
	}
}

export default PasteController;
