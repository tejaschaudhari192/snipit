import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
	PasswordManagerState,
	CloudVaultStatus,
	PasswordItem,
	Folder,
	SharedCollectionWithMembers,
} from "../types";

import { keyStore } from "./key-store";

import {
	initializeVault,
	createVault,
	unlockVault,
	fetchVaultData,
	persistItem,
	deleteItem,
	persistFolders,
	createFolderAsync,
	fetchSharedCollections,
	shareItem,
	shareFolder,
	checkRecoveryKey,
	generateRecoveryKey,
} from "./thunks";

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

const updatePersistedItemInState = (
	state: PasswordManagerState,
	item: PasswordItem,
) => {
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
			c.items = c.items.filter((i: PasswordItem) => i.id !== item.id);
		});
	}
	if (state.activeItem?.id === item.id) {
		state.activeItem = item;
	}
	state.isNewItem = false;
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
				updatePersistedItemInState(state, action.meta.arg);
			})
			.addCase(persistItem.fulfilled, (state, action) => {
				updatePersistedItemInState(state, action.payload);
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
			.addCase(fetchSharedCollections.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchSharedCollections.fulfilled, (state, action) => {
				state.loading = false;
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

export * from "./selectors";

export default passwordSlice.reducer;
