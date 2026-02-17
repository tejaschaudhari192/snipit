import type { Document } from "mongoose";

export type UserData = {
	_id: string;
	username: string;
	email: string;
	password?: string | undefined;
	createdAt: Date;
	resetPasswordToken?: string | undefined;
	resetPasswordExpires?: Date | undefined;
};

export type IUser = Document & UserData;

export type CommentData = {
	id: string;
	author: string;
	content: string;
	createdAt: Date;
	userId?: string | undefined;
	user?: UserData | undefined;
};

export type PasteData = {
	id: string;
	content: string;
	expiresAt: Date;
	createdAt: Date;
	contentMode?: ("text" | "code" | "link" | "file") | undefined;
	fileUrl?: string | undefined;
	fileName?: string | undefined;
	fileSize?: number | undefined;
	fileMimeType?: string | undefined;
	redirectUrl?: boolean | undefined;
	language?: string | undefined;
	burnAfterRead?: boolean | undefined;
	expiresTime?: string | undefined;
	views?: number | undefined;
	owner?: string | undefined;
	ownerData?: UserData | undefined;
	visibility?: ("public" | "private" | "shared") | undefined;
	allowedUsers?: string[] | undefined;
	password?: string | undefined;
	editPermission?: ("owner" | "shared" | "public") | undefined;
	shareList?:
		| { email: string; role: "viewer" | "editor" | "admin" | "commenter" }[]
		| undefined;
	publicRole?: "viewer" | "editor" | "commenter" | undefined;
	allowComments?: boolean | undefined;
	comments?: CommentData[] | undefined;
};

export type IPaste = Document & {
	id: string;
	content: string;
	expiresAt: Date;
	createdAt: Date;
	contentMode?: ("text" | "code" | "link" | "file") | undefined;
	fileUrl?: string | undefined;
	fileName?: string | undefined;
	fileSize?: number | undefined;
	fileMimeType?: string | undefined;
	redirectUrl?: boolean | undefined;
	language?: string | undefined;
	burnAfterRead?: boolean | undefined;
	expiresTime?: string | undefined;
	views: number;
	owner?: string | undefined; // User ID
	ownerData?: UserData | undefined; // Populated User
	visibility?: ("public" | "private" | "shared") | undefined;
	allowedUsers?: string[] | undefined;
	password?: string | undefined;
	editPermission?: ("owner" | "shared" | "public") | undefined;
	shareList?:
		| { email: string; role: "viewer" | "editor" | "admin" | "commenter" }[]
		| undefined;
	publicRole?: "viewer" | "editor" | "commenter" | undefined;
	allowComments?: boolean | undefined;
	comments?: CommentData[] | undefined;
};
