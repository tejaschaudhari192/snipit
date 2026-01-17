export interface PasteData {
	id: string;
	content: string;
	createdAt: string;
	expiresAt: string;
	redirectUrl?: boolean;
	language?: string;
	burnAfterRead?: boolean;
	expiresTime?: string;
	views: number;
	visibility?: "public" | "private" | "shared";
	allowedUsers?: string[];
	isPasswordProtected?: boolean;
	password?: string;
}

export type IdType = "system" | "dynamic";
