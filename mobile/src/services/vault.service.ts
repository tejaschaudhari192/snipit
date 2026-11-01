import { offlineVault } from "../core/vault-storage";

export { offlineVault };
export const vaultService = offlineVault;

export type {
	CardMetadata,
	CustomField,
	Folder,
	PasswordItem,
	RecoveryRecord,
	UserSession,
	VaultMetadata,
} from "../types";
