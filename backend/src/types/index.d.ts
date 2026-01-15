import type { Document } from "mongoose";

export type PasteData = {
	id: string;
	content: string;
	expiresAt: Date;
	createdAt: Date;
	redirectUrl?: boolean;
	language?: string;
	burnAfterRead?: boolean;
	expiresTime?: string;
	views: number;
	visibility?: "public" | "private" | "shared";
	allowedUsers?: string[];
};

export type IPaste = Document & {
	id: string;
	content: string;
	expiresAt: Date;
	createdAt: Date;
	redirectUrl?: boolean;
	language?: string;
	burnAfterRead?: boolean;
	expiresTime?: string;
	views: number;
	owner?: string; // User ID
	visibility?: "public" | "private" | "shared";
	allowedUsers?: string[];
};

// export type IPaste = Document & PasteData; // Removed duplicate

export type IUser = Document & {
	_id: string;
	username: string;
	email: string;
	password?: string;
	createdAt: Date;
};
