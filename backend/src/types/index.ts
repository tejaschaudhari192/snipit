import type { Document } from "mongoose";

export type ContentMode = "text" | "code" | "draw" | "link" | "file" | "video";
export type Visibility = "public" | "private" | "shared";
export type EditPermission = "owner" | "shared" | "public";
export type PublicRole = "viewer" | "editor" | "commenter";
export type ShareRole = "viewer" | "editor" | "admin" | "commenter";
export type UserRole = "admin" | "editor" | "viewer" | "commenter";

export interface FileAttachment {
	url: string;
	name: string;
	size: number;
	mimeType: string;
}

export interface CursorPosition {
	lineNumber: number;
	column: number;
}

export interface ActiveUser {
	socketId: string;
	name: string;
	color: string;
	isEditing: boolean;
	isRecording: boolean;
	pasteId: string;
}

export interface SharedMusicTrack {
	videoId: string;
	title: string;
	channel: string;
	thumbnail: string;
	duration?: string;
}

export interface SharedMusicState {
	enabled: boolean;
	initiatorSocketId: string;
	track: SharedMusicTrack | null;
	isPlaying: boolean;
	currentTime: number;
	lastSyncedAt: number;
	playlist: SharedMusicTrack[];
	region: string;
	shuffle: boolean;
	repeat: "off" | "one" | "all";
	volume?: number;
}

export interface SharedVideoState {
	isPlaying: boolean;
	currentTime: number;
	lastSyncedAt: number;
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

export interface RegisterUserData {
	username: string;
	email: string;
	password: string;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

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
	fileUrl?: string | null | undefined;
	fileName?: string | null | undefined;
	fileSize?: number | null | undefined;
	fileMimeType?: string | null | undefined;
	redirectUrl?: boolean | undefined;
	redirectionType?: "click" | "timer" | "direct" | undefined;
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
	files?: FileAttachment[] | undefined;
};

export interface ShareEntry {
	email: string;
	role: ShareRole;
}

export interface CreatePasteData extends UpdatePasteData {
	content: string;
	customId?: string;
	idType?: string;
}

export interface UpdatePasteData {
	content?: string | undefined;
	redirectUrl?: boolean | undefined;
	redirectionType?: "click" | "timer" | "direct" | undefined;
	language?: string | undefined;
	visibility?: Visibility | undefined;
	publicRole?: PublicRole | undefined;
	allowComments?: boolean | undefined;
	collaborators?: ShareEntry[] | undefined;
	expiresTime?: string | undefined;
	expiresAt?: Date | null | undefined;
	contentMode?: ContentMode | undefined;
	fileUrl?: string | null | undefined;
	fileName?: string | null | undefined;
	fileSize?: number | null | undefined;
	fileMimeType?: string | null | undefined;
	newId?: string | undefined;
	password?: string | null | undefined;
	editPermission?: EditPermission | undefined;
	burnAfterRead?: boolean | undefined;
	files?: FileAttachment[] | undefined;
}

export type IPaste = Document & {
	id: string;
	content: string;
	expiresAt: Date | null;
	createdAt: Date;
	contentMode?: ContentMode | undefined;
	fileUrl?: string | null | undefined;
	fileName?: string | null | undefined;
	fileSize?: number | null | undefined;
	fileMimeType?: string | null | undefined;
	redirectUrl?: boolean | undefined;
	redirectionType?: "click" | "timer" | "direct" | undefined;
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
	files?: FileAttachment[] | undefined;
};
