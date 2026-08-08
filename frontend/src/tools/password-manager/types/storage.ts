import type { PasswordItem, Folder } from "./entities";

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

export interface KeyRecord {
	userId: string;
	encryptedPersonalKey: string;
	encryptedPrivateKey: string;
	salt?: string;
	updatedAt: string;
}
