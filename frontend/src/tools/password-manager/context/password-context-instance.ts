import { createContext } from "react";
import type { CloudVaultStatus, Vault } from "@/tools/password-manager/types";

export interface PasswordContextProps {
	masterPassword: string;
	setMasterPassword: (pwd: string) => void;
	vault: Vault | null;
	setVault: (v: Vault | null) => void;
	deleteItem: (id: string) => void;
	loading: boolean;
	error: string | null;
	isCloudSyncEnabled: boolean;
	setIsCloudSyncEnabled: (val: boolean) => void;
	isSyncing: boolean;
	hasExistingVault: boolean | null;
	setHasExistingVault: (val: boolean | null) => void;
	cloudVaultStatus: CloudVaultStatus;
	setCloudVaultStatus: (status: CloudVaultStatus) => void;
}

export const PasswordContext = createContext<PasswordContextProps | undefined>(
	undefined,
);
