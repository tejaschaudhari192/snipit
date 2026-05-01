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
	isMe?: boolean;
}

export interface CursorPosition {
	lineNumber: number;
	column: number;
}

export type ContentMode = "text" | "code" | "draw" | "link" | "file";
export type Visibility = "public" | "private" | "shared";
export type EditPermission = "owner" | "shared" | "public";
export type PublicRole = "viewer" | "editor" | "commenter";
export type ShareRole = "viewer" | "editor" | "admin" | "commenter";

export interface PasteData {
	id: string;
	content: string;
	createdAt: string;
	expiresAt: string | null;
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

export interface PaginatedResponse<T> {
	pastes: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasMore: boolean;
}

export interface CreatePasteData {
	content: string;
	expiresTime: string;
	idType?: IdType;
	customId?: string;
	contentMode?: ContentMode;
	fileUrl?: string | null;
	fileName?: string | null;
	fileSize?: number | null;
	fileMimeType?: string | null;
	redirectUrl?: boolean;
	language?: string;
	burnAfterRead?: boolean;
	visibility?: Visibility;
	allowedUsers?: string[];
	password?: string;
	editPermission?: EditPermission;
	shareList?: {
		email: string;
		role: ShareRole;
	}[];
	publicRole?: PublicRole;
	allowComments?: boolean;
}

export interface UpdatePasteData {
	content?: string;
	redirectUrl?: boolean;
	language?: string;
	visibility?: Visibility;
	allowedUsers?: string[];
	newId?: string;
	password?: string;
	editPermission?: EditPermission;
	shareList?: {
		email: string;
		role: ShareRole;
	}[];
	publicRole?: PublicRole;
	allowComments?: boolean;
	expiresTime?: string;
	contentMode?: ContentMode;
	fileUrl?: string | null;
	fileName?: string | null;
	fileSize?: number | null;
	fileMimeType?: string | null;
}

export interface ServiceStatus {
	status: string;
	message: string;
}

export interface HealthData {
	status: string;
	progress?: number;
	currentLabel?: string;
	icon?: string;
	services: Record<string, ServiceStatus>;
}
