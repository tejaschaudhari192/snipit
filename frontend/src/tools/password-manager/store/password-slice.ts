import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
	type ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import type {
	CloudVaultStatus,
	Vault,
	PasswordItem,
	VaultRecord,
} from "@/tools/password-manager/types";
import {
	decryptVault,
	encryptVault,
	fetchVaultFromCloud,
	syncVaultToCloud,
} from "@/tools/password-manager/utils/vault";
import {
	getVaultRecord,
	setVaultRecord,
	getRecoveryRecord,
	setRecoveryRecord,
} from "@/tools/password-manager/utils/indexed-db";
import {
	generateRecoveryMnemonic,
	encryptMasterPassword,
	decryptMasterPassword,
	isValidMnemonic,
} from "@/tools/password-manager/utils/recovery";
import { localStore } from "@/utils/storage";

// ─── State ───────────────────────────────────────────────────────────────────

export interface PasswordManagerState {
	userId: string;
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
	// Recovery key
	recoveryMnemonic: string | null;
	hasRecoveryKey: boolean;
	recoveryLoading: boolean;
	recoveryError: string | null;
	recoveryMode: boolean; // true when recovering via mnemonic (before setting new password)
}

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: PasswordManagerState = {
	userId: "",
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
	recoveryMnemonic: null,
	hasRecoveryKey: false,
	recoveryLoading: false,
	recoveryError: null,
	recoveryMode: false,
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
		const { userId } = state.passwordManager;

		if (!userId) {
			return { hasLocal: false, cloudStatus: "idle" as CloudVaultStatus };
		}

		const record = await getVaultRecord(userId);
		const hasLocal = !!record;

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
		const { userId } = state.passwordManager;

		let stored: string | null = null;
		let currentVersion = 0;

		if (userId) {
			const record = await getVaultRecord(userId);
			if (record) {
				stored = record.encryptedBlob;
				currentVersion = record.version;
			}
		}

		// If cloud sync is enabled, try to fetch from cloud first
		if (state.passwordManager.isCloudSyncEnabled) {
			const cloudData = await fetchVaultFromCloud();
			if (cloudData && cloudData.encryptedBlob) {
				// Use whichever has the higher version (cloud is head)
				if (cloudData.version >= currentVersion) {
					stored = cloudData.encryptedBlob;
					currentVersion = cloudData.version;
				}
			}
		}

		if (stored) {
			const vault = await decryptVault(masterPassword, stored);
			if (!vault) {
				throw new Error("Incorrect master password");
			}
			return { vault, masterPassword, version: currentVersion };
		}

		// No vault exists yet, create an empty one
		return {
			vault: { items: [] } as Vault,
			masterPassword,
			version: 0,
		};
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
		const { vault, masterPassword, isCloudSyncEnabled, userId } =
			state.passwordManager;
		if (!vault || !masterPassword || !userId) return;

		const enc = await encryptVault(vault, masterPassword);

		// Read current record to get the latest version
		const existing = await getVaultRecord(userId);
		const nextVersion = (existing?.version ?? 0) + 1;

		const record: VaultRecord = {
			userId,
			version: nextVersion,
			encryptedBlob: enc,
			updatedAt: new Date().toISOString(),
		};
		await setVaultRecord(record);

		if (isCloudSyncEnabled) {
			await syncVaultToCloud(enc, nextVersion);
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
		const cloudData = await fetchVaultFromCloud();
		return { hasCloudVault: !!(cloudData && cloudData.encryptedBlob) };
	},
);

// ─── Recovery Key Thunks ────────────────────────────────────────────────────

/**
 * Generate a recovery key and encrypt the current master password with it.
 * Stores the encrypted blob in IndexedDB.
 */
export const generateRecoveryKey = createAsyncThunk(
	"passwordManager/generateRecoveryKey",
	async (_, { getState }) => {
		const state = getState() as { passwordManager: PasswordManagerState };
		const { masterPassword, userId } = state.passwordManager;
		if (!masterPassword || !userId) {
			throw new Error("No master password or user ID");
		}

		const mnemonic = generateRecoveryMnemonic();
		const encrypted = await encryptMasterPassword(mnemonic, masterPassword);

		await setRecoveryRecord({
			userId,
			encryptedMasterPassword: encrypted.encrypted,
			salt: encrypted.salt,
			iv: encrypted.iv,
			updatedAt: new Date().toISOString(),
		});

		return { mnemonic };
	},
);

/**
 * Check if a recovery key exists for the current user.
 */
export const checkRecoveryKey = createAsyncThunk(
	"passwordManager/checkRecoveryKey",
	async (_, { getState }) => {
		const state = getState() as { passwordManager: PasswordManagerState };
		const { userId } = state.passwordManager;
		if (!userId) return false;
		const record = await getRecoveryRecord(userId);
		return !!record;
	},
);

/**
 * Recover the vault using a recovery mnemonic phrase.
 * Decrypts the master password, then unlocks the vault.
 */
