import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
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
};

export class OfflineVaultService {
    private activeMEK: Uint8Array | null = null;
    private activePersonalKey: Uint8Array | null = null;
    private currentUser: UserSession | null = null;

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

    async syncFromCloud(): Promise<void> {
        const user = await this.getUser();
        const encryptionKey = this.activePersonalKey || this.activeMEK;
        if (!user || !user.token || !encryptionKey) return;

        try {
            const baseUrl = await this.getApiBaseUrl();
            const res = await fetch(`${baseUrl}/tools/password-manager/vault/items`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            if (!res.ok) return;

            const body = await res.json();
            const serverItems: Array<{ id: string; encryptedPayload: string }> = body.data || [];

            const decryptedList: PasswordItem[] = [];
            for (const serverItem of serverItems) {
                try {
                    const decrypted = decryptSymmetric<any>(serverItem.encryptedPayload, encryptionKey);
                    if (decrypted) {
                        decryptedList.push({
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

            // Sync Folders from encryptedSettings if present
            const metaRaw = await AsyncStorage.getItem(STORAGE_KEYS.VAULT_META);
            if (metaRaw) {
                const meta: VaultMetadata = JSON.parse(metaRaw);
                if (meta.encryptedSettings) {
                    try {
                        const decryptedSettings = decryptSymmetric<any>(meta.encryptedSettings, encryptionKey);
                        if (decryptedSettings && Array.isArray(decryptedSettings.folders)) {
                            const encryptedFolders = encryptSymmetric(decryptedSettings.folders, encryptionKey);
                            await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_FOLDERS, encryptedFolders);
                        }
                    } catch (e) {
                        console.log("Could not decrypt settings for folders:", e);
                    }
                }
            }

            // Save locally
            const encrypted = encryptSymmetric(decryptedList, encryptionKey);
            await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_ITEMS, encrypted);
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
            try {
                const baseUrl = await this.getApiBaseUrl();
                const payloadToCloud = {
                    ...saved,
                    itemType: saved.category,
                    folderId: saved.folderId,
                };
                const encryptedPayload = encryptSymmetric(payloadToCloud, key);
                await fetch(`${baseUrl}/tools/password-manager/vault/items`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({
                        id: saved.id,
                        encryptedPayload,
                    }),
                });
            } catch (err) {
                console.log("Cloud sync error for saveItem:", err);
            }
        }

        return saved;
    }

    async deleteItem(id: string): Promise<void> {
        const key = this.activePersonalKey || this.activeMEK;
        if (!key) throw new Error("Vault is locked");
        const items = await this.getItems();
        const filtered = items.filter((i) => i.id !== id);
        const encrypted = encryptSymmetric(filtered, key);
        await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_ITEMS, encrypted);

        // Cloud delete if user is logged in
        const user = await this.getUser();
        if (user && user.token) {
            try {
                const baseUrl = await this.getApiBaseUrl();
                await fetch(`${baseUrl}/tools/password-manager/vault/items/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            } catch (err) {
                console.log("Cloud sync error for deleteItem:", err);
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

        // Sync with backend encryptedSettings
        await this.persistFoldersToCloud(folders);
        return saved;
    }

    async deleteFolder(folderId: string): Promise<void> {
        const key = this.activePersonalKey || this.activeMEK;
        if (!key) throw new Error("Vault is locked");

        const folders = await this.getFolders();
        const filtered = folders.filter((f) => f.id !== folderId);
        const encrypted = encryptSymmetric(filtered, key);
        await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_FOLDERS, encrypted);

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

        await this.persistFoldersToCloud(filtered);
    }

    private async persistFoldersToCloud(folders: Folder[]): Promise<void> {
        const user = await this.getUser();
        const key = this.activePersonalKey || this.activeMEK;
        if (!user || !user.token || !key) return;

        try {
            const baseUrl = await this.getApiBaseUrl();
            const encryptedSettings = encryptSymmetric({ folders }, key);
            await fetch(`${baseUrl}/tools/password-manager/vault`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    encryptedSettings,
                }),
            });
        } catch (err) {
            console.log("Cloud sync error for folders:", err);
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

    // ─── DEFAULT STARTUP TOOL ──────────────────────────────────────────────────

    async getDefaultTool(): Promise<"hub" | "pwmg"> {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_TOOL);
        if (saved === "pwmg" || saved === "hub") {
            return saved;
        }
        return "hub";
    }

    async setDefaultTool(tool: "hub" | "pwmg"): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_TOOL, tool);
    }
}

export const offlineVault = new OfflineVaultService();
