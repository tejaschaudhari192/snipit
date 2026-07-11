export interface CustomField {
	name: string;
	type:
		| "text"
		| "password"
		| "url"
		| "date"
		| "number"
		| "email"
		| "tel"
		| "color";
	value: string;
}

export interface Folder {
	id: string;
	name: string;
	color: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface PasswordItem {
	id: string;
	title: string;
	username?: string;
	password?: string;
	isFavorite?: boolean;
	url?: string;
	notes?: string;
	folderId?: string;
	itemType?:
		| "login"
		| "card"
		| "apikey"
		| "passkey"
		| "credfile"
		| "note"
		| "other";
	metadata?: Record<string, string>;
	customFields?: CustomField[];
	createdAt?: string;
	updatedAt?: string;
}

export interface Vault {
	items: PasswordItem[];
	folders?: Folder[];
	createdAt?: string;
	updatedAt?: string;
	version?: number;
}

export interface VaultStorage {
	encrypted: string;
	iv: string;
	salt: string;
}

/**
 * A stored vault record in IndexedDB, keyed by userId.
 */
export interface VaultRecord {
	userId: string;
	version: number;
	encryptedBlob: string;
	updatedAt: string;
}

export type CloudVaultStatus = "idle" | "checking" | "found" | "not_found";

/**
 * A stored recovery record in IndexedDB, keyed by userId.
 * Stores the master password encrypted with the recovery key.
 */
export interface RecoveryRecord {
	userId: string;
	encryptedMasterPassword: string; // AES-GCM encrypted with recovery key
	salt: string; // hex-encoded salt used for recovery key derivation
	iv: string; // hex-encoded IV for AES-GCM
	updatedAt: string;
}
