import type { Document } from "mongoose";

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
};

// export type IPaste = Document & PasteData; // Removed duplicate

export type IUser = Document & {
	_id: string;
	username: string;
	email: string;
	password?: string;
	createdAt: Date;
};
