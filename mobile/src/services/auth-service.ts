import { CONFIG } from "../config/configuration";
import { offlineVault } from "../core/vault-storage";

export interface UserSessionData {
    id: string;
    email: string;
    username: string;
    token?: string;
    avatar?: string;
}

/**
 * Normalizes API base URL ensuring standard /api/v1 ending
 */
export function normalizeApiBaseUrl(url: string): string {
    const clean = url.trim().replace(/\/+$/, "");
    if (clean.endsWith("/api/v1")) return clean;
    if (clean.endsWith("/api")) return `${clean}/v1`;
    return `${clean}/api/v1`;
}

/**
 * Auth API service interacting with Snipit backend
 */
export const authApi = {
    async fetchUserProfile(baseUrl: string, token: string): Promise<{ avatar?: string; username?: string }> {
        try {
            const meRes = await fetch(`${baseUrl}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (meRes.ok) {
                const meData = await meRes.json();
                return {
                    avatar: meData.avatar || "",
                    username: meData.username || "",
                };
            }
        } catch {
            // Non-blocking fallback
        }
        return {};
    },

    async login(credentials: { email: string; password: string }) {
        const baseUrl = normalizeApiBaseUrl(CONFIG.DEFAULT_API_URL);
        await offlineVault.setApiBaseUrl(baseUrl);
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || data.error || `Authentication failed (${res.status}).`);
        }
        return data;
    },

    async register(data: { email: string; password: string; username: string }) {
        const baseUrl = normalizeApiBaseUrl(CONFIG.DEFAULT_API_URL);
        await offlineVault.setApiBaseUrl(baseUrl);
        const res = await fetch(`${baseUrl}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const resData = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(resData.message || resData.error || `Registration failed (${res.status}).`);
        }
        return resData;
    },

    async forgotPassword(email: string) {
        const baseUrl = normalizeApiBaseUrl(CONFIG.DEFAULT_API_URL);
        const res = await fetch(`${baseUrl}/auth/forgotpassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || "Failed to send reset link.");
        }
        return data;
    },

    async googleLogin(idToken: string) {
        const baseUrl = normalizeApiBaseUrl(CONFIG.DEFAULT_API_URL);
        const res = await fetch(`${baseUrl}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || "Google authentication failed.");
        }
        return data;
    },

    async githubLogin(code: string) {
        const baseUrl = normalizeApiBaseUrl(CONFIG.DEFAULT_API_URL);
        const res = await fetch(`${baseUrl}/auth/github`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || "GitHub authentication failed.");
        }
        return data;
    },
};

