import type { IPaste } from "@/types/index.js";
import User from "@/models/User.js";

export type UserRole = "admin" | "editor" | "viewer" | "commenter";

class PermissionService {
	async getUserRole(
		userId: string | null,
		paste: IPaste,
	): Promise<UserRole> {
		let userEmail = null;
		if (userId) {
			const user = await User.findById(userId);
			if (user) userEmail = user.email;
		}

		const isOwner =
			paste.owner && userId && paste.owner.toString() === userId;
		const isAnonymousOwner = !paste.owner;

		if (isOwner || isAnonymousOwner) {
			return "admin";
		}

		let userRole: UserRole = "viewer";

		if (paste.shareList && userEmail) {
			const shareEntry = paste.shareList.find(
				(s: { email: string; role: string }) => s.email === userEmail,
			);
			if (shareEntry) {
				userRole = shareEntry.role as UserRole;
			}
		}

		if (
			userRole === "viewer" &&
			paste.allowedUsers &&
			userEmail &&
			paste.allowedUsers.includes(userEmail)
		) {
			userRole = "editor";
		}

		if (userRole === "viewer") {
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
		return ["admin", "editor", "viewer", "commenter"].includes(role);
	}

	async canEdit(userId: string | null, paste: IPaste): Promise<boolean> {
		const role = await this.getUserRole(userId, paste);
		return ["admin", "editor"].includes(role);
	}

	async canDelete(userId: string | null, paste: IPaste): Promise<boolean> {
		const role = await this.getUserRole(userId, paste);
		return role === "admin";
	}
}

export default PermissionService;
