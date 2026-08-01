import {
	createSlice,
	createAsyncThunk,
	createSelector,
	type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/lib/api";
import { keyStore } from "./key-store";
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
	encryptCollectionKeyForUser,
	decryptCollectionKey,
	getPublicKeyFromPrivateKey,
} from "../utils/crypto";
import {
	getKeyRecord,
	setKeyRecord,
	getRecoveryRecord,
	setRecoveryRecord,
} from "../utils/indexed-db";
import {
	generateRecoveryMnemonic,
	encryptMasterPassword,
	decryptMasterPassword,
} from "../utils/recovery";
import { logger } from "@/utils/logger";
import type {
	PasswordManagerState,
	CloudVaultStatus,
	PasswordItem,
	Folder,
	SharedCollectionWithMembers,
	ShareItemPayload,
	ShareFolderPayload,
} from "../types";

// Thunks
export const initializeVault = createAsyncThunk(
	"passwordManager/initialize",
	async (_, { getState, dispatch }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return;

		try {
			const res = await api.get("/tools/password-manager/vault");
			if (res.data?.data) {
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

export const checkRecoveryKey = createAsyncThunk(
	"passwordManager/checkRecoveryKey",
	async (_, { getState }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return false;
		const record = await getRecoveryRecord(state.userId);
		return !!record;
	},
);

export const generateRecoveryKey = createAsyncThunk(
	"passwordManager/generateRecoveryKey",
	async (masterPassword: string, { getState, rejectWithValue }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return rejectWithValue("No user ID");

		try {
			const mnemonic = generateRecoveryMnemonic();
			const encryptedRecord = await encryptMasterPassword(
				mnemonic,
				masterPassword,
			);

			await setRecoveryRecord({
				userId: state.userId,
				encryptedMnemonic: encryptedRecord.encrypted,
				salt: encryptedRecord.salt,
				iv: encryptedRecord.iv,
				updatedAt: new Date().toISOString(),
			});

			return mnemonic;
		} catch (error) {
			return rejectWithValue((error as Error).message);
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
			await api.put("/tools/password-manager/vault", {
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
			const res = await api.get("/tools/password-manager/vault");
			if (!res.data?.data) {
				return rejectWithValue("Vault not found on server");
			}

			const vaultData = res.data.data;

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

			// Decrypt personal key
			const decodedPersonalKeyB64 = decryptWithMEK(
				vaultData.encryptedPersonalKey || vaultData.encryptedBlob,
				mek,
			) as string;
			if (!decodedPersonalKeyB64) throw new Error("Invalid password");
			const personalKey = decodeBase64(decodedPersonalKeyB64);

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
			const itemsRes = await api.get(
				"/tools/password-manager/vault/items",
			);
			const encryptedItems = itemsRes.data?.data || [];

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

export const persistItem = createAsyncThunk(
	"passwordManager/persistItem",
	async (item: PasswordItem, { rejectWithValue, dispatch }) => {
		try {
			if (item.collectionId) {
				// Updating a shared item
				const collectionKey = keyStore.getCollectionKey(
					item.collectionId,
				);
				if (!collectionKey)
					return rejectWithValue("Collection key not found");

				const encryptedPayload = encryptPayload(item, collectionKey);
				await api.put(
					`/tools/password-manager/vault/items/${item.id}`,
					{
						encryptedPayload,
						collectionId: item.collectionId,
					},
				);
				return item;
			}

			// Personal item
			const personalKey = keyStore.getPersonalKey();
			if (!personalKey) return rejectWithValue("Vault is locked");

			const encryptedPayload = encryptPayload(item, personalKey);

			// Upsert to backend
			await api.put(`/tools/password-manager/vault/items/${item.id}`, {
				encryptedPayload,
				collectionId: item.collectionId || null,
			});

			return item;
		} catch (error: unknown) {
			const err = error as {
				response?: { status: number };
				message?: string;
			};
			if (err.response && err.response.status === 404) {
				try {
					if (item.collectionId) {
						const collectionKey = keyStore.getCollectionKey(
							item.collectionId,
						);
						if (!collectionKey)
							return rejectWithValue("Collection key not found");
						const encryptedPayload = encryptPayload(
							item,
							collectionKey,
						);
						await api.post(`/tools/password-manager/vault/items`, {
							id: item.id,
							encryptedPayload,
							collectionId: item.collectionId,
						});
						return item;
					}
					const personalKey = keyStore.getPersonalKey();
					if (!personalKey) return rejectWithValue("Vault is locked");
					const encryptedPayload = encryptPayload(item, personalKey);
					await api.post(`/tools/password-manager/vault/items`, {
						id: item.id,
						encryptedPayload,
						collectionId: item.collectionId,
					});
					return item;
				} catch (innerError) {
					dispatch(fetchVaultData());
					return rejectWithValue((innerError as Error).message);
				}
			}
			dispatch(fetchVaultData());
			return rejectWithValue(err.message || "Failed to save item");
		}
	},
);

export const deleteItem = createAsyncThunk(
	"passwordManager/deleteItem",
	async (id: string, { getState, rejectWithValue, dispatch }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		// Find the item to see if it has a collectionId
		let targetCollectionId: string | undefined;
		const itemInPersonal = state.personalItems.find((i) => i.id === id);
		if (itemInPersonal?.collectionId) {
			targetCollectionId = itemInPersonal.collectionId;
		} else {
			for (const coll of state.sharedCollections) {
				if (coll.items.some((i) => i.id === id)) {
					targetCollectionId = coll.collection.id;
					break;
				}
			}
		}

		try {
			await api.delete(`/tools/password-manager/vault/items/${id}`);

			// If it was part of a hidden collection (meaning an individually shared item), delete the collection too
			if (targetCollectionId) {
				const collection = state.sharedCollections.find(
					(c) => c.collection.id === targetCollectionId,
				);
				if (collection?.collection.isHidden) {
					dispatch(deleteCollection(targetCollectionId));
				}
			}

			return id;
		} catch (error: unknown) {
			const err = error as {
				response?: { status: number };
				message?: string;
			};
			if (err.response && err.response.status === 404) {
				return id;
			}
			return rejectWithValue(err.message || "Failed to delete item");
		}
	},
);

export const deleteCollection = createAsyncThunk(
	"passwordManager/deleteCollection",
	async (collectionId: string, { rejectWithValue, dispatch }) => {
		try {
			await api.delete(
				`/tools/password-manager/vault/collections/${collectionId}`,
			);
			dispatch(fetchSharedCollections());
			return collectionId;
		} catch (error: unknown) {
			const err = error as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			return rejectWithValue(
				err.response?.data?.message ||
					err.message ||
					"Failed to delete collection",
			);
		}
	},
);

export const deleteFolderAsync = createAsyncThunk(
	"passwordManager/deleteFolderAsync",
	async (
		{
			id,
			deletePasswordsInside,
		}: { id: string; deletePasswordsInside: boolean },
		{ getState, rejectWithValue, dispatch },
	) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		const folder = state.folders.find((f) => f.id === id);
		if (!folder) return rejectWithValue("Folder not found");

		const newFolders = state.folders.filter((f) => f.id !== id);
		let newItems = [...state.personalItems];

		try {
			const personalKey = keyStore.getPersonalKey();
			if (!personalKey) throw new Error("Vault is locked");

			if (deletePasswordsInside) {
				// Delete all items in this folder — check both personal items and shared-collection items
				const personalToDelete = state.personalItems.filter(
					(i) => i.folderId === id,
				);

				// If this folder was shared, its items live in sharedCollections keyed by collectionId
				const sharedToDelete: PasswordItem[] = folder.collectionId
					? (
							state.sharedCollections.find(
								(c) => c.collection.id === folder.collectionId,
							)?.items ?? []
						).filter((i) => i.folderId === id || !i.folderId)
					: [];

				const allToDelete = [
					...personalToDelete,
					...sharedToDelete.filter(
						(s) => !personalToDelete.some((p) => p.id === s.id),
					),
				];

				for (const item of allToDelete) {
					await api.delete(
						`/tools/password-manager/vault/items/${item.id}`,
					);
				}
				newItems = newItems.filter((item) => item.folderId !== id);
			} else {
				// Keep the items but move them back to personal (un-share) and remove from folder.
				// Items may be in personalItems (if never fully shared) OR in sharedCollections
				// (if folder.collectionId is set — items were re-encrypted with collection key).
				const itemsFromPersonal = state.personalItems.filter(
					(i) => i.folderId === id,
				);

				// Gather items that live in the shared collection (encrypted with collection key)
				const sharedCollection = folder.collectionId
					? state.sharedCollections.find(
							(c) => c.collection.id === folder.collectionId,
						)
					: undefined;
				const itemsFromShared: PasswordItem[] = sharedCollection
					? sharedCollection.items.filter(
							(i) => i.folderId === id || !i.folderId,
						)
					: [];

				// Merge, avoiding duplicates
				const allToUpdate = [
					...itemsFromPersonal,
					...itemsFromShared.filter(
						(s) => !itemsFromPersonal.some((p) => p.id === s.id),
					),
				];

				for (const item of allToUpdate) {
					// Always re-encrypt with personal key (item may currently be collection-key encrypted)
					const updatedItem: PasswordItem = {
						...item,
						folderId: undefined,
						collectionId: undefined,
						updatedAt: new Date().toISOString(),
					};
					const encryptedPayload = encryptPayload(
						updatedItem,
						personalKey,
					);
					await api.put(
						`/tools/password-manager/vault/items/${item.id}`,
						{
							encryptedPayload,
							collectionId: null, // detach from collection in DB
						},
					);

					// Update or add to personal items list
					const index = newItems.findIndex((i) => i.id === item.id);
					if (index !== -1) {
						newItems[index] = updatedItem;
					} else {
						newItems.push(updatedItem);
					}
				}
			}

			// If the folder was a shared collection, delete the collection.
			// Items have already been detached (collectionId: null in DB above),
			// so deleting the collection only removes recipient access — it does NOT orphan items.
			if (folder.collectionId) {
				await api.delete(
					`/tools/password-manager/vault/collections/${folder.collectionId}`,
				);
				dispatch(fetchSharedCollections());
			}

			// Persist the new folders array
			const settingsPayload = await encryptPayload(
				{ folders: newFolders },
				personalKey,
			);
			await api.put("/tools/password-manager/vault", {
				encryptedSettings: settingsPayload,
			});

			dispatch(setVault({ folders: newFolders, items: newItems }));
			if (state.activeFilter === id) dispatch(setActiveFilter("all"));

			return { id, newFolders, newItems };
		} catch (error: unknown) {
			const err = error as { message?: string };
			dispatch(fetchVaultData()); // resync if something failed mid-way
			return rejectWithValue(err.message || "Failed to delete folder");
		}
	},
);

export const persistFolders = createAsyncThunk(
	"passwordManager/persistFolders",
	async (folders: Folder[], { rejectWithValue }) => {
		const personalKey = keyStore.getPersonalKey();
		if (!personalKey) return rejectWithValue("Vault is locked");

		try {
			const settingsPayload = await encryptPayload(
				{ folders },
				personalKey,
			);

			await api.put("/tools/password-manager/vault", {
				encryptedSettings: settingsPayload,
			});

			return folders;
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	},
);

export const createFolderAsync = createAsyncThunk(
	"passwordManager/createFolderAsync",
	async (
		folder: Omit<Folder, "id" | "createdAt" | "updatedAt">,
		{ getState, dispatch },
	) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		const newFolder: Folder = {
			...folder,
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		const newFolders = [...state.folders, newFolder];
		await dispatch(persistFolders(newFolders));
		return newFolder;
	},
);

export const importItems = createAsyncThunk(
	"passwordManager/importItems",
	async (items: PasswordItem[], { dispatch }) => {
		const results = [];
		for (const item of items) {
			const result = await dispatch(persistItem(item)).unwrap();
			results.push(result);
		}
		return results;
	},
);

export const recoverWithMnemonic = createAsyncThunk(
	"passwordManager/recoverWithMnemonic",
	async (mnemonic: string, { getState, rejectWithValue }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return rejectWithValue("No user ID");

		try {
			const record = await getRecoveryRecord(state.userId);
			if (!record) return rejectWithValue("No recovery record found");

			const recoveredPassword = await decryptMasterPassword(mnemonic, {
				encrypted: record.encryptedMnemonic,
				salt: record.salt,
				iv: record.iv,
			});
			return recoveredPassword;
		} catch {
			return rejectWithValue("Invalid recovery key");
		}
	},
);

export const resetMasterPassword = createAsyncThunk(
	"passwordManager/resetMasterPassword",
	async (newPassword: string, { getState, rejectWithValue }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return rejectWithValue("No user ID");

		const personalKey = keyStore.getPersonalKey();
		const privateKey = keyStore.getPrivateKey();
		if (!personalKey || !privateKey)
			return rejectWithValue("Vault not unlocked");

		try {
			// 1. Derive new MEK
			const saltStr = crypto.randomUUID();
			const newMek = await deriveMEK(newPassword, saltStr);

			// 2. Re-encrypt keys with new MEK
			const encryptedPersonalKey = encryptWithMEK(
				encodeBase64(personalKey),
				newMek,
			);
			const encryptedPrivateKey = encryptWithMEK(privateKey, newMek);

			// 3. Update backend
			await api.put("/tools/password-manager/vault", {
				encryptedPersonalKey,
				encryptedBlob: encryptedPersonalKey,
				encryptedPrivateKey,
				salt: saltStr,
			});

			// 4. Update local keyStore and IndexedDB
			keyStore.setMEK(newMek);
			await setKeyRecord({
				userId: state.userId,
				encryptedPersonalKey,
				encryptedPrivateKey,
				salt: saltStr,
				updatedAt: new Date().toISOString(),
			});

			return true;
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	},
);

export const fetchSharedCollections = createAsyncThunk(
	"passwordManager/fetchSharedCollections",
	async (_, { rejectWithValue }) => {
		const privateKey = keyStore.getPrivateKey();
		if (!privateKey) return rejectWithValue("Vault is locked");

		try {
			const res = await api.get(
				"/tools/password-manager/vault/collections",
			);
			const collections = res.data?.data || [];

			for (const coll of collections) {
				if (coll.encryptedCollectionKey) {
					try {
						const rawKey = decryptCollectionKey(
							coll.encryptedCollectionKey,
							privateKey,
						);
						keyStore.setCollectionKey(coll.id, rawKey);
					} catch (e) {
						logger.error(
							`Failed to decrypt collection key for ${coll.id}`,
							e,
						);
					}
				}
			}
			return collections;
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	},
);

export const shareItem = createAsyncThunk(
	"passwordManager/shareItem",
	async (payload: ShareItemPayload, { getState, rejectWithValue }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		const myPublicKey = keyStore.getPublicKey();
		if (!myPublicKey || !state.userId)
			return rejectWithValue("Vault not properly unlocked");

		try {
			// 1. Lookup recipient
			const lookupRes = await api.post(
				"/tools/password-manager/vault/share/lookup",
				{ email: payload.targetEmail },
			);
			const { userId: targetUserId, publicKey: theirPublicKey } =
				lookupRes.data.data;

			// 2. Generate symmetric key for the new collection
			const rawCollectionKey = generateSymmetricKey();

			// 3. Encrypt the key for owner and recipient
			const encryptedCollectionKeyForOwner = encryptCollectionKeyForUser(
				rawCollectionKey,
				myPublicKey,
			);
			const encryptedCollectionKeyForRecipient =
				encryptCollectionKeyForUser(rawCollectionKey, theirPublicKey);

			// 4. Encrypt the item payload with the new collection key
			const encryptedPayload = encryptPayload(
				payload.item,
				rawCollectionKey,
			);

			// 5. Hit API to create collection, access, and item
			const shareRes = await api.post(
				"/tools/password-manager/vault/share/item",
				{
					targetUserId,
					encryptedCollectionKeyForOwner,
					encryptedCollectionKeyForRecipient,
					role: payload.role,
					itemId: payload.item.id,
					encryptedPayload,
					itemTitle: payload.item.title,
				},
			);

			const { collectionId, itemId } = shareRes.data.data;

			// 6. Store the collection key in our local keyStore
			keyStore.setCollectionKey(collectionId, rawCollectionKey);

			return { ...payload.item, collectionId, id: itemId };
		} catch (error: unknown) {
			const err = error as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			const msg =
				err.response?.data?.message ||
				err.message ||
				"Failed to share item";
			return rejectWithValue(msg);
		}
	},
);

export const shareFolder = createAsyncThunk(
	"passwordManager/shareFolder",
	async (
		payload: ShareFolderPayload,
		{ getState, rejectWithValue, dispatch },
	) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		const myPublicKey = keyStore.getPublicKey();
		if (!myPublicKey || !state.userId)
			return rejectWithValue("Vault not properly unlocked");

		try {
			// 1. Get items to share
			const itemsToShare = state.personalItems.filter(
				(item) => item.folderId === payload.folderId,
			);

			// 2. Lookup recipient
			const lookupRes = await api.post(
				"/tools/password-manager/vault/share/lookup",
				{ email: payload.targetEmail },
			);
			const { userId: targetUserId, publicKey: theirPublicKey } =
				lookupRes.data.data;

			// 3. Generate symmetric key for the new collection
			const rawCollectionKey = generateSymmetricKey();

			// 4. Encrypt the key for owner and recipient
			const encryptedCollectionKeyForOwner = encryptCollectionKeyForUser(
				rawCollectionKey,
				myPublicKey,
			);
			const encryptedCollectionKeyForRecipient =
				encryptCollectionKeyForUser(rawCollectionKey, theirPublicKey);

			// 5. Encrypt item payloads (keep folderId intact so items remain in folder)
			const encryptedItems = itemsToShare.map((item) => {
				return {
					id: item.id,
					encryptedPayload: encryptPayload(item, rawCollectionKey),
				};
			});

			// 6. Hit API to create collection, access, and items
			const shareRes = await api.post(
				"/tools/password-manager/vault/share/folder",
				{
					targetUserId,
					encryptedCollectionKeyForOwner,
					encryptedCollectionKeyForRecipient,
					role: payload.role,
					folderName: payload.folderName,
					items: encryptedItems,
				},
			);

			const { collectionId } = shareRes.data.data;
			keyStore.setCollectionKey(collectionId, rawCollectionKey);

			// 7. Update folder with collectionId and persist it
			const updatedFolders = state.folders.map((f) =>
				f.id === payload.folderId ? { ...f, collectionId } : f,
			);
			await dispatch(persistFolders(updatedFolders)).unwrap();

			return { folderId: payload.folderId, collectionId, itemsToShare };
		} catch (error: unknown) {
			const err = error as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			const msg =
				err.response?.data?.message ||
				err.message ||
				"Failed to share folder";
			return rejectWithValue(msg);
		}
	},
);

export const revokeSharedAccess = createAsyncThunk(
	"passwordManager/revokeSharedAccess",
	async (accessId: string, { rejectWithValue, dispatch }) => {
		try {
			await api.delete(`/tools/password-manager/vault/share/${accessId}`);
			dispatch(fetchSharedCollections());
			return accessId;
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } };
			return rejectWithValue(
				err.response?.data?.message || "Failed to revoke access",
			);
		}
	},
);

const initialState: PasswordManagerState = {
	userId: "",

	// Data
	personalItems: [],
	folders: [],
	sharedCollections: [],

	// UI
	loading: false,
	error: null,
	isCloudSyncEnabled: true,
	isSyncing: false,
	hasExistingVault: null,
	cloudVaultStatus: "checking",
	activeItem: null,
	isNewItem: false,
	activeFilter: "all",
	isSidebarDrawerOpen: false,
	isUnlocked: false,

	// Recovery
	recoveryMnemonic: null,
	hasRecoveryKey: false,
	recoveryLoading: false,
	recoveryError: null,
	recoveryMode: false,

	// Nullable keys to satisfy type since we removed them from the store, but left them in type temporarily
	mek: null,
	personalKey: null,
	privateKey: null,
	collectionKeys: {},
};

export const passwordSlice = createSlice({
	name: "passwordManager",
	initialState,
	reducers: {
		setUserId: (state, action: PayloadAction<string>) => {
			state.userId = action.payload;
		},
		setCloudVaultStatus: (
			state,
			action: PayloadAction<CloudVaultStatus>,
		) => {
			state.cloudVaultStatus = action.payload;
			if (action.payload === "found") state.hasExistingVault = true;
			if (action.payload === "not_found") state.hasExistingVault = false;
		},
		handleNewItem: (state, action: PayloadAction<string | undefined>) => {
			state.activeItem = {
				id: crypto.randomUUID(),
				title: "",
				username: "",
				password: "",
				itemType:
					(action.payload as PasswordItem["itemType"]) || "login",
				collectionId: null, // default to personal
			};
			state.isNewItem = true;
			if (window.innerWidth < 768) state.isSidebarDrawerOpen = false;
		},
		handleSelect: (state, action: PayloadAction<PasswordItem>) => {
			state.activeItem = action.payload;
			state.isNewItem = false;
			if (window.innerWidth < 768) state.isSidebarDrawerOpen = false;
		},
		handleEdit: (state, action: PayloadAction<PasswordItem>) => {
			state.activeItem = action.payload;
			state.isNewItem = true;
		},
		handleCancelDetail: (state) => {
			state.activeItem = null;
			state.isNewItem = false;
		},
		setActiveFilter: (state, action: PayloadAction<string>) => {
			state.activeFilter = action.payload;
			state.activeItem = null;
			state.isNewItem = false;
			if (window.innerWidth < 768) state.isSidebarDrawerOpen = false;
		},
		setSidebarDrawerOpen: (state, action: PayloadAction<boolean>) => {
			state.isSidebarDrawerOpen = action.payload;
		},
		enableCloudSync: (state) => {
			state.isCloudSyncEnabled = true;
			state.cloudVaultStatus = "not_found"; // Proceed to setup
		},
		setCloudSyncEnabled: (state, action: PayloadAction<boolean>) => {
			state.isCloudSyncEnabled = action.payload;
		},
		clearRecoveryMnemonic: (state) => {
			state.recoveryMnemonic = null;
		},
		setRecoveryMode: (state, action: PayloadAction<boolean>) => {
			state.recoveryMode = action.payload;
			if (!action.payload) {
				state.recoveryError = null;
			}
		},
		lockVault: (state) => {
			keyStore.clear();
			state.personalItems = [];
			state.sharedCollections = [];
			state.folders = [];
			state.activeItem = null;
			state.isUnlocked = false;
		},
		resetVault: (state) => {
			keyStore.clear();
			state.personalItems = [];
			state.sharedCollections = [];
			state.folders = [];
			state.activeItem = null;
			state.isUnlocked = false;
			state.hasExistingVault = false;
			state.cloudVaultStatus = "not_found";
			state.hasRecoveryKey = false;
			state.recoveryMnemonic = null;
			state.recoveryMode = false;
			state.recoveryError = null;
			state.isNewItem = false;
		},
		setVault: (
			state,
			action: PayloadAction<{
				folders?: Folder[];
				items?: PasswordItem[];
			}>,
		) => {
			if (action.payload.folders) state.folders = action.payload.folders;
			if (action.payload.items)
				state.personalItems = action.payload.items;
		},
	},
	extraReducers: (builder) => {
		builder
			// initializeVault
			.addCase(initializeVault.pending, (state) => {
				state.loading = true;
			})
			.addCase(initializeVault.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(initializeVault.rejected, (state) => {
				state.loading = false;
			})
			// createVault
			.addCase(createVault.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createVault.fulfilled, (state) => {
				state.loading = false;
				state.hasExistingVault = true;
				state.cloudVaultStatus = "found";
				state.isUnlocked = true;
			})
			.addCase(createVault.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// unlockVault
			.addCase(unlockVault.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(unlockVault.fulfilled, (state, action) => {
				state.loading = false;
				state.folders = action.payload.folders || [];
				state.isUnlocked = true;
			})
			.addCase(unlockVault.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// fetchVaultData
			.addCase(fetchVaultData.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchVaultData.fulfilled, (state, action) => {
				state.loading = false;
				state.personalItems = action.payload.personalItems;

				// Group shared items by collection
				const rawSharedItems =
					(action.payload as { rawSharedItems?: PasswordItem[] })
						.rawSharedItems || [];
				if (state.sharedCollections) {
					for (const coll of state.sharedCollections) {
						coll.items = rawSharedItems.filter(
							(i: PasswordItem) =>
								i.collectionId === coll.collection.id,
						);
					}
				}
			})
			.addCase(fetchVaultData.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// persistItem
			.addCase(persistItem.pending, (state, action) => {
				const item = action.meta.arg;
				if (item.collectionId) {
					const collIndex = state.sharedCollections.findIndex(
						(c) => c.collection.id === item.collectionId,
					);
					if (collIndex >= 0) {
						const items = state.sharedCollections[collIndex].items;
						const index = items.findIndex(
							(i: PasswordItem) => i.id === item.id,
						);
						if (index >= 0) items[index] = item;
						else items.push(item);
					}
					state.personalItems = state.personalItems.filter(
						(i: PasswordItem) => i.id !== item.id,
					);
				} else {
					const index = state.personalItems.findIndex(
						(i: PasswordItem) => i.id === item.id,
					);
					if (index >= 0) {
						state.personalItems[index] = item;
					} else {
						state.personalItems.push(item);
					}
					state.sharedCollections.forEach((c) => {
						c.items = c.items.filter(
							(i: PasswordItem) => i.id !== item.id,
						);
					});
				}
				if (state.activeItem?.id === item.id) {
					state.activeItem = item;
				}
				state.isNewItem = false;
			})
			.addCase(persistItem.fulfilled, (state, action) => {
				const item = action.payload;
				if (item.collectionId) {
					const collIndex = state.sharedCollections.findIndex(
						(c) => c.collection.id === item.collectionId,
					);
					if (collIndex >= 0) {
						const items = state.sharedCollections[collIndex].items;
						const index = items.findIndex(
							(i: PasswordItem) => i.id === item.id,
						);
						if (index >= 0) items[index] = item;
						else items.push(item);
					}
					state.personalItems = state.personalItems.filter(
						(i: PasswordItem) => i.id !== item.id,
					);
				} else {
					const index = state.personalItems.findIndex(
						(i: PasswordItem) => i.id === item.id,
					);
					if (index >= 0) {
						state.personalItems[index] = item;
					} else {
						state.personalItems.push(item);
					}
					state.sharedCollections.forEach((c) => {
						c.items = c.items.filter(
							(i: PasswordItem) => i.id !== item.id,
						);
					});
				}
				if (state.activeItem?.id === item.id) {
					state.activeItem = item;
				}
				state.isNewItem = false;
			})
			.addCase(createFolderAsync.fulfilled, (state, action) => {
				state.folders.push(action.payload);
			})
			// deleteItem
			.addCase(deleteItem.fulfilled, (state, action) => {
				const id = action.payload;
				state.personalItems = state.personalItems.filter(
					(i: PasswordItem) => i.id !== id,
				);
				if (state.activeItem?.id === id) {
					state.activeItem = null;
				}
			})
			// Recovery
			.addCase(checkRecoveryKey.fulfilled, (state, action) => {
				state.hasRecoveryKey = action.payload;
			})
			.addCase(generateRecoveryKey.pending, (state) => {
				state.recoveryLoading = true;
			})
			.addCase(generateRecoveryKey.fulfilled, (state, action) => {
				state.recoveryLoading = false;
				state.recoveryMnemonic = action.payload;
				state.hasRecoveryKey = true;
			})
			.addCase(generateRecoveryKey.rejected, (state) => {
				state.recoveryLoading = false;
			})
			// persistFolders
			.addCase(persistFolders.fulfilled, (state, action) => {
				state.folders = action.payload;
			})
			// Sharing
			.addCase(fetchSharedCollections.fulfilled, (state, action) => {
				const collections = action.payload as {
					id: string;
					name: string;
					isHidden?: boolean;
					role: string;
					encryptedCollectionKey: string;
					updatedAt: string;
				}[];
				state.sharedCollections = collections.map((c) => {
					// Merge existing items if any
					const existing = state.sharedCollections.find(
						(ex) => ex.collection.id === c.id,
					);
					return {
						collection: {
							id: c.id,
							name: c.name,
							createdBy: "",
							isHidden: c.isHidden,
							updatedAt: c.updatedAt,
						},
						access: {
							id: "",
							collectionId: c.id,
							userId: state.userId,
							role: c.role,
							encryptedCollectionKey: c.encryptedCollectionKey,
						},
						items: existing ? existing.items : [],
						members: [],
					} as SharedCollectionWithMembers;
				});
			})
			.addCase(shareItem.fulfilled, () => {
				// After a successful share, we can fetch everything to sync up
				// For now, it will just show success.
				// The fetchVaultData call triggered subsequently or websocket will populate it.
			})
			.addCase(shareFolder.fulfilled, (state, action) => {
				const { folderId, collectionId } = action.payload;

				// Update the folder with collectionId
				const folderIndex = state.folders.findIndex(
					(f) => f.id === folderId,
				);
				if (folderIndex !== -1) {
					state.folders[folderIndex].collectionId = collectionId;
				}

				// Assign collectionId to items in state
				state.personalItems = state.personalItems.map((item) =>
					item.folderId === folderId
						? { ...item, collectionId }
						: item,
				);
			});
	},
});

export const {
	setUserId,
	setCloudVaultStatus,
	handleNewItem,
	handleSelect,
	handleEdit,
	handleCancelDetail,
	setActiveFilter,
	setSidebarDrawerOpen,
	enableCloudSync,
	setCloudSyncEnabled,
	clearRecoveryMnemonic,
	setRecoveryMode,
	lockVault,
	resetVault,
	setVault,
} = passwordSlice.actions;

// Selectors
export const selectUserId = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.userId;
export const selectPersonalItems = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.personalItems;
export const selectFolders = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.folders;
export const selectSharedCollections = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.sharedCollections;

export const selectVaultLoading = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.loading;
export const selectVaultError = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.error;
export const selectHasExistingVault = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.hasExistingVault;
export const selectCloudVaultStatus = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.cloudVaultStatus;
export const selectActiveItem = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.activeItem;
export const selectIsNewItem = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.isNewItem;
export const selectActiveFilter = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.activeFilter;
export const selectIsSidebarDrawerOpen = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.isSidebarDrawerOpen;
export const selectIsUnlocked = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.isUnlocked;
export const selectIsCloudSyncEnabled = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.isCloudSyncEnabled;
export const selectIsSyncing = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.isSyncing;

export const selectRecoveryMnemonic = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.recoveryMnemonic;
export const selectHasRecoveryKey = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.hasRecoveryKey;
export const selectRecoveryLoading = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.recoveryLoading;
export const selectRecoveryError = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.recoveryError;
export const selectRecoveryMode = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.recoveryMode;

export const selectMergedFolders = createSelector(
	[selectFolders, selectSharedCollections],
	(folders, sharedCollections) => {
		const merged = [...folders];

		sharedCollections.forEach((sc) => {
			if (!sc.collection.isHidden && sc.access.role !== "owner") {
				// Recipient of a shared folder
				if (!merged.some((f) => f.collectionId === sc.collection.id)) {
					merged.push({
						id: sc.collection.id, // Using collection ID as the folder ID for virtual folders
						name: sc.collection.name,
						color: "#64748b", // Default color for virtual folders
						collectionId: sc.collection.id,
						isVirtual: true, // We can use this flag in UI to disable edits
					});
				}
			}
		});

		return merged;
	},
);

// Vault selector with proper memoization
export const selectVault = createSelector(
	[selectPersonalItems, selectSharedCollections, selectFolders],
	(personalItems, sharedCollections, folders) => {
		let allItems = [...personalItems];
		for (const coll of sharedCollections) {
			allItems = allItems.concat(coll.items);
		}
		return {
			items: allItems,
			folders,
			version: 1,
			updatedAt: "v1",
		};
	},
);

export default passwordSlice.reducer;
