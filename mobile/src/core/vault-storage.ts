import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import naclUtil from "tweetnacl-util";
import {
    deriveMEK,
    encryptSymmetric,
    decryptSymmetric,
} from "./crypto";
import {
    encryptMasterPasswordWithMnemonic,
    decryptMasterPasswordWithMnemonic,
} from "./recovery";
import { CONFIG } from "../config/configuration";

export interface VaultMetadata {
    salt: string;
    verifier?: string;
    encryptedPersonalKey?: string;
    encryptedSettings?: string;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface RecoveryRecord {
    encrypted: string;
    salt: string;
}

export interface CustomField {
    id: string;
    name: string;
    value: string;
    type: "text" | "password" | "url" | "date" | "number" | "email";
    isProtected?: boolean;
}

export interface CardMetadata {
    cardholderName?: string;
    cardNumber?: string;
    expiration?: string;
    cvv?: string;
    pin?: string;
    zipCode?: string;
}

export interface Folder {
    id: string;
    name: string;
    color: string;
    iconName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PasswordItem {
    id: string;
    title: string;
    username?: string;
    password?: string;
    url?: string;
    notes?: string;
    category: "login" | "card" | "apikey" | "note" | "identity";
    isFavorite?: boolean;
    folderId?: string;
    metadata?: Record<string, string>;
    customFields?: CustomField[];
    createdAt: string;
    updatedAt: string;
}

export interface UserSession {
    id: string;
    email: string;
    username: string;
    token?: string;
    avatar?: string;
}

const STORAGE_KEYS = {
    AUTH_USER: "@snipit/auth_user",
    VAULT_META: "@snipit/pwmg_meta",
    ENCRYPTED_ITEMS: "@snipit/pwmg_items",
    ENCRYPTED_FOLDERS: "@snipit/pwmg_folders",
    RECOVERY_RECORD: "@snipit/pwmg_recovery",
    API_BASE_URL: "@snipit/api_url",
    THEME: "@snipit/theme",
    DEFAULT_TOOL: "@snipit/default_tool",
    PENDING_DELETES: "@snipit/pwmg_pending_deletes",
    PENDING_FOLDER_DELETES: "@snipit/pwmg_pending_folder_deletes",
    PENDING_ITEM_UPSERTS: "@snipit/pwmg_pending_item_upserts",
    PENDING_FOLDER_UPSERTS: "@snipit/pwmg_pending_folder_upserts",
    SYNCED_ITEM_IDS: "@snipit/pwmg_synced_item_ids",
    SYNCED_FOLDER_IDS: "@snipit/pwmg_synced_folder_ids",
    BIOMETRICS_ENABLED: "@snipit/pwmg_biometrics_enabled",
    BIOMETRIC_VAULT_PAYLOAD: "snipit_biometric_vault_payload",
    UI_STYLE: "@snipit/ui_style",
};

export class OfflineVaultService {
    private activeMEK: Uint8Array | null = null;
    private activePersonalKey: Uint8Array | null = null;
    private currentUser: UserSession | null = null;
    private syncListeners = new Set<() => void>();

    onSync(cb: () => void): () => void {
        this.syncListeners.add(cb);
        return () => {
            this.syncListeners.delete(cb);
        };
    }

    private notifySyncListeners() {
        this.syncListeners.forEach((cb) => {
            try {
                cb();
            } catch (e) {
                console.log("Error in sync listener:", e);
            }
        });
    }

    // ─── CLOUD VAULT INTEGRATION ───────────────────────────────────────────────

    async checkCloudVault(): Promise<boolean> {
        const user = await this.getUser();
        if (!user || !user.token) return false;

        try {
            const baseUrl = await this.getApiBaseUrl();
            const res = await fetch(`${baseUrl}/tools/password-manager/vault`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            if (res.ok) {
                const body = await res.json();
                if (body.data && (body.data.encryptedPersonalKey || body.data.encryptedBlob)) {
                    let salt = body.data.salt;
                    if (!salt && user.id) {
                        try {
                            salt = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, user.id);
                        } catch {
                            salt = user.id;
                        }
                    }

                    const meta: VaultMetadata = {
                        salt,
                        encryptedPersonalKey: body.data.encryptedPersonalKey || body.data.encryptedBlob,
                        encryptedSettings: body.data.encryptedSettings,
                        userId: user.id,
                        createdAt: body.data.createdAt || new Date().toISOString(),
                        updatedAt: body.data.updatedAt || new Date().toISOString(),
                    };
                    await AsyncStorage.setItem(STORAGE_KEYS.VAULT_META, JSON.stringify(meta));
                    return true;
                }
            }
            return false;
        } catch (e) {
            console.log("Error checking cloud vault:", e);
            return false;
        }
    }

    // ─── AUTH & ACCOUNT ────────────────────────────────────────────────────────

    async getUser(): Promise<UserSession | null> {
        if (this.currentUser) return this.currentUser;
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
        if (raw) {
            this.currentUser = JSON.parse(raw);
        }
        return this.currentUser;
    }

