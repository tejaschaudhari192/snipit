import type { IPaste } from "@/types/index.js";
import User from "@/models/User.js";
import Collaborator from "@/models/Collaborator.js";

export type UserRole = "admin" | "editor" | "viewer" | "commenter";

class PermissionService {
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

		// Check Collaborator collection for explicit permissions
		if (userId || paste.visibility === "shared") {
			const query: any = { pasteId: paste.id };

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

		// Check for explicit membership
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
		}

		// If explicitly invited, they can comment if their role is admin, editor, or commenter
		if (userRole) {
			return ["admin", "editor", "commenter"].includes(userRole);
		}

		// For public/non-explicit users, respect the allowComments master switch
		if (!paste.allowComments) return false;

		const role = await this.getUserRole(userId, paste);
		return role === "commenter" || role === "editor" || role === "admin";
	}
}

export default PermissionService;
