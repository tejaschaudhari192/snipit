export interface CommentData {
	id: string;
	author: string;
	content: string;
	createdAt: string;
	userId?: string;
	user?: User;
}

export interface User {
	_id: string;
	username: string;
	email: string;
	createdAt?: string;
}

export interface PasteData {
	id: string;
	content: string;
	createdAt: string;
	expiresAt: string;
	contentMode?: "text" | "code" | "link" | "file";
	fileUrl?: string;
	fileName?: string;
	fileSize?: number;
	fileMimeType?: string;
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
	ownerData?: User;
	editPermission?: "owner" | "shared" | "public";
	shareList?: {
		email: string;
		role: "viewer" | "editor" | "admin" | "commenter";
	}[];
	publicRole?: "viewer" | "editor" | "commenter";
	allowComments?: boolean;
	comments?: CommentData[];
}

export type IdType = "system" | "dynamic";