    async saveUser(user: UserSession): Promise<void> {
        this.currentUser = user;
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    }

    async logout(): Promise<void> {
        this.currentUser = null;
        this.activeMEK = null;
        this.activePersonalKey = null;
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }

    async getApiBaseUrl(): Promise<string> {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.API_BASE_URL);
        if (saved) {
            const clean = saved.replace(/\/+$/, "");
            if (clean.endsWith("/api/v1")) return clean;
            if (clean.endsWith("/api")) return `${clean}/v1`;
            return `${clean}/api/v1`;
        }
        return CONFIG.DEFAULT_API_URL;
    }

    async setApiBaseUrl(url: string): Promise<void> {
        const clean = url.trim().replace(/\/+$/, "");
        const normalized = clean.endsWith("/api/v1")
            ? clean
            : clean.endsWith("/api")
                ? `${clean}/v1`
                : `${clean}/api/v1`;
        await AsyncStorage.setItem(STORAGE_KEYS.API_BASE_URL, normalized);
    }

    // ─── VAULT METADATA & RECOVERY ─────────────────────────────────────────────

    async hasVault(): Promise<boolean> {
        const meta = await AsyncStorage.getItem(STORAGE_KEYS.VAULT_META);
        return !!meta;
    }

    async hasRecoveryRecord(): Promise<boolean> {
        const rec = await AsyncStorage.getItem(STORAGE_KEYS.RECOVERY_RECORD);
        return !!rec;
    }

    async saveRecoveryRecord(mnemonic: string, masterPassword: string): Promise<void> {
        const record = await encryptMasterPasswordWithMnemonic(mnemonic, masterPassword);
        await AsyncStorage.setItem(STORAGE_KEYS.RECOVERY_RECORD, JSON.stringify(record));
    }

    async recoverWithMnemonic(mnemonic: string): Promise<string> {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECOVERY_RECORD);
        if (!raw) {
            throw new Error("No recovery record found on this device.");
        }
        const record: RecoveryRecord = JSON.parse(raw);
        const password = await decryptMasterPasswordWithMnemonic(
            mnemonic,
            record.encrypted,
            record.salt,
        );
        return password;
    }

    // ─── VAULT CREATION & UNLOCK ───────────────────────────────────────────────

    async createVault(masterPassword: string, mnemonic?: string): Promise<void> {
        const salt = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const mek = await deriveMEK(masterPassword, salt);
        const verifier = encryptSymmetric({ check: "snipit-vault-ok" }, mek);

        const user = await this.getUser();
        const meta: VaultMetadata = {
            salt,
            verifier,
            userId: user?.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(STORAGE_KEYS.VAULT_META, JSON.stringify(meta));
        const emptyEncrypted = encryptSymmetric([], mek);
        await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_ITEMS, emptyEncrypted);

        if (mnemonic) {
            await this.saveRecoveryRecord(mnemonic, masterPassword);
        }

        this.activeMEK = mek;
        this.activePersonalKey = mek;
    }

    async unlockVault(masterPassword: string): Promise<boolean> {
        const metaRaw = await AsyncStorage.getItem(STORAGE_KEYS.VAULT_META);
        if (!metaRaw) return false;

        const meta: VaultMetadata = JSON.parse(metaRaw);
        let salt = meta.salt;
        if (!salt && meta.userId) {
            if (typeof crypto !== "undefined" && crypto.subtle) {
                const enc = new TextEncoder();
                const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(meta.userId));
                salt = Array.from(new Uint8Array(hashBuffer))
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
            }
        }

        const mek = await deriveMEK(masterPassword, salt);

        // 1. Cloud Vault (from website)
        if (meta.encryptedPersonalKey) {
            try {
                const personalKeyB64 = decryptSymmetric<string>(meta.encryptedPersonalKey, mek);
                if (personalKeyB64 && typeof personalKeyB64 === "string") {
                    this.activePersonalKey = naclUtil.decodeBase64(personalKeyB64);
                    this.activeMEK = mek;
                    // Trigger sync in background so unlocking does not block user on network latency
                    this.syncFromCloud().catch((e) => console.log("Background cloud sync error:", e));
                    return true;
                }
                return false;
            } catch (e) {
                console.log("Cloud vault decryption error:", e);
                return false;
            }
        }

