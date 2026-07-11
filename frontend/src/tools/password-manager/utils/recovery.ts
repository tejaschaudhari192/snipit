/**
 * Recovery key utilities.
 *
 * Flow:
 *   Setup:  generateMnemonic() → user writes down 12 words
 *           encryptMasterPassword(mnemonic, masterPassword) → stored in IndexedDB
 *   Recover: decryptMasterPassword(mnemonic, encryptedRecord) → masterPassword
 *
 * The mnemonic itself is the recovery key — it's never stored anywhere.
 * Only the master password (encrypted with the recovery key) is stored.
 */

import {
	generateMnemonic,
	mnemonicToSeedSync,
	validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

const RECOVERY_ITERATIONS = 10_000;
const KEY_LENGTH = 256;
const ALGORITHM = "AES-GCM";

// ─── Mnemonic generation ────────────────────────────────────────────────────

/** Generate a 12-word BIP39 mnemonic (128 bits of entropy). */
export function generateRecoveryMnemonic(): string {
	return generateMnemonic(wordlist, 128);
}

/** Validate a BIP39 mnemonic string. */
export function isValidMnemonic(mnemonic: string): boolean {
	return validateMnemonic(mnemonic, wordlist);
}

// ─── Key derivation ─────────────────────────────────────────────────────────

/**
 * Derive an AES-GCM key from the recovery mnemonic + salt.
 * Uses PBKDF2 with fewer iterations since the mnemonic is already high-entropy.
 */
async function deriveRecoveryKey(
	mnemonic: string,
	salt: Uint8Array,
): Promise<CryptoKey> {
	// Convert mnemonic to a 64-byte seed via BIP39
	const seed = mnemonicToSeedSync(mnemonic);

	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		seed,
		"PBKDF2",
		false,
		["deriveKey"],
	);

	return crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: salt as BufferSource,
			iterations: RECOVERY_ITERATIONS,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: ALGORITHM, length: KEY_LENGTH },
		false,
		["encrypt", "decrypt"],
	);
}

// ─── Encrypt / Decrypt master password ──────────────────────────────────────

export interface EncryptedMasterPassword {
	encrypted: string; // base64-encoded ciphertext
	salt: string; // hex-encoded salt
	iv: string; // hex-encoded IV
}

/**
 * Encrypt the master password with the recovery mnemonic.
 * Returns the encrypted blob + salt + IV for storage.
 */
export async function encryptMasterPassword(
	mnemonic: string,
	masterPassword: string,
): Promise<EncryptedMasterPassword> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await deriveRecoveryKey(mnemonic, salt);

	const encoded = new TextEncoder().encode(masterPassword);
	const ciphertext = await crypto.subtle.encrypt(
		{ name: ALGORITHM, iv: iv as BufferSource },
		key,
		encoded,
	);

	return {
		encrypted: arrayBufferToBase64(ciphertext),
		salt: bytesToHex(salt),
		iv: bytesToHex(iv),
	};
}

/**
 * Decrypt the master password using the recovery mnemonic.
 * Returns the original master password string.
 */
export async function decryptMasterPassword(
	mnemonic: string,
	data: EncryptedMasterPassword,
): Promise<string> {
	const salt = hexToBytes(data.salt);
	const iv = hexToBytes(data.iv);
	const key = await deriveRecoveryKey(mnemonic, salt);

	const ciphertext = base64ToArrayBuffer(data.encrypted);
	const plaintext = await crypto.subtle.decrypt(
		{ name: ALGORITHM, iv: iv as BufferSource },
		key,
		ciphertext,
	);

	return new TextDecoder().decode(plaintext);
}

// ─── Hex / Base64 helpers ───────────────────────────────────────────────────

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
	}
	return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
}
