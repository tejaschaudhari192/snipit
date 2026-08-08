export interface ServerVaultData {
	salt?: string;
	encryptedPersonalKey?: string;
	encryptedBlob?: string;
	encryptedPrivateKey: string;
	publicKey?: string;
	encryptedSettings?: string;
}

export interface ServerEncryptedItem {
	id: string;
	encryptedPayload: string;
	collectionId?: string;
}

export interface ServerCollection {
	id: string;
	encryptedCollectionKey?: string;
}

export interface LookupShareUserResponse {
	userId: string;
	publicKey: string;
}

export interface ShareVaultItemResponse {
	collectionId: string;
	itemId: string;
}

export interface ShareVaultFolderResponse {
	collectionId: string;
}
