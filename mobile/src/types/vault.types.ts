export type VaultCategory = "login" | "card" | "apikey" | "note" | "identity";
export type SyncStatus = "local" | "synced" | "pending_offline" | "syncing";
export type VaultTheme = "system" | "dark" | "light";
export type VaultUIStyle = "shadcn" | "native";

export interface VaultMetadata {
	salt: string;
	verifier?: string;
	encryptedPersonalKey?: string;
	encryptedSettings?: string;
	userId?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface RecoveryRecord {
	encrypted: string;
	salt: string;
}

export interface CustomField {
	id: string;
	name: string;
	value: string;
	type: "text" | "password" | "url" | "date" | "number" | "email";
	isProtected?: boolean;
}

export interface ItemAttachment {
	id: string;
	fileName: string;
	fileSize: number;
	mimeType?: string;
	storagePath: string;
	encKey: string;
	createdAt?: string;
}

export interface CardMetadata {
	cardholderName?: string;
	cardNumber?: string;
	expiration?: string;
	cvv?: string;
	pin?: string;
	zipCode?: string;
}

export interface Folder {
	id: string;
	name: string;
	color: string;
	iconName?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface PasswordItem {
	id: string;
	title: string;
	username?: string;
	password?: string;
	url?: string;
	notes?: string;
	category: VaultCategory;
	isFavorite?: boolean;
	folderId?: string;
	metadata?: Record<string, string>;
	customFields?: CustomField[];
	attachments?: ItemAttachment[];
	createdAt: string;
	updatedAt: string;
}

export interface UserSession {
	id: string;
	email: string;
	username: string;
	token?: string;
	avatar?: string;
}
