import type { Response, NextFunction } from "express";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import type PasteService from "@/services/paste.service.js";
import type PermissionService from "@/services/permission.service.js";
import User from "@/models/User.js";
import Collaborator from "@/models/Collaborator.js";
import folderModel from "@/models/Folder.js";
import pasteModel from "@/models/Paste.js";
import logger from "@/config/logger.js";
import { ROLES } from "@/config/constants.js";
import mongoose from "mongoose";

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

			const user = await User.findOne({ email: email.toLowerCase() });
			await this.pasteService.addCollaborators(id, [
				{ email: email.toLowerCase(), role },
			]);

			logger.info(
				`Collaborator ${email} added to paste ${id} with role ${role}`,
			);

			if (this.pasteService.sendShareEmails) {
				await this.pasteService.sendShareEmails(paste, [
					{ email, role },
				]);
			}

			const saved = await Collaborator.findOne({
				pasteId: id,
				email: email.toLowerCase(),
			});

			return res.status(201).json({
				id: saved?._id,
				_id: saved?._id,
				email: email.toLowerCase(),
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

	async addFolderCollaborator(
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) {
		const folderId = req.params.folderId as string;
		const { email, role } = req.body;
		try {
			if (!email || !role || !ROLES.includes(role)) {
				return res
					.status(400)
					.json({ error: "Valid email and role are required" });
			}

			const userId = this.getUserId(req);
			const folderRole = await this.permissionService.getFolderRole(
				userId,
				folderId,
			);

			if (folderRole !== "admin") {
				return res.status(403).json({
					error: "Unauthorized: Only admins can manage folder collaborators",
				});
			}

			const normalizedEmail = String(email).trim().toLowerCase();
			const targetUser = await User.findOne({ email: normalizedEmail });

			const collaborator = await Collaborator.findOneAndUpdate(
				{
					folderId: new mongoose.Types.ObjectId(folderId),
					email: normalizedEmail,
				},
				{
					resourceType: "folder",
					userId: targetUser?._id || undefined,
					role,
				},
				{ upsert: true, new: true },
			);

			logger.info(
				`Collaborator ${normalizedEmail} added to folder ${folderId} with role ${role}`,
			);

			return res.status(201).json({
				id: collaborator._id,
				_id: collaborator._id,
				email: normalizedEmail,
				role: collaborator.role,
				userId: targetUser?._id || undefined,
			});
		} catch (error) {
			next(error);
		}
	}

	async removeFolderCollaborator(
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) {
		const folderId = req.params.folderId as string;
		const { email } = req.body;
		try {
			const userId = this.getUserId(req);
			const folderRole = await this.permissionService.getFolderRole(
				userId,
				folderId,
			);

			if (folderRole !== "admin") {
				return res.status(403).json({
					error: "Unauthorized: Only admins can manage folder collaborators",
				});
			}

			const normalizedEmail = String(email).trim().toLowerCase();
			await Collaborator.deleteOne({
				folderId: new mongoose.Types.ObjectId(folderId),
				email: normalizedEmail,
			});

			logger.info(
				`Collaborator ${normalizedEmail} removed from folder ${folderId}`,
			);
			return res.json({ success: true, email: normalizedEmail });
		} catch (error) {
			next(error);
		}
	}

	async getFolderCollaborators(
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) {
		const folderId = req.params.folderId as string;
		try {
			const userId = this.getUserId(req);
			const folderRole = await this.permissionService.getFolderRole(
				userId,
				folderId,
			);

			if (folderRole !== "admin") {
				return res.status(403).json({
					error: "Unauthorized: Only admins can view folder collaborators",
				});
			}

			const collaborators = await Collaborator.find({
				folderId: new mongoose.Types.ObjectId(folderId),
			}).populate("userId", "username email avatar");

			return res.json(collaborators);
		} catch (error) {
			next(error);
		}
	}

	async updateCollaboratorRole(
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) {
		const collaboratorId = req.params.collaboratorId as string;
		const { role } = req.body;
		try {
			if (!role || !ROLES.includes(role)) {
				return res.status(400).json({ error: "Invalid role" });
			}

			const collaborator = await Collaborator.findById(collaboratorId);
			if (!collaborator) {
				return res
					.status(404)
					.json({ error: "Collaborator record not found" });
			}

			const userId = this.getUserId(req);
			let isAdmin = false;

			if (collaborator.folderId) {
				const folderRole = await this.permissionService.getFolderRole(
					userId,
					collaborator.folderId.toString(),
				);
				isAdmin = folderRole === "admin";
			} else if (collaborator.pasteId) {
				const paste = await this.pasteService.getPasteById(
					collaborator.pasteId,
				);
				if (paste) {
					const pasteRole = await this.permissionService.getUserRole(
						userId,
						paste,
					);
					isAdmin = pasteRole === "admin";
				}
			}

			if (!isAdmin) {
				return res.status(403).json({
					error: "Unauthorized: Only admins can update collaborator roles",
				});
			}

			collaborator.role = role;
			await collaborator.save();

			return res.json(collaborator);
		} catch (error) {
			next(error);
		}
	}

	async getSharedItems(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = this.getUserId(req);
			if (!userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const user = await User.findById(userId);
			if (!user) {
				return res.status(401).json({ error: "User not found" });
			}

			// 1. Shared with me
			const incomingCollabs = await Collaborator.find({
				$or: [{ userId: user._id }, { email: user.email }],
			});

			const folderRoleMap = new Map<string, string>();
			const pasteRoleMap = new Map<string, string>();

			for (const col of incomingCollabs) {
				if (col.folderId) {
					folderRoleMap.set(col.folderId.toString(), col.role);
				} else if (col.pasteId) {
					pasteRoleMap.set(col.pasteId, col.role);
				}
			}

			const sharedWithMeFoldersRaw = await folderModel
				.find({
					_id: {
						$in: Array.from(folderRoleMap.keys()).map(
							(id) => new mongoose.Types.ObjectId(id),
						),
					},
					owner: { $ne: user._id },
				})
				.populate("owner", "username email avatar")
				.sort({ createdAt: -1 });

			const sharedWithMeFolders = sharedWithMeFoldersRaw.map((f) => ({
				...f.toObject(),
				sharedRole: folderRoleMap.get(f._id.toString()) || "viewer",
			}));

			const now = new Date();
			const sharedWithMePastesRaw = await pasteModel
				.find({
					id: { $in: Array.from(pasteRoleMap.keys()) },
					owner: { $ne: user._id },
					$or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
				})
				.populate("owner", "username email avatar")
				.sort({ createdAt: -1 });

			const sharedWithMePastes = sharedWithMePastesRaw.map((p) => ({
				...p.toObject(),
				sharedRole: pasteRoleMap.get(p.id) || "viewer",
			}));

			// 2. Shared by me
			const myFolders = await folderModel
				.find({ owner: user._id })
				.sort({ createdAt: -1 });
			const myFolderIds = myFolders.map((f) => f._id);

			const folderCollabs = await Collaborator.find({
				folderId: { $in: myFolderIds },
			});
			const folderCollabCount = new Map<string, number>();
			for (const fc of folderCollabs) {
				if (fc.folderId) {
					const fid = fc.folderId.toString();
					folderCollabCount.set(
						fid,
						(folderCollabCount.get(fid) || 0) + 1,
					);
				}
			}

			const sharedByMeFolders = myFolders
				.filter((f) => folderCollabCount.has(f._id.toString()))
				.map((f) => ({
					...f.toObject(),
					collaboratorCount:
						folderCollabCount.get(f._id.toString()) || 0,
				}));

			const myPastes = await pasteModel
				.find({
					owner: user._id,
					$or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
				})
				.sort({ createdAt: -1 });
			const myPasteIds = myPastes.map((p) => p.id);

			const pasteCollabs = await Collaborator.find({
				pasteId: { $in: myPasteIds },
			});
			const pasteCollabCount = new Map<string, number>();
			for (const pc of pasteCollabs) {
				if (pc.pasteId) {
					pasteCollabCount.set(
						pc.pasteId,
						(pasteCollabCount.get(pc.pasteId) || 0) + 1,
					);
				}
			}

			const sharedByMePastes = myPastes
				.filter((p) => pasteCollabCount.has(p.id))
				.map((p) => ({
					...p.toObject(),
					collaboratorCount: pasteCollabCount.get(p.id) || 0,
				}));

			return res.json({
				sharedWithMe: {
					folders: sharedWithMeFolders,
					pastes: sharedWithMePastes,
				},
				sharedByMe: {
					folders: sharedByMeFolders,
					pastes: sharedByMePastes,
				},
			});
		} catch (error) {
			next(error);
		}
	}
}

export default CollaboratorController;
