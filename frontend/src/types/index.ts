import { ID_TYPES } from "@/constants";

export interface FileAttachment {
	url: string;
	name: string;
	size: number;
	mimeType: string;
}

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

export interface SelectionRange {
	startLineNumber: number;
	startColumn: number;
	endLineNumber: number;
	endColumn: number;
}

export interface ActiveUser {
	socketId: string;
	name: string;
	color: string;
	isEditing: boolean;
	isRecording: boolean;
	pasteId: string;
	isMe?: boolean;
}

export interface CursorPosition {
	lineNumber: number;
	column: number;
}

export type ContentMode = "text" | "code" | "draw" | "link" | "file" | "video";
export type Visibility = "public" | "private" | "shared";
export type EditPermission = "owner" | "shared" | "public";
export type PublicRole = "viewer" | "editor" | "commenter";
export type ShareRole = "viewer" | "editor" | "admin" | "commenter";
export type RedirectionType = "click" | "timer" | "direct";
export type IdTypeTab = "system" | "dynamic" | "semantic";

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
	labels?: string[];
	files?: FileAttachment[];
}

export type IdType = (typeof ID_TYPES)[number];
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
export interface EditorChange {
	range: {
		startLineNumber: number;
		startColumn: number;
		endLineNumber: number;
		endColumn: number;
	};
	text: string;
}

export interface AiIdFileContext {
	name?: string;
	fileName?: string;
	type?: string;
	fileMimeType?: string;
	mimeType?: string;
}

export type SocketUpdateData = Partial<PasteData> & {
	changes?: EditorChange[];
	isAutosave?: boolean;
	socketId?: string;
};

export interface MusicTrack {
	videoId: string;
	title: string;
	channel: string;
	thumbnail: string;
	duration?: string;
}

export interface SharedMusicState {
	enabled: boolean;
	initiatorSocketId: string;
	track: MusicTrack | null;
	isPlaying: boolean;
	currentTime: number;
	lastSyncedAt: number;
	playlist: MusicTrack[];
	region: string;
	shuffle: boolean;
	repeat: "off" | "one" | "all";
	volume?: number;
}

export type PlaybackAction =
	| { type: "play"; currentTime?: number }
	| { type: "pause"; currentTime?: number }
	| { type: "seek"; currentTime: number }
	| { type: "track-change"; track: MusicTrack; currentIndex: number }
	| { type: "next" }
	| { type: "previous" };

export interface MusicSyncUpdate {
	track: MusicTrack | null;
	isPlaying: boolean;
	currentTime: number;
	playlist: MusicTrack[];
	region: string;
	shuffle: boolean;
	repeat: "off" | "one" | "all";
	timestamp: number;
}

export interface MusicPlayPauseUpdate {
	currentTime?: number;
}

export interface MusicSeekUpdate {
	currentTime: number;
}

export interface MusicTrackUpdate {
	track: MusicTrack | null;
	currentIndex?: number;
}
