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

export type CloudVaultStatus = "idle" | "checking" | "found" | "not_found";
