import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { keyStore } from "../key-store";
import { encryptPayload } from "../../utils/crypto";
import type { PasswordManagerState, PasswordItem, Folder } from "../../types";

import { fetchVaultData } from "./vault";
import { setVault, setActiveFilter } from "../password-slice";
import { fetchSharedCollections } from "./sharing";

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
