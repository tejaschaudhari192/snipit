import { ID_TYPES } from "@/constants";
import type { User, ShareRole, PublicRole } from "./user";

export type ContentMode = "text" | "code" | "docs" | "draw" | "link" | "file";
export type Visibility = "public" | "private" | "shared";
export type EditPermission = "owner" | "shared" | "public";
export type RedirectionType = "click" | "timer" | "direct";
export type IdTypeTab = "system" | "dynamic" | "semantic";

export type IdType = (typeof ID_TYPES)[number];

export interface CommentData {
	id: string;
	author: string;
	content: string;
	createdAt: string;
	userId?: string;
	user?: User;
}

export interface FileAttachment {
	url: string;
	name: string;
	size: number;
	mimeType: string;
}

export interface FolderData {
	_id: string;
	name: string;
	owner: string;
	parentId: string | null;
	path: string;
	color?: string | null;
	icon?: string | null;
	createdAt: string;
}

export interface PasteData {
	id: string;
	content: string;
	createdAt: string;
	expiresAt: string | null;
	contentMode?: ContentMode;
	fileUrl?: string | null;
	fileName?: string | null;
	fileSize?: number | null;
	fileMimeType?: string | null;
	redirectUrl?: boolean;
	redirectionType?: RedirectionType;
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
	collaborators?: {
		email: string;
		role: ShareRole;
	}[];
	publicRole?: PublicRole;
	role?: ShareRole;
	allowComments?: boolean;
	comments?: CommentData[];
	files?: FileAttachment[];
	folderId?: string | null;
}

export interface CreatePasteData {
	content: string;
	expiresTime: string;
	expiresAt: Date | null;
	idType?: IdType;
	customId?: string;
	contentMode?: ContentMode;
	fileUrl?: string | null;
	fileName?: string | null;
	fileSize?: number | null;
	fileMimeType?: string | null;
	redirectUrl?: boolean;
	redirectionType?: RedirectionType;
	language?: string;
	burnAfterRead?: boolean;
	visibility?: Visibility;
	allowedUsers?: string[];
	password?: string;
	editPermission?: EditPermission;
	collaborators?: {
		email: string;
		role: ShareRole;
	}[];
	publicRole?: PublicRole;
	allowComments?: boolean;
	files?: FileAttachment[];
	folderId?: string | null;
}

export interface UpdatePasteData {
	content?: string;
	redirectUrl?: boolean;
	redirectionType?: RedirectionType;
	language?: string;
	visibility?: Visibility;
	allowedUsers?: string[];
	newId?: string;
	password?: string | null;
	editPermission?: EditPermission;
	collaborators?: {
		email: string;
		role: ShareRole;
	}[];
	publicRole?: PublicRole;
	allowComments?: boolean;
	expiresTime?: string;
	expiresAt?: Date | null;
	contentMode?: ContentMode;
	fileUrl?: string | null;
	fileName?: string | null;
	fileSize?: number | null;
	fileMimeType?: string | null;
	files?: FileAttachment[];
	folderId?: string | null;
}
