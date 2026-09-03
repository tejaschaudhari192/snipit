import { createAsyncThunk } from "@reduxjs/toolkit";
import {
	getVault,
	updateVault,
	getVaultItems,
} from "@/tools/password-manager/api/password-manager";
import { keyStore } from "@/tools/password-manager/store/key-store";
import {
	deriveMEK,
	generateKeyPair,
	generateSymmetricKey,
	encryptWithMEK,
	decryptWithMEK,
	encryptPayload,
	decryptPayload,
	encodeBase64,
	decodeBase64,
	runMigrations,
	getPublicKeyFromPrivateKey,
} from "@/tools/password-manager/utils/crypto";
import {
	getKeyRecord,
	setKeyRecord,
} from "@/tools/password-manager/utils/indexed-db";
import { logger } from "@/utils/logger";
import type {
	PasswordManagerState,
	PasswordItem,
	Folder,
	ServerVaultData,
	ServerEncryptedItem,
} from "@/tools/password-manager/types";
import { setCloudVaultStatus } from "../password-slice";
import { fetchSharedCollections } from "./sharing";

export const initializeVault = createAsyncThunk(
	"passwordManager/initialize",
	async (_, { getState, dispatch }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return;

		try {
			const res = await getVault<{ data: ServerVaultData }>();
			if (res.data) {
				dispatch(setCloudVaultStatus("found"));
			} else {
				dispatch(setCloudVaultStatus("not_found"));
			}
		} catch (error) {
			logger.error("Failed to check vault status:", error);
			dispatch(setCloudVaultStatus("error"));
		}
	},
);

