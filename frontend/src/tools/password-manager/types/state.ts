import type { PasswordItem, Folder, SharedCollection } from "./entities";

export type CloudVaultStatus = "checking" | "found" | "not_found" | "error";

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