        // 2. Local Standalone Vault
        try {
            if (meta.verifier) {
                const check = decryptSymmetric<{ check: string }>(meta.verifier, mek);
                if (check && check.check === "snipit-vault-ok") {
                    this.activeMEK = mek;
                    this.activePersonalKey = mek;
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    }

    // ─── BIOMETRIC AUTHENTICATION ──────────────────────────────────────────────

    /**
     * Checks if device has biometric hardware and at least one enrolled biometric.
     */
    async isBiometricHardwareAvailable(): Promise<boolean> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) return false;
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            return isEnrolled;
        } catch {
            return false;
        }
    }

    /**
     * Checks whether user has toggled biometric unlock ON for this vault.
     */
    async isBiometricsEnabled(): Promise<boolean> {
        try {
            const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRICS_ENABLED);
            if (enabled !== "true") return false;
            // Also check that hardware is still available
            const hasHw = await this.isBiometricHardwareAvailable();
            return hasHw;
        } catch {
            return false;
        }
    }

    /**
     * Enables or disables biometric unlock.
     * When enabling, saves the active decryption keys into hardware SecureStore.
     */
    async setBiometricsEnabled(enable: boolean): Promise<boolean> {
        if (!enable) {
            await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRICS_ENABLED, "false");
            try {
                await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_VAULT_PAYLOAD);
            } catch {}
            return true;
        }

        // Enabling biometrics: vault must already be unlocked so we have active keys
        if (!this.isUnlocked() || !this.activeMEK) {
            return false;
        }

        const available = await this.isBiometricHardwareAvailable();
        if (!available) {
            return false;
        }

        // Authenticate user with biometric prompt first to confirm enrollment
        const auth = await LocalAuthentication.authenticateAsync({
            promptMessage: "Confirm fingerprint or Face ID to enable quick unlock",
            fallbackLabel: "Use Master Password",
            disableDeviceFallback: false,
        });

        if (!auth.success) {
            return false;
        }

        try {
            const payload = {
                mek: naclUtil.encodeBase64(this.activeMEK),
                personalKey: this.activePersonalKey ? naclUtil.encodeBase64(this.activePersonalKey) : undefined,
            };

            await SecureStore.setItemAsync(
                STORAGE_KEYS.BIOMETRIC_VAULT_PAYLOAD,
                JSON.stringify(payload),
                {
                    requireAuthentication: false, // Protected via LocalAuthentication check
                }
            );

            await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRICS_ENABLED, "true");
            return true;
        } catch (err) {
            console.log("Error saving biometric payload to SecureStore:", err);
            return false;
        }
    }

    /**
     * Attempts to unlock vault using Biometric authentication.
     */
    async unlockWithBiometrics(): Promise<boolean> {
        const isEnabled = await this.isBiometricsEnabled();
        if (!isEnabled) return false;

        const auth = await LocalAuthentication.authenticateAsync({
            promptMessage: "Unlock Snipit Vault",
            cancelLabel: "Use Password",
            fallbackLabel: "Use Master Password",
            disableDeviceFallback: false,
        });

        if (!auth.success) {
            return false;
        }

        try {
            const raw = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_VAULT_PAYLOAD);
            if (!raw) return false;

            const payload: { mek: string; personalKey?: string } = JSON.parse(raw);
            if (!payload.mek) return false;

            const mek = naclUtil.decodeBase64(payload.mek);
            this.activeMEK = mek;
            if (payload.personalKey) {
                this.activePersonalKey = naclUtil.decodeBase64(payload.personalKey);
            } else {
                this.activePersonalKey = mek;
            }

            // Sync from cloud in background if user is logged in
            this.syncFromCloud().catch((e) => console.log("Background cloud sync error:", e));
            return true;
        } catch (err) {
            console.log("Biometric unlock error:", err);
            return false;
        }
    }

    async syncFromCloud(): Promise<void> {
        const user = await this.getUser();
        const encryptionKey = this.activePersonalKey || this.activeMEK;
        if (!user || !user.token || !encryptionKey) return;

        try {
            const baseUrl = await this.getApiBaseUrl();

            // 1. Process pending offline item deletions FIRST before fetching cloud items
            const pendingDeletesRaw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_DELETES);
            const originalPendingDeletes: string[] = pendingDeletesRaw ? JSON.parse(pendingDeletesRaw) : [];
            const attemptedOrDeletedIds = new Set<string>(originalPendingDeletes);

            if (originalPendingDeletes.length > 0) {
                const remainingDeletes: string[] = [];
                for (const delId of originalPendingDeletes) {
                    try {
                        const delRes = await fetch(`${baseUrl}/tools/password-manager/vault/items/${delId}`, {
                            method: "DELETE",
                            headers: {
                                Authorization: `Bearer ${user.token}`,
                            },
                        });
                        if (!delRes.ok && delRes.status !== 404) {
                            remainingDeletes.push(delId);
                        }
                    } catch {
                        remainingDeletes.push(delId);
                    }
                }
                await AsyncStorage.setItem(STORAGE_KEYS.PENDING_DELETES, JSON.stringify(remainingDeletes));
            }

            // 2. Process pending offline folder deletions
            const pendingFolderDeletesRaw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_FOLDER_DELETES);
            const pendingFolderDeletes: string[] = pendingFolderDeletesRaw ? JSON.parse(pendingFolderDeletesRaw) : [];
            const deletedFolderIdsSet = new Set<string>(pendingFolderDeletes);

            // 3. Fetch latest cloud vault settings (fresh cloud folders)
            let cloudFolders: Folder[] = [];
            try {
                const metaRes = await fetch(`${baseUrl}/tools/password-manager/vault`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                if (metaRes.ok) {
                    const metaBody = await metaRes.json();
                    if (metaBody.data) {
                        const cachedMetaRaw = await AsyncStorage.getItem(STORAGE_KEYS.VAULT_META);
                        const cachedMeta: VaultMetadata = cachedMetaRaw ? JSON.parse(cachedMetaRaw) : { salt: "" };
                        cachedMeta.encryptedSettings = metaBody.data.encryptedSettings;
                        cachedMeta.encryptedPersonalKey = metaBody.data.encryptedPersonalKey || metaBody.data.encryptedBlob;
                        await AsyncStorage.setItem(STORAGE_KEYS.VAULT_META, JSON.stringify(cachedMeta));

                        if (metaBody.data.encryptedSettings) {
                            const decryptedSettings = decryptSymmetric<any>(metaBody.data.encryptedSettings, encryptionKey);
                            if (decryptedSettings && Array.isArray(decryptedSettings.folders)) {
                                cloudFolders = decryptedSettings.folders;
                            }
                        }
                    }
                }
            } catch (e) {
                console.log("Could not fetch latest vault metadata for folders:", e);
            }

            // If any folders were deleted offline, remove them from cloudFolders and push update
            if (pendingFolderDeletes.length > 0) {
                cloudFolders = cloudFolders.filter((f) => !deletedFolderIdsSet.has(f.id));
                try {
                    await this.persistFoldersToCloud(cloudFolders);
                    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_FOLDER_DELETES);
                } catch (e) {
                    console.log("Failed to sync pending folder deletes to cloud:", e);
                }
            }

            // 4. Fetch all cloud items
            const res = await fetch(`${baseUrl}/tools/password-manager/vault/items`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            if (!res.ok) return;

            const body = await res.json();
            const serverItems: Array<{ id: string; encryptedPayload: string }> = body.data || [];

            // 5. Decrypt server items (skipping any deleted items)
            const serverDecryptedMap = new Map<string, PasswordItem>();
            for (const serverItem of serverItems) {
                if (attemptedOrDeletedIds.has(serverItem.id)) continue; // Filter out any deleted item
                try {
                    const decrypted = decryptSymmetric<any>(serverItem.encryptedPayload, encryptionKey);
                    if (decrypted) {
                        serverDecryptedMap.set(serverItem.id, {
                            id: serverItem.id,
                            title: decrypted.title || "Untitled",
                            username: decrypted.username,
                            password: decrypted.password,
                            url: decrypted.url,
                            notes: decrypted.notes,
                            category: decrypted.itemType || decrypted.category || "login",
                            isFavorite: decrypted.isFavorite,
                            folderId: decrypted.folderId,
                            metadata: decrypted.metadata,
                            customFields: decrypted.customFields,
                            createdAt: decrypted.createdAt || new Date().toISOString(),
                            updatedAt: decrypted.updatedAt || new Date().toISOString(),
                        });
                    }
                } catch (err) {
                    console.warn("Could not decrypt server item", serverItem.id);
                }
            }

            // 6. Three-Way Merge: Load previous sync manifest and current local items
            const syncedItemIdsRaw = await AsyncStorage.getItem(STORAGE_KEYS.SYNCED_ITEM_IDS);
            const knownSyncedItemIds: string[] = syncedItemIdsRaw ? JSON.parse(syncedItemIdsRaw) : [];
            const knownSyncedItemSet = new Set<string>(knownSyncedItemIds);

            let localItems: PasswordItem[] = [];
            const localRaw = await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTED_ITEMS);
            if (localRaw) {
                try {
                    localItems = decryptSymmetric<PasswordItem[]>(localRaw, encryptionKey) || [];
                } catch {
                    localItems = [];
                }
            }

            const mergedMap = new Map<string, PasswordItem>();
            const itemsToUploadToCloud: PasswordItem[] = [];

            // Add all live server items into merged map
            for (const [id, sItem] of serverDecryptedMap.entries()) {
                mergedMap.set(id, sItem);
            }

            // Reconcile each local item
            for (const lItem of localItems) {
                // If item is marked for pending local deletion, ignore it
                if (attemptedOrDeletedIds.has(lItem.id)) continue;

                const serverItem = mergedMap.get(lItem.id);
                if (!serverItem) {
                    // Local item is absent from server!
                    if (knownSyncedItemSet.has(lItem.id)) {
                        // Crucial fix: Item was previously synced with cloud, but is now missing from cloud response.
                        // This means it was DELETED on the website/cloud!
                        // Therefore, delete it locally—do NOT re-upload or resurrect it!
                        console.log(`[Sync] Item ${lItem.id} ("${lItem.title}") was deleted on web; removing locally.`);
                    } else {
                        // Item was created locally while offline and never sent to cloud.
                        // Keep it locally and upload it to the cloud.
                        mergedMap.set(lItem.id, lItem);
                        itemsToUploadToCloud.push(lItem);
                    }
                } else {
                    // Item exists in both places: conflict resolution by timestamp
                    const localTime = new Date(lItem.updatedAt || 0).getTime();
                    const serverTime = new Date(serverItem.updatedAt || 0).getTime();
                    if (localTime > serverTime) {
                        // Local edit is newer than server edit
                        mergedMap.set(lItem.id, lItem);
                        itemsToUploadToCloud.push(lItem);
                    }
                }
            }

            const finalList = Array.from(mergedMap.values());

            // 7. Save merged items locally
            const encrypted = encryptSymmetric(finalList, encryptionKey);
            await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_ITEMS, encrypted);

            // 8. Upload any genuine local items missing or newer on the server
            // Use PUT to safely upsert and avoid MongoDB duplicate key errors!
            if (itemsToUploadToCloud.length > 0) {
                for (const itemToUp of itemsToUploadToCloud) {
                    try {
                        const payloadToCloud = {
                            ...itemToUp,
                            itemType: itemToUp.category,
                            folderId: itemToUp.folderId,
                        };
                        const encPayload = encryptSymmetric(payloadToCloud, encryptionKey);
                        await fetch(`${baseUrl}/tools/password-manager/vault/items/${itemToUp.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${user.token}`,
                            },
                            body: JSON.stringify({
                                encryptedPayload: encPayload,
                            }),
                        });
                    } catch (e) {
                        console.log("Error uploading local item to cloud during merge:", e);
                    }
                }
            }

            // 9. Update local sync manifest with all current live item IDs and clear pending item upserts
            const updatedSyncedIds = finalList.map((i) => i.id);
            await AsyncStorage.setItem(STORAGE_KEYS.SYNCED_ITEM_IDS, JSON.stringify(updatedSyncedIds));
            await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_ITEM_UPSERTS);

            // 10. Reconcile Folders with Sync Manifest
            const syncedFolderIdsRaw = await AsyncStorage.getItem(STORAGE_KEYS.SYNCED_FOLDER_IDS);
            const knownSyncedFolderIds: string[] = syncedFolderIdsRaw ? JSON.parse(syncedFolderIdsRaw) : [];
            const knownSyncedFolderSet = new Set<string>(knownSyncedFolderIds);

            let localFolders: Folder[] = [];
            const localFoldersRaw = await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTED_FOLDERS);
            if (localFoldersRaw) {
                try {
                    localFolders = decryptSymmetric<Folder[]>(localFoldersRaw, encryptionKey) || [];
                } catch {
                    localFolders = [];
                }
            }

            // Populate live cloud folders
            const folderMap = new Map<string, Folder>();
            for (const cf of cloudFolders) {
                if (deletedFolderIdsSet.has(cf.id)) continue;
                folderMap.set(cf.id, cf);
            }

            let hasLocalOnlyFolders = false;
            for (const lf of localFolders) {
                if (deletedFolderIdsSet.has(lf.id)) continue;
                if (!folderMap.has(lf.id)) {
                    if (knownSyncedFolderSet.has(lf.id)) {
                        // Folder was deleted on cloud/web! Remove locally
                        console.log(`[Sync] Folder ${lf.id} ("${lf.name}") was deleted on web; removing locally.`);
                    } else {
                        // Folder was created locally offline
                        folderMap.set(lf.id, lf);
                        hasLocalOnlyFolders = true;
                    }
                }
            }

            const mergedFolders = Array.from(folderMap.values());
            const encryptedFolders = encryptSymmetric(mergedFolders, encryptionKey);
            await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_FOLDERS, encryptedFolders);
            await AsyncStorage.setItem(STORAGE_KEYS.SYNCED_FOLDER_IDS, JSON.stringify(mergedFolders.map((f) => f.id)));
            await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_FOLDER_UPSERTS);

            // If local offline folders were added, sync settings back to cloud
            if (hasLocalOnlyFolders) {
                await this.persistFoldersToCloud(mergedFolders);
            }

            // 11. Notify UI listeners that sync completed and data is fresh
            this.notifySyncListeners();
        } catch (e) {
            console.log("Error syncing cloud items:", e);
        }
    }

    lockVault(): void {
        this.activeMEK = null;
        this.activePersonalKey = null;
    }

    isUnlocked(): boolean {
        return !!(this.activeMEK || this.activePersonalKey);
    }

    // ─── ITEMS CRUD ────────────────────────────────────────────────────────────

    async getItems(): Promise<PasswordItem[]> {
        const key = this.activePersonalKey || this.activeMEK;
        if (!key) throw new Error("Vault is locked");
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTED_ITEMS);
        if (!raw) return [];
        return decryptSymmetric<PasswordItem[]>(raw, key);
    }

    async saveItem(item: Omit<PasswordItem, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<PasswordItem> {
        const key = this.activePersonalKey || this.activeMEK;
        if (!key) throw new Error("Vault is locked");

        const items = await this.getItems();
        const now = new Date().toISOString();
        let saved: PasswordItem;

        if (item.id) {
            const index = items.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                saved = { ...items[index], ...item, updatedAt: now };
                items[index] = saved;
            } else {
                saved = { ...(item as PasswordItem), createdAt: now, updatedAt: now };
                items.push(saved);
            }
        } else {
            saved = {
                ...item,
                id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4),
                createdAt: now,
                updatedAt: now,
            };
            items.push(saved);
        }

        // Encrypt and persist locally
        const encrypted = encryptSymmetric(items, key);
        await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_ITEMS, encrypted);

        // Sync with backend if user is logged in
        const user = await this.getUser();
        if (user && user.token) {
            let uploaded = false;
            try {
                const baseUrl = await this.getApiBaseUrl();
                const payloadToCloud = {
                    ...saved,
                    itemType: saved.category,
                    folderId: saved.folderId,
                };
                const encryptedPayload = encryptSymmetric(payloadToCloud, key);
                // Use PUT with item ID to upsert safely and prevent MongoDB duplicate key errors
                const res = await fetch(`${baseUrl}/tools/password-manager/vault/items/${saved.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({
                        encryptedPayload,
                    }),
                });
                uploaded = res.ok;
            } catch (err) {
                console.log("Cloud sync error for saveItem:", err);
                uploaded = false;
            }

            if (uploaded) {
                // Record in synced manifest and remove from pending upserts
                try {
                    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNCED_ITEM_IDS);
                    const ids: string[] = raw ? JSON.parse(raw) : [];
                    if (!ids.includes(saved.id)) {
                        ids.push(saved.id);
                        await AsyncStorage.setItem(STORAGE_KEYS.SYNCED_ITEM_IDS, JSON.stringify(ids));
                    }
                    const pendingRaw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ITEM_UPSERTS);
                    if (pendingRaw) {
                        const pending: string[] = JSON.parse(pendingRaw);
                        const filtered = pending.filter((id) => id !== saved.id);
                        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ITEM_UPSERTS, JSON.stringify(filtered));
                    }
                } catch {}
            } else {
                // Mark item as pending offline upsert and remove from synced IDs
                try {
                    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNCED_ITEM_IDS);
                    if (raw) {
                        const ids: string[] = JSON.parse(raw);
                        const filtered = ids.filter((id) => id !== saved.id);
                        await AsyncStorage.setItem(STORAGE_KEYS.SYNCED_ITEM_IDS, JSON.stringify(filtered));
                    }
                    const pendingRaw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ITEM_UPSERTS);
                    const pending: string[] = pendingRaw ? JSON.parse(pendingRaw) : [];
                    if (!pending.includes(saved.id)) {
                        pending.push(saved.id);
                        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ITEM_UPSERTS, JSON.stringify(pending));
                    }
                } catch {}
            }
        }

        this.notifySyncListeners();
        return saved;
    }

    async deleteItem(id: string): Promise<void> {
        const key = this.activePersonalKey || this.activeMEK;
        if (!key) throw new Error("Vault is locked");
        const items = await this.getItems();
        const filtered = items.filter((i) => i.id !== id);
        const encrypted = encryptSymmetric(filtered, key);
        await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_ITEMS, encrypted);

        // Remove from synced item manifest immediately
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNCED_ITEM_IDS);
            if (raw) {
                const ids: string[] = JSON.parse(raw);
                const updated = ids.filter((existingId) => existingId !== id);
                await AsyncStorage.setItem(STORAGE_KEYS.SYNCED_ITEM_IDS, JSON.stringify(updated));
            }
        } catch {}

        // Cloud delete if user is logged in
        const user = await this.getUser();
        if (user && user.token) {
            let deletedFromCloud = false;
            try {
                const baseUrl = await this.getApiBaseUrl();
                const res = await fetch(`${baseUrl}/tools/password-manager/vault/items/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                deletedFromCloud = res.ok;
            } catch (err) {
                console.log("Cloud sync error for deleteItem:", err);
            }

            if (!deletedFromCloud) {
                // Record pending deletion so next sync does not bring back the deleted item from cloud
                try {
                    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_DELETES);
                    const pending: string[] = raw ? JSON.parse(raw) : [];
                    if (!pending.includes(id)) {
                        pending.push(id);
                        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_DELETES, JSON.stringify(pending));
                    }
                } catch (e) {
                    console.log("Error storing pending delete:", e);
                }
            }
        }
    }

    // ─── FOLDERS CRUD ──────────────────────────────────────────────────────────

    async getFolders(): Promise<Folder[]> {
        const key = this.activePersonalKey || this.activeMEK;
        if (!key) return [];
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTED_FOLDERS);
        if (!raw) return [];
        try {
            return decryptSymmetric<Folder[]>(raw, key);
        } catch {
            return [];
        }
    }

    async saveFolder(folder: { id?: string; name: string; color: string; iconName?: string }): Promise<Folder> {
        const key = this.activePersonalKey || this.activeMEK;
        if (!key) throw new Error("Vault is locked");

        const folders = await this.getFolders();
        const now = new Date().toISOString();
        let saved: Folder;

        if (folder.id) {
            const index = folders.findIndex((f) => f.id === folder.id);
            if (index !== -1) {
                saved = { ...folders[index], ...folder, updatedAt: now };
                folders[index] = saved;
            } else {
                saved = {
                    id: folder.id,
                    name: folder.name,
                    color: folder.color,
                    iconName: folder.iconName,
                    createdAt: now,
                    updatedAt: now,
                };
                folders.push(saved);
            }
        } else {
            saved = {
                id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4),
                name: folder.name,
                color: folder.color,
                iconName: folder.iconName,
                createdAt: now,
                updatedAt: now,
            };
            folders.push(saved);
        }

        // Encrypt and persist locally
        const encrypted = encryptSymmetric(folders, key);
        await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_FOLDERS, encrypted);

        // Sync with backend encryptedSettings if logged in
        const user = await this.getUser();
        if (user && user.token) {
            const synced = await this.persistFoldersToCloud(folders);
            if (synced) {
                try {
                    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNCED_FOLDER_IDS);
                    const ids: string[] = raw ? JSON.parse(raw) : [];
                    if (!ids.includes(saved.id)) {
                        ids.push(saved.id);
                        await AsyncStorage.setItem(STORAGE_KEYS.SYNCED_FOLDER_IDS, JSON.stringify(ids));
                    }
                    const pendingRaw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_FOLDER_UPSERTS);
                    if (pendingRaw) {
                        const pending: string[] = JSON.parse(pendingRaw);
                        const filtered = pending.filter((id) => id !== saved.id);
                        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_FOLDER_UPSERTS, JSON.stringify(filtered));
                    }
                } catch {}
            } else {
                try {
                    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNCED_FOLDER_IDS);
                    if (raw) {
                        const ids: string[] = JSON.parse(raw);
                        const filtered = ids.filter((id) => id !== saved.id);
                        await AsyncStorage.setItem(STORAGE_KEYS.SYNCED_FOLDER_IDS, JSON.stringify(filtered));
                    }
                    const pendingRaw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_FOLDER_UPSERTS);
                    const pending: string[] = pendingRaw ? JSON.parse(pendingRaw) : [];
                    if (!pending.includes(saved.id)) {
                        pending.push(saved.id);
                        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_FOLDER_UPSERTS, JSON.stringify(pending));
                    }
                } catch {}
            }
        }

        this.notifySyncListeners();
        return saved;
    }

    async deleteFolder(folderId: string): Promise<void> {
        const key = this.activePersonalKey || this.activeMEK;
        if (!key) throw new Error("Vault is locked");

        const folders = await this.getFolders();
        const filtered = folders.filter((f) => f.id !== folderId);
        const encrypted = encryptSymmetric(filtered, key);
        await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_FOLDERS, encrypted);

        // Remove from synced folder manifest and pending folder upserts
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNCED_FOLDER_IDS);
            if (raw) {
                const ids: string[] = JSON.parse(raw);
                const updated = ids.filter((id) => id !== folderId);
                await AsyncStorage.setItem(STORAGE_KEYS.SYNCED_FOLDER_IDS, JSON.stringify(updated));
            }
            const pendingUpsertsRaw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_FOLDER_UPSERTS);
            if (pendingUpsertsRaw) {
                const pending: string[] = JSON.parse(pendingUpsertsRaw);
                const updated = pending.filter((id) => id !== folderId);
                await AsyncStorage.setItem(STORAGE_KEYS.PENDING_FOLDER_UPSERTS, JSON.stringify(updated));
            }
        } catch {}

        // Unassign items belonging to this folder
        const items = await this.getItems();
        let changed = false;
        for (const it of items) {
            if (it.folderId === folderId) {
                it.folderId = undefined;
                changed = true;
            }
        }
        if (changed) {
            await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_ITEMS, encryptSymmetric(items, key));
        }

        const user = await this.getUser();
        if (user && user.token) {
            let persisted = false;
            try {
                persisted = await this.persistFoldersToCloud(filtered);
            } catch (err) {
                console.log("Cloud sync error for deleteFolder:", err);
            }

            if (!persisted) {
                try {
                    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_FOLDER_DELETES);
                    const pending: string[] = raw ? JSON.parse(raw) : [];
                    if (!pending.includes(folderId)) {
                        pending.push(folderId);
                        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_FOLDER_DELETES, JSON.stringify(pending));
                    }
                } catch (e) {
                    console.log("Error storing pending folder delete:", e);
                }
            }
        }

        this.notifySyncListeners();
    }

    private async persistFoldersToCloud(folders: Folder[]): Promise<boolean> {
        const user = await this.getUser();
        const key = this.activePersonalKey || this.activeMEK;
        if (!user || !user.token || !key) return false;

        try {
            const baseUrl = await this.getApiBaseUrl();
            const encryptedSettings = encryptSymmetric({ folders }, key);
            const res = await fetch(`${baseUrl}/tools/password-manager/vault`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    encryptedSettings,
                }),
            });
            return res.ok;
        } catch (err) {
            console.log("Cloud sync error for folders:", err);
            return false;
        }
    }

    // ─── THEME PERSISTENCE ─────────────────────────────────────────────────────

    async getTheme(): Promise<"system" | "dark" | "light"> {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (saved === "light" || saved === "dark" || saved === "system") {
            return saved;
        }
        return "system";
    }

    async setTheme(theme: "system" | "dark" | "light"): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    }

    // ─── UI COMPONENT STYLE (SHADCN VS NATIVE) ─────────────────────────────────

    async getUIStyle(): Promise<"shadcn" | "native"> {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.UI_STYLE);
        if (saved === "native" || saved === "shadcn") {
            return saved;
        }
        return "shadcn";
    }

    async setUIStyle(style: "shadcn" | "native"): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.UI_STYLE, style);
        this.notifySyncListeners();
    }

    // ─── DEFAULT STARTUP TOOL ──────────────────────────────────────────────────

    async getDefaultTool(): Promise<"hub" | "pwmg"> {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_TOOL);
        if (saved === "pwmg" || saved === "hub") {
            return saved;
        }
        return "pwmg";
    }

    async setDefaultTool(tool: "hub" | "pwmg"): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_TOOL, tool);
    }

    async getSyncStatus(): Promise<"local" | "synced" | "pending_offline"> {
        const user = await this.getUser();
        if (!user || !user.token) {
            return "local";
        }

        // Check if there are any pending deletes or upserts recorded
        const [
            pendingDeletesRaw,
            pendingFolderDeletesRaw,
            pendingItemUpsertsRaw,
            pendingFolderUpsertsRaw,
            syncedItemIdsRaw,
            syncedFolderIdsRaw,
        ] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.PENDING_DELETES),
            AsyncStorage.getItem(STORAGE_KEYS.PENDING_FOLDER_DELETES),
            AsyncStorage.getItem(STORAGE_KEYS.PENDING_ITEM_UPSERTS),
            AsyncStorage.getItem(STORAGE_KEYS.PENDING_FOLDER_UPSERTS),
            AsyncStorage.getItem(STORAGE_KEYS.SYNCED_ITEM_IDS),
            AsyncStorage.getItem(STORAGE_KEYS.SYNCED_FOLDER_IDS),
        ]);

        const pendingDeletes: string[] = pendingDeletesRaw ? JSON.parse(pendingDeletesRaw) : [];
        if (pendingDeletes.length > 0) return "pending_offline";

        const pendingFolderDeletes: string[] = pendingFolderDeletesRaw ? JSON.parse(pendingFolderDeletesRaw) : [];
        if (pendingFolderDeletes.length > 0) return "pending_offline";

        const pendingItemUpserts: string[] = pendingItemUpsertsRaw ? JSON.parse(pendingItemUpsertsRaw) : [];
        if (pendingItemUpserts.length > 0) return "pending_offline";

        const pendingFolderUpserts: string[] = pendingFolderUpsertsRaw ? JSON.parse(pendingFolderUpsertsRaw) : [];
        if (pendingFolderUpserts.length > 0) return "pending_offline";

        // If vault is unlocked, compare current items with synced manifests
        if (this.isUnlocked()) {
            try {
                const items = await this.getItems();
                const syncedItemIds: string[] = syncedItemIdsRaw ? JSON.parse(syncedItemIdsRaw) : [];
                const syncedItemSet = new Set<string>(syncedItemIds);
                for (const it of items) {
                    if (!syncedItemSet.has(it.id)) {
                        return "pending_offline";
                    }
                }

                const folders = await this.getFolders();
                const syncedFolderIds: string[] = syncedFolderIdsRaw ? JSON.parse(syncedFolderIdsRaw) : [];
                const syncedFolderSet = new Set<string>(syncedFolderIds);
                for (const f of folders) {
                    if (!syncedFolderSet.has(f.id)) {
                        return "pending_offline";
                    }
                }
            } catch {
                // If can't read items, fallback to synced check
            }
        }

        return "synced";
    }

    async resetVault(): Promise<void> {
        this.activeMEK = null;
        this.activePersonalKey = null;
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.VAULT_META,
            STORAGE_KEYS.ENCRYPTED_ITEMS,
            STORAGE_KEYS.ENCRYPTED_FOLDERS,
            STORAGE_KEYS.RECOVERY_RECORD,
            STORAGE_KEYS.PENDING_DELETES,
            STORAGE_KEYS.PENDING_FOLDER_DELETES,
            STORAGE_KEYS.PENDING_ITEM_UPSERTS,
            STORAGE_KEYS.PENDING_FOLDER_UPSERTS,
            STORAGE_KEYS.SYNCED_ITEM_IDS,
            STORAGE_KEYS.SYNCED_FOLDER_IDS,
        ]);
        this.notifySyncListeners();
    }
}

export const offlineVault = new OfflineVaultService();
