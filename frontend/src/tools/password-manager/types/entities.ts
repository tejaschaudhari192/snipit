export interface CustomField {
	id: string;
	name: string;
	value: string;
	type:
		| "text"
		| "password"
		| "boolean"
		| "hidden"
		| "url"
		| "date"
		| "number"
		| "email"
		| "tel"
		| "color";
	isProtected?: boolean; // If true, value is masked by default
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
	collectionId?: string | null; // null for personal, set for shared
	itemType?:
		| "login"
		| "card"
		| "apikey"
		| "passkey"
		| "credfile"
		| "note"
		| "identity"
		| "other";
	metadata?: Record<string, string>;
	customFields?: CustomField[];
	createdAt?: string;
	updatedAt?: string;
}

export interface Folder {
	id: string;
	name: string;
	color: string;
	iconName?: string;
	collectionId?: string;
	isVirtual?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface Collection {
	id: string;
	name: string;
	createdBy: string;
	isHidden: boolean;
	updatedAt?: string;
}

export interface CollectionAccess {
	id: string;
	collectionId: string;
	userId: string;
	role: "owner" | "editor" | "viewer";
	encryptedCollectionKey?: string; // Sometimes populated depending on the endpoint
}

export interface SharedCollection {
	collection: Collection;
	access: CollectionAccess;
	items: PasswordItem[];
}

export interface SharedCollectionMember {
	id: string;
	userId: string;
	email: string;
	username: string;
	role: "owner" | "editor" | "viewer";
}

export interface SharedCollectionWithMembers extends SharedCollection {
	members: SharedCollectionMember[];
}
