import { createSelector } from "@reduxjs/toolkit";
import type { PasswordManagerState } from "../types";

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
