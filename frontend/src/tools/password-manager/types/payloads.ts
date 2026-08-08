import type { PasswordItem } from "./entities";

export interface ShareItemPayload {
	targetEmail: string;
	role: "viewer" | "editor";
	item: PasswordItem;
}

export interface ShareFolderPayload {
	targetEmail: string;
	role: "viewer" | "editor";
	folderId: string;
	folderName: string;
}