export const createVault = createAsyncThunk(
	"passwordManager/createVault",
	async (password: string, { getState, rejectWithValue, dispatch }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return rejectWithValue("No user ID");

		try {
			// 1. Derive MEK from password
			const saltStr = crypto.randomUUID();
			const mek = await deriveMEK(password, saltStr);
			keyStore.setMEK(mek);

			// 2. Generate Personal Symmetric Key
			const personalKey = generateSymmetricKey();
			keyStore.setPersonalKey(personalKey);

			// 3. Generate Asymmetric Keypair
			const rsaKeyPair = generateKeyPair();
			keyStore.setPublicKey(rsaKeyPair.publicKey);
			keyStore.setPrivateKey(rsaKeyPair.privateKey);

			// 4. Encrypt keys for storage
			const encryptedPersonalKey = encryptWithMEK(
				encodeBase64(personalKey),
				mek,
			);
			const encryptedPrivateKey = encryptWithMEK(
				rsaKeyPair.privateKey,
				mek,
			);
			const publicKeyJWK = rsaKeyPair.publicKey;

			// Initialize empty settings (folders)
			const initialSettings = { folders: [] };
			const settingsPayload = await encryptPayload(
				initialSettings,
				personalKey,
			);

			// 5. Save to cloud
			await updateVault({
				encryptedPersonalKey,
				encryptedBlob: encryptedPersonalKey,
				encryptedVaultBlob: encryptedPersonalKey,
				encryptedSettings: settingsPayload,
				publicKey: publicKeyJWK,
				encryptedPrivateKey,
				salt: saltStr,
			});

			// 6. Save to local IndexedDB for offline unlock caching
			await setKeyRecord({
				userId: state.userId,
				encryptedPersonalKey,
				encryptedPrivateKey,
				salt: saltStr,
				updatedAt: new Date().toISOString(),
			});

			// Setup complete, fetch items (will be empty)
			dispatch(fetchVaultData());

			return true;
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	},
);

export const unlockVault = createAsyncThunk(
	"passwordManager/unlockVault",
	async (password: string, { getState, rejectWithValue, dispatch }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return rejectWithValue("No user ID");

		try {
			// Get cloud vault to get the encrypted keys
			const res = await getVault<{ data: ServerVaultData }>();
			if (!res.data) {
				return rejectWithValue("Vault not found on server");
			}

			const vaultData = res.data;

			const keyRecord = await getKeyRecord(state.userId);
			let saltStr = vaultData.salt || keyRecord?.salt;
			if (!saltStr) {
				const encoder = new TextEncoder();
				const hashBuffer = await crypto.subtle.digest(
					"SHA-256",
					encoder.encode(state.userId),
				);
				saltStr = Array.from(new Uint8Array(hashBuffer))
					.map((b) => b.toString(16).padStart(2, "0"))
					.join("");
			}

			const mek = await deriveMEK(password, saltStr);

			const encryptedPersonalKey =
				vaultData.encryptedPersonalKey || vaultData.encryptedBlob;
			if (!encryptedPersonalKey)
				throw new Error(
					"Vault is corrupted: Missing encrypted personal key",
				);

			// Decrypt personal key
			const decodedPersonalKeyB64 = decryptWithMEK(
				encryptedPersonalKey,
				mek,
			) as string;
			if (!decodedPersonalKeyB64) throw new Error("Invalid password");
			const personalKey = decodeBase64(decodedPersonalKeyB64);

			if (!vaultData.encryptedPrivateKey)
				throw new Error(
					"Vault is corrupted: Missing encrypted private key",
				);

			// Decrypt private key
			const privateKey = decryptWithMEK(
				vaultData.encryptedPrivateKey,
				mek,
			) as string;
			if (!privateKey) throw new Error("Invalid password");

			// Save to keyStore
			keyStore.setMEK(mek);
			keyStore.setPersonalKey(personalKey);
			keyStore.setPrivateKey(privateKey);
			if (vaultData.publicKey) {
				keyStore.setPublicKey(vaultData.publicKey);
			} else {
				keyStore.setPublicKey(getPublicKeyFromPrivateKey(privateKey));
			}

			// Decrypt settings
			let folders: Folder[] = [];
			if (vaultData.encryptedSettings) {
				const decryptedSettings = (await decryptPayload(
					vaultData.encryptedSettings,
					personalKey,
				)) as { folders: Folder[] } | null;
				folders = decryptedSettings?.folders || [];
			}

			await dispatch(fetchSharedCollections());
			dispatch(fetchVaultData());
			return { folders };
		} catch (error) {
			return rejectWithValue(
				"Failed to unlock: " + (error as Error).message,
			);
		}
	},
);

export const fetchVaultData = createAsyncThunk(
	"passwordManager/fetchVaultData",
	async (_, { rejectWithValue }) => {
		const personalKey = keyStore.getPersonalKey();
		if (!personalKey) return rejectWithValue("Vault is locked");

		try {
			// Fetch items
			const itemsRes = await getVaultItems<{
				data: ServerEncryptedItem[];
			}>();
			const encryptedItems = itemsRes.data || [];

			const personalItems: PasswordItem[] = [];
			const rawSharedItems: PasswordItem[] = [];

			for (const item of encryptedItems) {
				if (!item.collectionId) {
					// Personal item
					try {
						const parsed = await decryptPayload(
							item.encryptedPayload,
							personalKey,
						);
						if (parsed) {
							const migrated = runMigrations(
								parsed as Record<string, unknown>,
							);
							personalItems.push({
								...(migrated?.data as PasswordItem),
								id: item.id,
							});
						}
					} catch (e) {
						logger.error("Failed to decrypt personal item", e);
					}
				} else {
					// Shared item
					const collectionKey = keyStore.getCollectionKey(
						item.collectionId,
					);
					if (collectionKey) {
						try {
							const parsed = await decryptPayload(
								item.encryptedPayload,
								collectionKey,
							);
							if (parsed) {
								const migrated = runMigrations(
									parsed as Record<string, unknown>,
								);
								rawSharedItems.push({
									...(migrated?.data as PasswordItem),
									id: item.id,
									collectionId: item.collectionId,
								});
							}
						} catch (e) {
							logger.error("Failed to decrypt shared item", e);
						}
					}
				}
			}

			return { personalItems, rawSharedItems };
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	},
);
