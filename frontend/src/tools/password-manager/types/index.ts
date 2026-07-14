export interface CustomField {
	id: string;
	name: string;
	value: string;
	type: "text" | "password" | "boolean" | "hidden" | "url" | "date" | "number" | "email" | "tel" | "color";
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
	collectionId?: string | null;      // null for personal, set for shared
	itemType?: 'login' | 'card' | 'apikey' | 'passkey' | 'credfile' | 'note' | 'other';
	metadata?: Record<string, string>;
	customFields?: CustomField[];
	createdAt?: string;
	updatedAt?: string;
}

export interface Folder {
	id: string;
	name: string;
	color: string;
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
	role: 'owner' | 'editor' | 'viewer';
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
	role: 'owner' | 'editor' | 'viewer';
}

export interface SharedCollectionWithMembers extends SharedCollection {
	members: SharedCollectionMember[];
}

export interface ShareItemPayload {
	targetEmail: string;
	role: 'viewer' | 'editor';
	item: PasswordItem;
}

export interface ShareFolderPayload {
	targetEmail: string;
	role: 'viewer' | 'editor';
	folderId: string;
	folderName: string;
}

export interface DecryptedPayloadWrapper {
	schemaVersion: number;
	data: PasswordItem;
}

export interface RecoveryRecord {
	userId: string;
	encryptedMnemonic: string; // The mnemonic is what we store, encrypted by their new password, IF they want. Actually the user holds the mnemonic. The current recovery record stores the encrypted master password using the mnemonic.
	salt: string;
	iv: string;
	updatedAt: string;
}

export type VaultStorage = {
	folders: Folder[];
	version: number;
};

// Types for the Redux store
export type CloudVaultStatus = "checking" | "found" | "not_found" | "error";

export interface KeyRecord {
	userId: string;
	encryptedPersonalKey: string;
	encryptedPrivateKey: string;
	salt?: string;
	updatedAt: string;
}

export interface PasswordManagerState {
	userId: string;
	personalItems: PasswordItem[];
	folders: Folder[];
	sharedCollections: SharedCollection[];
	loading: boolean;
	error: string | null;
	isCloudSyncEnabled: boolean;
	isSyncing: boolean;
	hasExistingVault: boolean | null;
	cloudVaultStatus: CloudVaultStatus;
	activeItem: PasswordItem | null;
	isNewItem: boolean;
	activeFilter: string;
	isSidebarDrawerOpen: boolean;
	isUnlocked: boolean;
	recoveryMnemonic: string | null;
	hasRecoveryKey: boolean;
	recoveryLoading: boolean;
	recoveryError: string | null;
	recoveryMode: boolean;
	mek: Uint8Array | null;
	personalKey: Uint8Array | null;
	privateKey: string | null;
	collectionKeys: Record<string, Uint8Array>;
}
