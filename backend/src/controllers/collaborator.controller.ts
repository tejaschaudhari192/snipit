import type { Response, NextFunction } from "express";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import type PasteService from "@/services/paste.service.js";
import type PermissionService from "@/services/permission.service.js";
import User from "@/models/User.js";
import logger from "@/config/logger.js";

class CollaboratorController {
	constructor(
		private readonly pasteService: PasteService,
		private readonly permissionService: PermissionService,
	) {}

	private getUserId(req: AuthRequest): string | null {
		if (req.user) return req.user._id.toString();
		return null;
	}

	async addCollaborator(req: AuthRequest, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		const { email, role } = req.body;
		try {
			const paste = await this.pasteService.getPasteById(id);
			if (!paste)
				return res.status(404).json({ error: "Paste not found" });

			const userRole = await this.permissionService.getUserRole(
				this.getUserId(req),
				paste,
			);

			if (userRole !== "admin") {
				return res.status(403).json({
					error: "Unauthorized: Only admins can manage collaborators",
				});
			}

			const user = await User.findOne({ email });
			await this.pasteService.addCollaborators(id, [{ email, role }]);

			logger.info(
				`Collaborator ${email} added to paste ${id} with role ${role}`,
			);

			if (this.pasteService.sendShareEmails) {
				await this.pasteService.sendShareEmails(paste, [
					{ email, role },
				]);
			}

			return res.status(201).json({
				email,
				role,
				userId: user?._id || undefined,
			});
		} catch (error: unknown) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code === 11000
			) {
				return res
					.status(409)
					.json({ error: "User is already a collaborator" });
			}
			next(error);
		}
	}

	async removeCollaborator(
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) {
		const id = req.params.id as string;
		const { email } = req.body;
		try {
			const paste = await this.pasteService.getPasteById(id);
			if (!paste)
				return res.status(404).json({ error: "Paste not found" });

			const userRole = await this.permissionService.getUserRole(
				this.getUserId(req),
				paste,
			);

			if (userRole !== "admin") {
				return res.status(403).json({
					error: "Unauthorized: Only admins can manage collaborators",
				});
			}

			// In a real app, we'd have a specific service method for removing a single collaborator
			// For now, we'll assume we can use a direct model call or add a service method.
			// Let's add it to PasteService if needed, but for now we can do it here if we have the model.
			// Actually, PasteService is already imported.

			await this.pasteService.removeCollaborator(id, email);
			logger.info(`Collaborator ${email} removed from paste ${id}`);
			return res.json({ success: true, email });
		} catch (error) {
			logger.error(
				`Failed to remove collaborator ${email} from paste ${id}`,
				{ error },
			);
			next(error);
		}
	}

	async getCollaborators(
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) {
		const id = req.params.id as string;
		try {
			const collaborators =
				await this.pasteService.getCollaboratorsByPasteId(id);
			return res.json(collaborators);
		} catch (error) {
			next(error);
		}
	}
}

export default CollaboratorController;
