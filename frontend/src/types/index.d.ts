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

export interface ActiveUser {
	socketId: string;
	name: string;
	color: string;
	isEditing: boolean;
	pasteId: string;
}

export interface CursorPosition {
	lineNumber: number;
	column: number;
}

export type ContentMode = "text" | "code" | "link" | "file";
export type Visibility = "public" | "private" | "shared";
export type EditPermission = "owner" | "shared" | "public";
export type PublicRole = "viewer" | "editor" | "commenter";
export type ShareRole = "viewer" | "editor" | "admin" | "commenter";

export interface PasteData {
	id: string;
	content: string;
	createdAt: string;
	expiresAt: string;
	contentMode?: ContentMode;
	fileUrl?: string;
	fileName?: string;
	fileSize?: number;
	fileMimeType?: string;
	redirectUrl?: boolean;
	language?: string;
	burnAfterRead?: boolean;
	expiresTime?: string;
	views: number;
	visibility?: Visibility;
	allowedUsers?: string[];
	isPasswordProtected?: boolean;
	password?: string;
	owner?: string;
	ownerData?: User;
	editPermission?: EditPermission;
	shareList?: {
		email: string;
		role: ShareRole;
	}[];
	publicRole?: PublicRole;
	allowComments?: boolean;
	comments?: CommentData[];
}

export type IdType = "system" | "dynamic";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
