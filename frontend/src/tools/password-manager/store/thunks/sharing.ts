import { createAsyncThunk } from "@reduxjs/toolkit";
import {
	revokeVaultAccess,
	lookupShareUser,
	shareVaultItem,
	shareVaultFolder,
	getVaultCollections,
	deleteVaultCollection,
} from "@/tools/password-manager/api/password-manager";
import { keyStore } from "@/tools/password-manager/store/key-store";
import {
	generateSymmetricKey,
	encryptCollectionKeyForUser,
	decryptCollectionKey,
	encryptPayload,
} from "@/tools/password-manager/utils/crypto";
import { logger } from "@/utils/logger";
import type {
	PasswordManagerState,
	ShareItemPayload,
	ShareFolderPayload,
	ServerCollection,
	LookupShareUserResponse,
	ShareVaultItemResponse,
	ShareVaultFolderResponse,
} from "@/tools/password-manager/types";

import { persistFolders } from "./folders";

export const fetchSharedCollections = createAsyncThunk(
	"passwordManager/fetchSharedCollections",
	async (_, { rejectWithValue }) => {
		const privateKey = keyStore.getPrivateKey();
		if (!privateKey) return rejectWithValue("Vault is locked");

		try {
			const res = await getVaultCollections<{
				data: ServerCollection[];
			}>();
			const collections = res.data || [];

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

export const deleteCollection = createAsyncThunk(
	"passwordManager/deleteCollection",
	async (collectionId: string, { rejectWithValue, dispatch }) => {
		try {
			await deleteVaultCollection(collectionId);
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
			const lookupRes = await lookupShareUser<{
				data: LookupShareUserResponse;
			}>({ email: payload.targetEmail });
			const { userId: targetUserId, publicKey: theirPublicKey } =
				lookupRes.data;

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
			const shareRes = await shareVaultItem<{
				data: ShareVaultItemResponse;
			}>({
				targetUserId,
				encryptedCollectionKeyForOwner,
				encryptedCollectionKeyForRecipient,
				role: payload.role,
				itemId: payload.item.id,
				encryptedPayload,
				itemTitle: payload.item.title,
			});

			const { collectionId, itemId } = shareRes.data;

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
			const lookupRes = await lookupShareUser<{
				data: LookupShareUserResponse;
			}>({ email: payload.targetEmail });
			const { userId: targetUserId, publicKey: theirPublicKey } =
				lookupRes.data;

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
			const shareRes = await shareVaultFolder<{
				data: ShareVaultFolderResponse;
			}>({
				targetUserId,
				encryptedCollectionKeyForOwner,
				encryptedCollectionKeyForRecipient,
				role: payload.role,
				folderName: payload.folderName,
				items: encryptedItems,
			});

			const { collectionId } = shareRes.data;
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
			await revokeVaultAccess(accessId);
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
