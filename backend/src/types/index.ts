import type { Document } from "mongoose";

export type ContentMode = "text" | "code" | "draw" | "link" | "file";
export type Visibility = "public" | "private" | "shared";
export type EditPermission = "owner" | "shared" | "public";
export type PublicRole = "viewer" | "editor" | "commenter";
export type ShareRole = "viewer" | "editor" | "admin" | "commenter";

export interface CursorPosition {
	lineNumber: number;
	column: number;
}

export interface ActiveUser {
	socketId: string;
	name: string;
	color: string;
	isEditing: boolean;
	pasteId: string;
}

export type UserData = {
	_id: string;
	username: string;
	email: string;
	password?: string | undefined;
	googleId?: string | undefined;
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

export type CollaboratorData = {
	pasteId: string;
	email: string;
	userId?: string | undefined;
	role: ShareRole;
	createdAt: Date;
};

export type PasteData = {
	id: string;
	content: string;
	expiresAt: Date | null;
	createdAt: Date;
	contentMode?: ContentMode | undefined;
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
	visibility?: Visibility | undefined;
	password?: string | undefined;
	editPermission?: EditPermission | undefined;
	collaborators?: CollaboratorData[] | undefined;
	publicRole?: PublicRole | undefined;
	allowComments?: boolean | undefined;
};

export interface UpdatePasteData {
	content?: string | undefined;
	redirectUrl?: boolean | undefined;
	language?: string | undefined;
	visibility?: Visibility | undefined;
	publicRole?: PublicRole | undefined;
	allowComments?: boolean | undefined;
	collaborators?:
		| {
				email: string;
				role: ShareRole;
		  }[]
		| undefined;
	expiresTime?: string | undefined;
	expiresAt?: Date | null | undefined;
	contentMode?: ContentMode | undefined;
	fileUrl?: string | null | undefined;
	fileName?: string | null | undefined;
	fileSize?: number | null | undefined;
	fileMimeType?: string | null | undefined;
	newId?: string | undefined;
	password?: string | undefined;
	editPermission?: EditPermission | undefined;
}

export type IPaste = Document & {
	id: string;
	content: string;
	expiresAt: Date | null;
	createdAt: Date;
	contentMode?: ContentMode | undefined;
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
	visibility?: Visibility | undefined;
	password?: string | undefined;
	editPermission?: EditPermission | undefined;
	collaborators?: CollaboratorData[] | undefined;
	publicRole?: PublicRole | undefined;
	allowComments?: boolean | undefined;
};
