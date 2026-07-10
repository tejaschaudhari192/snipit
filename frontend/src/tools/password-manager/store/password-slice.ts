import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type {
	CloudVaultStatus,
	Vault,
	PasswordItem,
} from "@/tools/password-manager/types";
import {
	decryptVault,
	encryptVault,
	fetchVaultFromCloud,
	syncVaultToCloud,
	STORAGE_KEY,
} from "@/tools/password-manager/utils/vault";
import { getItem, setItem } from "@/tools/password-manager/utils/indexed-db";
import { localStore } from "@/utils/storage";

// ─── State ───────────────────────────────────────────────────────────────────

export interface PasswordManagerState {
	masterPassword: string;
	vault: Vault | null;
	loading: boolean;
	error: string | null;
	isCloudSyncEnabled: boolean;
	isSyncing: boolean;
	hasExistingVault: boolean | null;
	cloudVaultStatus: CloudVaultStatus;
	activeItem: PasswordItem | null;
	isNewItem: boolean;
	activeFilter: string;
	isSidebarDrawerOpen: boolean;
}

const initialState: PasswordManagerState = {
	masterPassword: "",
	vault: null,
	loading: false,
	error: null,
	isCloudSyncEnabled: localStore.getItem("snipit-cloud-sync") === "true",
	isSyncing: false,
	hasExistingVault: null,
	cloudVaultStatus: "idle",
	activeItem: null,
	isNewItem: false,
	activeFilter: "all",
	isSidebarDrawerOpen: false,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

/**
 * Check IndexedDB for an existing vault and optionally check cloud.
 * Sets hasExistingVault and cloudVaultStatus.
 */
export const initializeVault = createAsyncThunk(
	"passwordManager/initializeVault",
	async (_, { getState }) => {
		const state = getState() as { passwordManager: PasswordManagerState };
		const stored = await getItem(STORAGE_KEY);
		const hasLocal = !!stored;

		// Check cloud if user is logged in and sync is not enabled
		let cloudStatus: CloudVaultStatus = "idle";
		if (!state.passwordManager.isCloudSyncEnabled) {
			cloudStatus = "checking";
			const cloudData = await fetchVaultFromCloud();
			cloudStatus =
				cloudData && cloudData.encryptedBlob ? "found" : "not_found";
		}

		return { hasLocal, cloudStatus };
	},
);

/**
 * Load vault from IndexedDB and decrypt with master password.
 */
export const unlockVault = createAsyncThunk(
	"passwordManager/unlockVault",
	async (masterPassword: string, { getState }) => {
		const state = getState() as { passwordManager: PasswordManagerState };
		let stored = await getItem(STORAGE_KEY);

		// Migration: if nothing in IDB, check localStorage
		if (!stored) {
			const legacyStored = localStore.getItem(STORAGE_KEY);
			if (legacyStored) {
				await setItem(STORAGE_KEY, legacyStored);
				stored = legacyStored;
				localStore.removeItem(STORAGE_KEY);
			}
		}

		// If cloud sync is enabled, try to fetch from cloud first
		if (state.passwordManager.isCloudSyncEnabled) {
			const cloudData = await fetchVaultFromCloud();
			if (cloudData && cloudData.encryptedBlob) {
				stored = cloudData.encryptedBlob;
				await setItem(STORAGE_KEY, stored);
			}
		}

		if (stored) {
			const vault = await decryptVault(masterPassword, stored);
			if (!vault) {
				throw new Error("Incorrect master password");
			}
			return { vault, masterPassword };
		}

		// No vault exists yet, create an empty one
		return { vault: { items: [] } as Vault, masterPassword };
	},
);

/**
 * Create a new vault with the given master password.
 */
export const createVault = createAsyncThunk(
	"passwordManager/createVault",
	async (masterPassword: string) => {
		const vault: Vault = { items: [] };
		return { vault, masterPassword };
	},
);

/**
 * Encrypt the current vault and persist to IndexedDB + optionally cloud.
 */
export const persistVault = createAsyncThunk(
	"passwordManager/persistVault",
	async (_, { getState }) => {
		const state = getState() as { passwordManager: PasswordManagerState };
		const { vault, masterPassword, isCloudSyncEnabled } =
			state.passwordManager;
		if (!vault || !masterPassword) return;

		const enc = await encryptVault(vault, masterPassword);
		await setItem(STORAGE_KEY, enc);

		if (isCloudSyncEnabled) {
			await syncVaultToCloud(enc);
		}
	},
);

/**
 * Enable cloud sync and optionally fetch vault from cloud.
 */
export const enableCloudSync = createAsyncThunk(
	"passwordManager/enableCloudSync",
	async () => {
		localStore.setItem("snipit-cloud-sync", "true");
		// Fetch cloud vault to check if it exists
		const cloudData = await fetchVaultFromCloud();
		return { hasCloudVault: !!(cloudData && cloudData.encryptedBlob) };
	},
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const passwordSlice = createSlice({
	name: "passwordManager",
	initialState,
	reducers: {
		setMasterPassword(state, action: PayloadAction<string>) {
			state.masterPassword = action.payload;
		},
		setVault(state, action: PayloadAction<Vault | null>) {
			state.vault = action.payload;
		},
		clearVault(state) {
			state.vault = null;
			state.masterPassword = "";
			state.error = null;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		setCloudSyncEnabled(state, action: PayloadAction<boolean>) {
			state.isCloudSyncEnabled = action.payload;
			localStore.setItem(
				"snipit-cloud-sync",
				action.payload ? "true" : "false",
			);
		},
		setSyncing(state, action: PayloadAction<boolean>) {
			state.isSyncing = action.payload;
		},
		setHasExistingVault(state, action: PayloadAction<boolean | null>) {
			state.hasExistingVault = action.payload;
		},
		setCloudVaultStatus(state, action: PayloadAction<CloudVaultStatus>) {
			state.cloudVaultStatus = action.payload;
		},
		setActiveItem(state, action: PayloadAction<PasswordItem | null>) {
			state.activeItem = action.payload;
		},
		setIsNewItem(state, action: PayloadAction<boolean>) {
			state.isNewItem = action.payload;
		},
		setActiveFilter(state, action: PayloadAction<string>) {
			state.activeFilter = action.payload;
		},
		setSidebarDrawerOpen(state, action: PayloadAction<boolean>) {
			state.isSidebarDrawerOpen = action.payload;
		},
		handleNewItem(state, action: PayloadAction<string | undefined>) {
			state.activeItem = {
				itemType: action.payload ?? "login",
			} as PasswordItem;
			state.isNewItem = true;
		},
		handleSelect(state, action: PayloadAction<PasswordItem>) {
			state.activeItem = action.payload;
			state.isNewItem = false;
		},
		handleEdit(state, action: PayloadAction<PasswordItem>) {
			state.activeItem = action.payload;
			state.isNewItem = true;
		},
		handleCancelDetail(state) {
			state.activeItem = null;
			state.isNewItem = false;
		},
		deleteItem(state, action: PayloadAction<string>) {
			if (state.vault) {
				state.vault = {
					...state.vault,
					items: state.vault.items.filter(
						(item) => item.id !== action.payload,
					),
					updatedAt: new Date().toISOString(),
				};
			}
		},
	},
	extraReducers: (builder) => {
		// ── initializeVault ──────────────────────────────────────────────
		builder
			.addCase(initializeVault.pending, (state) => {
				state.loading = true;
			})
			.addCase(initializeVault.fulfilled, (state, action) => {
				state.loading = false;
				state.hasExistingVault = action.payload.hasLocal;
				state.cloudVaultStatus = action.payload.cloudStatus;
			})
			.addCase(initializeVault.rejected, (state) => {
				state.loading = false;
				state.hasExistingVault = false;
				state.cloudVaultStatus = "not_found";
			});

		// ── unlockVault ──────────────────────────────────────────────────
		builder
			.addCase(unlockVault.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(unlockVault.fulfilled, (state, action) => {
				state.loading = false;
				state.vault = action.payload.vault;
				state.masterPassword = action.payload.masterPassword;
				state.error = null;
			})
			.addCase(unlockVault.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to unlock vault";
			});

		// ── createVault ──────────────────────────────────────────────────
		builder
			.addCase(createVault.pending, (state) => {
				state.loading = true;
			})
			.addCase(createVault.fulfilled, (state, action) => {
				state.loading = false;
				state.vault = action.payload.vault;
				state.masterPassword = action.payload.masterPassword;
				state.error = null;
			})
			.addCase(createVault.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to create vault";
			});

		// ── persistVault ─────────────────────────────────────────────────
		builder
			.addCase(persistVault.pending, (state) => {
				state.isSyncing = true;
			})
			.addCase(persistVault.fulfilled, (state) => {
				state.isSyncing = false;
			})
			.addCase(persistVault.rejected, (state) => {
				state.isSyncing = false;
			});

		// ── enableCloudSync ──────────────────────────────────────────────
		builder
			.addCase(enableCloudSync.pending, (state) => {
				state.isSyncing = true;
			})
			.addCase(enableCloudSync.fulfilled, (state, action) => {
				state.isSyncing = false;
				state.isCloudSyncEnabled = true;
				state.cloudVaultStatus = action.payload.hasCloudVault
					? "found"
					: "not_found";
				state.hasExistingVault = action.payload.hasCloudVault
					? true
					: state.hasExistingVault;
			})
			.addCase(enableCloudSync.rejected, (state) => {
				state.isSyncing = false;
			});
	},
});

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectPasswordManager = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager;

export const selectMasterPassword = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.masterPassword;

export const selectVault = (state: { passwordManager: PasswordManagerState }) =>
	state.passwordManager.vault;

export const selectVaultLoading = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.loading;

export const selectVaultError = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.error;

export const selectIsCloudSyncEnabled = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.isCloudSyncEnabled;

export const selectIsSyncing = (state: {
	passwordManager: PasswordManagerState;
}) => state.passwordManager.isSyncing;

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

// ─── Exports ─────────────────────────────────────────────────────────────────

export const {
	setMasterPassword,
	setVault,
	clearVault,
	setLoading,
	setError,
	setCloudSyncEnabled,
	setSyncing,
	setHasExistingVault,
	setCloudVaultStatus,
	setActiveItem,
	setIsNewItem,
	setActiveFilter,
	setSidebarDrawerOpen,
	handleNewItem,
	handleSelect,
	handleEdit,
	handleCancelDetail,
	deleteItem,
} = passwordSlice.actions;

export default passwordSlice.reducer;
