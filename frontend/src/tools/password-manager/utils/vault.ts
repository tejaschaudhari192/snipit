import { deriveKey } from "@/lib/crypto";
import api from "@/lib/api";
import type { Vault } from "@/tools/password-manager/types";

/**
 * Encrypt the vault and return the base64 encoded string.
 * Payload format: [salt_len(1)][salt(16)][iv(12)][ciphertext]
 */
export async function encryptVault(
	vault: Vault,
	password: string,
): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await deriveKey(password, salt);

	const data = new TextEncoder().encode(JSON.stringify(vault));
	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		data,
	);

	const payload = new Uint8Array(
		1 + salt.length + iv.length + encrypted.byteLength,
	);
	payload[0] = salt.length;
	payload.set(salt, 1);
	payload.set(iv, 1 + salt.length);
	payload.set(new Uint8Array(encrypted), 1 + salt.length + iv.length);

	const encoded = btoa(String.fromCharCode(...payload));
	return encoded;
}

/**
 * Decrypt the vault from the provided base64 encoded string.
 * Returns null if decryption fails.
 */
export async function decryptVault(
	password: string,
	storedPayload: string,
): Promise<Vault | null> {
	if (!storedPayload) return null;

	try {
		const payload = Uint8Array.from(atob(storedPayload), (c) =>
			c.charCodeAt(0),
		);
		const saltLen = payload[0];
		const salt = payload.slice(1, 1 + saltLen);
		const iv = payload.slice(1 + saltLen, 1 + saltLen + 12);
		const ciphertext = payload.slice(1 + saltLen + 12);

		const key = await deriveKey(password, salt);
		const decrypted = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			key,
			ciphertext,
		);
		const json = new TextDecoder().decode(decrypted);
		return JSON.parse(json) as Vault;
	} catch {
		return null;
	}
}

/**
 * Fetch the encrypted vault blob from the cloud.
 * Returns version alongside the blob for head-tracking.
 */
export async function fetchVaultFromCloud(): Promise<{
	encryptedBlob: string;
	updatedAt: string;
	version: number;
} | null> {
	try {
		const response = await api.get("/tools/password-manager/vault");
		if (response.data?.success && response.data?.data) {
			return response.data.data;
		}
		return null;
	} catch (error) {
		console.error("Failed to fetch vault from cloud:", error);
		return null;
	}
}

/**
 * Sync the encrypted vault blob to the cloud.
 * Sends version so the server can track head.
 */
export async function syncVaultToCloud(
	encryptedBlob: string,
	version: number,
): Promise<boolean> {
	try {
		const response = await api.put("/tools/password-manager/vault", {
			encryptedBlob,
			version,
		});
		return !!response.data?.success;
	} catch (error) {
		console.error("Failed to sync vault to cloud:", error);
		return false;
	}
}
