import type { IPaste, UserRole } from "@/types/index.js";
import type { FilterQuery } from "mongoose";
import mongoose from "mongoose";
import type { ICollaborator } from "@/models/Collaborator.js";
import User from "@/models/User.js";
import Collaborator from "@/models/Collaborator.js";
import folderModel from "@/models/Folder.js";

const ROLE_PRIORITY: Record<UserRole, number> = {
	admin: 4,
	editor: 3,
	commenter: 2,
	viewer: 1,
};

function higherRole(a: UserRole | null, b: UserRole | null): UserRole | null {
	if (!a) return b;
	if (!b) return a;
	return ROLE_PRIORITY[a] >= ROLE_PRIORITY[b] ? a : b;
}

class PermissionService {
	async getFolderRole(
		userId: string | null,
		folderId: string,
	): Promise<UserRole | null> {
		if (!userId || !mongoose.Types.ObjectId.isValid(folderId)) return null;

		const folder = await folderModel.findById(folderId);
		if (!folder) return null;

		if (folder.owner && folder.owner.toString() === userId) {
			return "admin";
		}

		const user = await User.findById(userId);
		if (!user) return null;

		// Check folder and all ancestor folders in its path (e.g. ",id1,id2,")
		const ancestorIds = folder.path
			? folder.path
					.split(",")
					.filter((id) => id && mongoose.Types.ObjectId.isValid(id))
					.map((id) => new mongoose.Types.ObjectId(id))
			: [];

		const folderIdsToCheck = [
			new mongoose.Types.ObjectId(folderId),
			...ancestorIds,
		];

		const collaborators = await Collaborator.find({
			folderId: { $in: folderIdsToCheck },
			$or: [{ userId: user._id }, { email: user.email }],
		});

		let bestRole: UserRole | null = null;
		for (const col of collaborators) {
			bestRole = higherRole(bestRole, col.role as UserRole);
		}

		return bestRole;
	}

	async getUserRole(
		userId: string | null,
		paste: IPaste,
	): Promise<UserRole | null> {
		const isOwner =
			paste.owner && userId && paste.owner.toString() === userId;

		if (isOwner) {
			return "admin";
		}

		let userRole: UserRole | null = null;

		// Check Collaborator collection for explicit paste permissions
		if (userId || paste.visibility === "shared") {
			const query: FilterQuery<ICollaborator> = { pasteId: paste.id };

			if (userId) {
				const user = await User.findById(userId);
				if (user) {
					query.$or = [{ userId: user._id }, { email: user.email }];
				}
			}

			const collaborator = await Collaborator.findOne(query);
			if (collaborator) {
				userRole = collaborator.role as UserRole;
			}
		}

		// Inherit permissions from parent folder hierarchy if applicable
		if (userId && paste.folderId) {
			const folderRole = await this.getFolderRole(
				userId,
				paste.folderId.toString(),
			);
			userRole = higherRole(userRole, folderRole);
		}

		if (!userRole) {
			if (paste.editPermission === "public") {
				userRole = "editor";
			} else if (
				paste.visibility === "public" ||
				paste.visibility === "shared"
			) {
				userRole = (paste.publicRole as UserRole) || "viewer";
			}
		}

		return userRole;
	}

	async canView(userId: string | null, paste: IPaste): Promise<boolean> {
		if (paste.visibility === "public") return true;
		const role = await this.getUserRole(userId, paste);
		if (!role) return false;
		return ["admin", "editor", "viewer", "commenter"].includes(role);
	}

	async canEdit(userId: string | null, paste: IPaste): Promise<boolean> {
		const role = await this.getUserRole(userId, paste);
		if (!role) return false;
		return ["admin", "editor"].includes(role);
	}

	async canDelete(userId: string | null, paste: IPaste): Promise<boolean> {
		const role = await this.getUserRole(userId, paste);
		if (!role) return false;
		return role === "admin";
	}

	async canComment(userId: string | null, paste: IPaste): Promise<boolean> {
		const isOwner =
			paste.owner && userId && paste.owner.toString() === userId;

		if (isOwner) return true;

		// Check for explicit membership (paste or folder)
		let userRole: UserRole | null = null;
		if (userId) {
			const user = await User.findById(userId);
			if (user) {
				const collaborator = await Collaborator.findOne({
					pasteId: paste.id,
					$or: [{ userId: user._id }, { email: user.email }],
				});
				if (collaborator) {
					userRole = collaborator.role as UserRole;
				}
			}
			if (paste.folderId) {
				const folderRole = await this.getFolderRole(
					userId,
					paste.folderId.toString(),
				);
				userRole = higherRole(userRole, folderRole);
			}
		}

		// If explicitly invited, they can comment if their role is admin, editor, or commenter
		if (userRole) {
			return ["admin", "editor", "commenter"].includes(userRole);
		}

		// For public/non-explicit users, respect the allowComments master switch
		if (!paste.allowComments) return false;

		const role = await this.getUserRole(userId, paste);
		return ["admin", "editor", "commenter", "viewer"].includes(
			role as UserRole,
		);
	}
}

export default PermissionService;
