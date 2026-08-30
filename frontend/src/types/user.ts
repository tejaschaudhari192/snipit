export interface User {
	_id: string;
	username: string;
	email: string;
	avatar?: string;
	createdAt?: string;
}

export type ShareRole = "viewer" | "editor" | "admin" | "commenter";
export type PublicRole = "viewer" | "editor" | "commenter";

export interface ShareEntry {
	email: string;
	role: ShareRole;
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
