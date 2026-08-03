import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { keyStore } from "../key-store";
import { encryptPayload } from "../../utils/crypto";
import type { PasswordManagerState, PasswordItem } from "../../types";

// Import temporarily from slice
import { fetchVaultData } from "./vault";
import { deleteCollection } from "./sharing";

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
