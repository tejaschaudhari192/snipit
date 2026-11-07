import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CONFIG } from "@/configurations";
import type { ItemAttachment } from "../types";
import { sanitizeFileName } from "@/utils";

const BUCKET_NAME = CONFIG.supabaseStorageBucket || "snipit";

/**
 * Encrypts a binary File with a freshly generated random 32-byte key (SecretBox)
 * and uploads the resulting encrypted blob to Supabase Storage.
 *
 * File name is prefixed with `[pm-uat]` to segregate and quickly identify
 * password manager encrypted attachments in Supabase storage buckets.
 */
export async function uploadEncryptedVaultAttachment({
	file,
	userId = "personal",
	itemId,
}: {
	file: File;
	userId?: string;
	itemId?: string;
}): Promise<ItemAttachment> {
	if (!isSupabaseConfigured || !supabase) {
		throw new Error(
			"Supabase Storage is not configured. Please check your credentials.",
		);
	}

	const attachmentId = crypto.randomUUID();
	const sanitized = sanitizeFileName(file.name) || "attachment";
	const prefix = `[pm-uat]_${Date.now()}_${attachmentId}_${sanitized}.enc`;
	const storagePath = `vault-attachments/${userId}/${itemId || "general"}/${prefix}`;

	// 1. Generate an auto-generated random 32-byte key for this attachment
	const randomKey = nacl.randomBytes(32);
	const encKeyBase64 = naclUtil.encodeBase64(randomKey);

	// 2. Read file data and encrypt with SecretBox
	const fileBuffer = await file.arrayBuffer();
	const fileBytes = new Uint8Array(fileBuffer);

	// SecretBox requires a 24-byte nonce
	const nonce = nacl.randomBytes(24);
	const encryptedData = nacl.secretbox(fileBytes, nonce, randomKey);

	// Prepend nonce to encrypted data: [24 bytes nonce][cipher]
	const payload = new Uint8Array(nonce.length + encryptedData.length);
	payload.set(nonce, 0);
	payload.set(encryptedData, nonce.length);

	// 3. Upload to Supabase Storage
	const blob = new Blob([payload], { type: "application/octet-stream" });
	const { error } = await supabase.storage
		.from(BUCKET_NAME)
		.upload(storagePath, blob, {
			cacheControl: "3600",
			upsert: true,
		});

	if (error) {
		console.error("Supabase attachment upload failed:", error);
		throw new Error(`Upload failed: ${error.message}`);
	}

	return {
		id: attachmentId,
		fileName: file.name,
		fileSize: file.size,
		mimeType: file.type || "application/octet-stream",
		storagePath,
		encKey: encKeyBase64,
		createdAt: new Date().toISOString(),
	};
}

/**
 * Downloads an encrypted attachment from Supabase Storage and decrypts it
 * using the auto-generated key stored in the attachment metadata.
 */
export async function downloadAndDecryptVaultAttachment(
	attachment: ItemAttachment,
): Promise<Blob> {
	if (!attachment.storagePath || !attachment.encKey) {
		throw new Error(
			"Missing storage path or decryption key for attachment",
		);
	}

	if (!isSupabaseConfigured || !supabase) {
		throw new Error(
			"Supabase is not configured to retrieve file attachments",
		);
	}

	// 1. Download encrypted file blob from Supabase
	const { data, error } = await supabase.storage
		.from(BUCKET_NAME)
		.download(attachment.storagePath);

	if (error || !data) {
		throw new Error(
			error?.message || "Failed to download attachment from storage",
		);
	}

	const arrayBuffer = await data.arrayBuffer();
	const payload = new Uint8Array(arrayBuffer);

	// Extract 24-byte nonce and encrypted ciphertext
	const nonce = payload.slice(0, 24);
	const ciphertext = payload.slice(24);
	const randomKey = naclUtil.decodeBase64(attachment.encKey);

	// Decrypt
	const decryptedBytes = nacl.secretbox.open(ciphertext, nonce, randomKey);
	if (!decryptedBytes) {
		throw new Error(
			"Decryption failed. Invalid encryption key or corrupt attachment.",
		);
	}

	return new Blob([decryptedBytes], {
		type: attachment.mimeType || "application/octet-stream",
	});
}

/**
 * Removes an attachment from Supabase Storage
 */
export async function deleteVaultAttachment(
	storagePath?: string,
): Promise<void> {
	if (!storagePath || !isSupabaseConfigured || !supabase) return;
	try {
		await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
	} catch (e) {
		console.warn("Failed to delete attachment from Supabase:", e);
	}
}
