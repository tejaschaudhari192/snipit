/* eslint-disable react-refresh/only-export-components */
import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import type { Vault } from "@/tools/password-manager/types";
import {
	decryptVault,
	encryptVault,
	fetchVaultFromCloud,
	syncVaultToCloud,
	STORAGE_KEY,
} from "@/tools/password-manager/utils/vault";
import { getItem, setItem } from "@/tools/password-manager/utils/indexed-db";
import { useTranslation } from "react-i18next";
import { localStore } from "@/utils/storage";

interface PasswordContextProps {
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
}

const PasswordContext = createContext<PasswordContextProps | undefined>(
	undefined,
);

export const usePassword = () => {
	const ctx = useContext(PasswordContext);
	if (!ctx) {
		throw new Error("usePassword must be used within a PasswordProvider");
	}
	return ctx;
};

interface ProviderProps {
	children: ReactNode;
}

export const PasswordProvider: React.FC<ProviderProps> = ({ children }) => {
	const { t } = useTranslation();
	const [masterPassword, setMasterPassword] = useState<string>("");
	const [vault, setVault] = useState<Vault | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState<boolean>(
		() => {
			return localStore.getItem("snipit-cloud-sync") === "true";
		},
	);
	const [isSyncing, setIsSyncing] = useState<boolean>(false);
	const [hasExistingVault, setHasExistingVault] = useState<boolean | null>(
		null,
	);

	// Persist cloud sync preference
	useEffect(() => {
		localStore.setItem(
			"snipit-cloud-sync",
			isCloudSyncEnabled ? "true" : "false",
		);
	}, [isCloudSyncEnabled]);

	useEffect(() => {
		getItem(STORAGE_KEY).then((stored) => {
			setHasExistingVault(!!stored);
		});
	}, []);

	// Load vault when masterPassword changes
	useEffect(() => {
		if (!masterPassword) {
			setVault(null);
			return;
		}
		const load = async () => {
			setLoading(true);
			try {
				let stored = await getItem(STORAGE_KEY);

				// Migration: if nothing in IDB, check localStorage
				if (!stored) {
					const legacyStored = localStore.getItem(STORAGE_KEY);
					if (legacyStored) {
						await setItem(STORAGE_KEY, legacyStored);
						stored = legacyStored;
						localStore.removeItem(STORAGE_KEY); // Clean up legacy
					}
				}

				// If cloud sync is enabled, try to fetch from cloud first
				if (isCloudSyncEnabled) {
					setIsSyncing(true);
					const cloudData = await fetchVaultFromCloud();
					if (cloudData && cloudData.encryptedBlob) {
						// Overwrite local with cloud (simple strategy for now)
						stored = cloudData.encryptedBlob;
						await setItem(STORAGE_KEY, stored);
					}
					setIsSyncing(false);
				}

				if (stored) {
					// We must decrypt from the stored base64 blob, not just the object!
					const v = await decryptVault(masterPassword, stored);
					if (!v) {
						setError(
							t("tools.password_manager_error") ||
								"Incorrect master password",
						);
						setVault(null);
					} else {
						setVault(v);
					}
				} else {
					// No vault exists yet, create an empty one
					setVault({ items: [] });
				}
			} catch {
				setError(t("tools.password_manager_error"));
				setVault(null);
			} finally {
				setLoading(false);
				setIsSyncing(false);
			}
		};
		// Load the vault when dependencies change
		load();
	}, [masterPassword, t, isCloudSyncEnabled]);

	// Persist vault when it changes
	useEffect(() => {
		if (!vault || !masterPassword) return;
		const save = async () => {
			const enc = await encryptVault(vault, masterPassword);
			await setItem(STORAGE_KEY, enc);

			if (isCloudSyncEnabled) {
				setIsSyncing(true);
				await syncVaultToCloud(enc);
				setIsSyncing(false);
			}
		};
		save();
	}, [vault, masterPassword, isCloudSyncEnabled]);

	const deleteItem = useCallback(
		(id: string) => {
			if (!vault) return;
			setVault({
				...vault,
				items: vault.items.filter((item) => item.id !== id),
				updatedAt: new Date().toISOString(),
			});
		},
		[vault],
	);

	return (
		<PasswordContext.Provider
			value={{
				masterPassword,
				setMasterPassword,
				vault,
				setVault,
				deleteItem,
				loading,
				error,
				isCloudSyncEnabled,
				setIsCloudSyncEnabled,
				isSyncing,
				hasExistingVault,
			}}
		>
			{children}
		</PasswordContext.Provider>
	);
};
