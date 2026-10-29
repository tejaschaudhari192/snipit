import { offlineVault } from "../core/vault-storage";

export const profileService = {
    async fetchServerProfile(token: string) {
        const url = await offlineVault.getApiBaseUrl();
        const res = await fetch(`${url}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            throw new Error(`Profile fetch failed with status ${res.status}`);
        }
        return await res.json();
    },

    async updateUsername(token: string, username: string) {
        const baseUrl = await offlineVault.getApiBaseUrl();
        const res = await fetch(`${baseUrl}/auth/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username: username.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || "Failed to update profile username.");
        }
        return data;
    },

    async updateAvatar(token: string, avatarUrl: string) {
        const baseUrl = await offlineVault.getApiBaseUrl();
        const res = await fetch(`${baseUrl}/auth/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatar: avatarUrl.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || "Failed to update profile photo.");
        }
        return data;
    },

    async syncCloudVault() {
        await offlineVault.checkCloudVault();
        if (offlineVault.isUnlocked()) {
            await offlineVault.syncFromCloud();
        }
        const status = await offlineVault.getSyncStatus();
        return status === "local" ? ("pending_offline" as const) : status;
    },
};