export const recoverWithMnemonic = createAsyncThunk(
	"passwordManager/recoverWithMnemonic",
	async (mnemonic: string, { getState }) => {
		const state = getState() as { passwordManager: PasswordManagerState };
		const { userId } = state.passwordManager;
		if (!userId) throw new Error("No user ID");

		if (!isValidMnemonic(mnemonic)) {
			throw new Error("Invalid recovery phrase");
		}

		const record = await getRecoveryRecord(userId);
		if (!record) {
			throw new Error("No recovery key found for this account");
		}

		const masterPassword = await decryptMasterPassword(mnemonic, {
			encrypted: record.encryptedMasterPassword,
			salt: record.salt,
			iv: record.iv,
		});

		// Now unlock the vault with the recovered master password
		const vaultRecord = await getVaultRecord(userId);
		if (!vaultRecord) {
			throw new Error("No vault found");
		}

		const vault = await decryptVault(
			masterPassword,
			vaultRecord.encryptedBlob,
		);
		if (!vault) {
			throw new Error("Failed to decrypt vault with recovered password");
		}

		return { vault, masterPassword };
	},
);

/**
 * Reset the master password after recovery.
 * Re-encrypts the vault with the new password and generates a new recovery key.
 */
export const resetMasterPassword = createAsyncThunk(
	"passwordManager/resetMasterPassword",
	async (newPassword: string, { getState }) => {
		const state = getState() as { passwordManager: PasswordManagerState };
		const { vault, userId } = state.passwordManager;
		if (!vault || !userId) throw new Error("No vault or user ID");

		// Re-encrypt vault with new password
		const enc = await encryptVault(vault, newPassword);
		const existing = await getVaultRecord(userId);
		const nextVersion = (existing?.version ?? 0) + 1;

		await setVaultRecord({
			userId,
			version: nextVersion,
			encryptedBlob: enc,
			updatedAt: new Date().toISOString(),
		});

		// Generate new recovery key for the new password
		const mnemonic = generateRecoveryMnemonic();
		const encrypted = await encryptMasterPassword(mnemonic, newPassword);
		await setRecoveryRecord({
			userId,
			encryptedMasterPassword: encrypted.encrypted,
			salt: encrypted.salt,
			iv: encrypted.iv,
			updatedAt: new Date().toISOString(),
		});

		return { vault, masterPassword: newPassword, mnemonic };
	},
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const passwordSlice = createSlice({
	name: "passwordManager",
	initialState,
	reducers: {
		setUserId(state, action: PayloadAction<string>) {
			state.userId = action.payload;
		},
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
		setRecoveryMnemonic(state, action: PayloadAction<string | null>) {
			state.recoveryMnemonic = action.payload;
		},
		clearRecoveryMnemonic(state) {
			state.recoveryMnemonic = null;
		},
		setHasRecoveryKey(state, action: PayloadAction<boolean>) {
			state.hasRecoveryKey = action.payload;
		},
		setRecoveryMode(state, action: PayloadAction<boolean>) {
			state.recoveryMode = action.payload;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<PasswordManagerState>) => {
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

		// ── generateRecoveryKey ──────────────────────────────────────────
		builder
			.addCase(generateRecoveryKey.pending, (state) => {
				state.recoveryLoading = true;
				state.recoveryError = null;
			})
			.addCase(generateRecoveryKey.fulfilled, (state, action) => {
				state.recoveryLoading = false;
				state.recoveryMnemonic = action.payload.mnemonic;
				state.hasRecoveryKey = true;
			})
			.addCase(generateRecoveryKey.rejected, (state, action) => {
				state.recoveryLoading = false;
				state.recoveryError =
					action.error.message ?? "Failed to generate recovery key";
			});

		// ── checkRecoveryKey ─────────────────────────────────────────────
		builder.addCase(checkRecoveryKey.fulfilled, (state, action) => {
			state.hasRecoveryKey = action.payload;
		});

		// ── recoverWithMnemonic ──────────────────────────────────────────
		builder
			.addCase(recoverWithMnemonic.pending, (state) => {
				state.recoveryLoading = true;
				state.recoveryError = null;
			})
			.addCase(recoverWithMnemonic.fulfilled, (state, action) => {
				state.recoveryLoading = false;
				state.vault = action.payload.vault;
				state.masterPassword = action.payload.masterPassword;
				state.recoveryMode = true;
				state.error = null;
			})
			.addCase(recoverWithMnemonic.rejected, (state, action) => {
				state.recoveryLoading = false;
				state.recoveryError =
					action.error.message ?? "Failed to recover vault";
			});

		// ── resetMasterPassword ──────────────────────────────────────────
		builder
			.addCase(resetMasterPassword.pending, (state) => {
				state.recoveryLoading = true;
				state.recoveryError = null;
			})
			.addCase(resetMasterPassword.fulfilled, (state, action) => {
				state.recoveryLoading = false;
				state.vault = action.payload.vault;
				state.masterPassword = action.payload.masterPassword;
				state.recoveryMnemonic = action.payload.mnemonic;
				state.recoveryMode = false;
				state.error = null;
			})
			.addCase(resetMasterPassword.rejected, (state, action) => {
				state.recoveryLoading = false;
				state.recoveryError =
					action.error.message ?? "Failed to reset master password";
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

// ─── Recovery Selectors ─────────────────────────────────────────────────────

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

// ─── Exports ─────────────────────────────────────────────────────────────────

export const {
	setUserId,
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
	setRecoveryMnemonic,
	clearRecoveryMnemonic,
	setHasRecoveryKey,
	setRecoveryMode,
} = passwordSlice.actions;

export default passwordSlice.reducer;
