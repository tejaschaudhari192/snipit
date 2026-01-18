export interface Comment {
	id: string;
	author: string;
	content: string;
	createdAt: string;
	userId?: string;
}

export interface PasteData {
	id: string;
	content: string;
	createdAt: string;
	expiresAt: string;
	redirectUrl?: boolean;
	language?: string;
	burnAfterRead?: boolean;
	expiresTime?: string;
	views: number;
	visibility?: "public" | "private" | "shared";
	allowedUsers?: string[];
	isPasswordProtected?: boolean;
	password?: string;
	owner?: string;
	editPermission?: "owner" | "shared" | "public";
	shareList?: {
		email: string;
		role: "viewer" | "editor" | "admin" | "commenter";
	}[];
	publicRole?: "viewer" | "editor" | "commenter";
	allowComments?: boolean;
	comments?: Comment[];
}

export type IdType = "system" | "dynamic";
