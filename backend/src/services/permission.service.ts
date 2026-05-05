import type { IPaste } from "@/types/index.js";
import User from "@/models/User.js";

export type UserRole = "admin" | "editor" | "viewer" | "commenter";

class PermissionService {
	async getUserRole(
		userId: string | null,
		paste: IPaste,
	): Promise<UserRole | null> {
		let userEmail = null;
		if (userId) {
			const user = await User.findById(userId);
			if (user) userEmail = user.email;
		}

		const isOwner =
			paste.owner && userId && paste.owner.toString() === userId;

		if (isOwner) {
			return "admin";
		}

		let userRole: UserRole | null = null;

		if (paste.shareList && userEmail) {
			const shareEntry = paste.shareList.find(
				(s: { email: string; role: string }) => s.email === userEmail,
			);
			if (shareEntry) {
				userRole = shareEntry.role as UserRole;
			}
		}

		if (
			(!userRole || userRole === "viewer") &&
			paste.allowedUsers &&
			userEmail &&
			paste.allowedUsers.includes(userEmail)
		) {
			userRole = "editor";
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
		let userEmail = null;
		if (userId) {
			const user = await User.findById(userId);
			if (user) userEmail = user.email;
		}

		const isOwner =
			paste.owner && userId && paste.owner.toString() === userId;

		if (isOwner) return true;

		// Check for explicit membership (Specific People)
		let hasExplicitRole = false;
		let explicitRole: UserRole | null = null;

		if (paste.shareList && userEmail) {
			const shareEntry = paste.shareList.find(
				(s: { email: string; role: string }) => s.email === userEmail,
			);
			if (shareEntry) {
				hasExplicitRole = true;
				explicitRole = shareEntry.role as UserRole;
			}
		}

		if (
			!hasExplicitRole &&
			paste.allowedUsers &&
			userEmail &&
			paste.allowedUsers.includes(userEmail)
		) {
			hasExplicitRole = true;
			explicitRole = "editor";
		}

		// If explicitly invited, they can comment if their role is admin, editor, or commenter
		if (hasExplicitRole && explicitRole) {
			return ["admin", "editor", "commenter"].includes(explicitRole);
		}

		// For public/non-explicit users, respect the allowComments master switch
		if (!paste.allowComments) return false;

		const role = await this.getUserRole(userId, paste);
		return role === "commenter" || role === "editor" || role === "admin";
	}
}

export default PermissionService;
