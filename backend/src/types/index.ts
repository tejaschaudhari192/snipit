import type { Document } from "mongoose";

export type CommentData = {
	id: string;
	author: string;
	content: string;
	createdAt: Date;
	userId?: string;
};

export type PasteData = {
	id: string;
	content: string;
	expiresAt: Date;
	createdAt: Date;
	redirectUrl?: boolean | undefined;
	language?: string | undefined;
	burnAfterRead?: boolean | undefined;
	expiresTime?: string | undefined;
	views?: number | undefined;
	owner?: string | undefined;
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
	redirectUrl?: boolean | undefined;
	language?: string | undefined;
	burnAfterRead?: boolean | undefined;
	expiresTime?: string | undefined;
	views: number;
	owner?: string | undefined; // User ID
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

// export type IPaste = Document & PasteData; // Removed duplicate

export type IUser = Document & {
	_id: string;
	username: string;
	email: string;
	password?: string;
	createdAt: Date;
};
