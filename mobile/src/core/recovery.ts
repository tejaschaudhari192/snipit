import {
	generateMnemonic,
	mnemonicToSeedSync,
	validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import * as Crypto from "expo-crypto";

/**
 * Generate a 12-word BIP39 mnemonic recovery key.
 */
export function generateRecoveryMnemonic(): string {
	return generateMnemonic(wordlist, 128);
}

/**
 * Validate a 12-word BIP39 mnemonic.
 */
export function isValidMnemonic(mnemonic: string): boolean {
	return validateMnemonic(mnemonic.trim().toLowerCase(), wordlist);
}

/**
 * Derive an encryption key from a recovery mnemonic + salt.
 */
export async function deriveKeyFromMnemonic(
	mnemonic: string,
	salt: string,
): Promise<Uint8Array> {
	const seed = mnemonicToSeedSync(mnemonic.trim().toLowerCase());
	const seedHex = naclUtil.encodeBase64(seed);

	let combined = `${seedHex}:${salt}`;
	for (let i = 0; i < 2000; i++) {
		combined = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			combined,
		);
	}
	const hex = await Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA256,
		combined,
	);
	const bytes = new Uint8Array(32);
	for (let i = 0; i < 32; i++) {
		bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
	}
	return bytes;
}

/**
 * Encrypt the master password with the recovery mnemonic.
 */
export async function encryptMasterPasswordWithMnemonic(
	mnemonic: string,
	masterPassword: string,
): Promise<{ encrypted: string; salt: string }> {
	const salt = Math.random().toString(36).substring(2) + Date.now().toString(36);
	const key = await deriveKeyFromMnemonic(mnemonic, salt);

	const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
	const messageUint8 = naclUtil.decodeUTF8(JSON.stringify({ masterPassword }));
	const box = nacl.secretbox(messageUint8, nonce, key);

	const fullMessage = new Uint8Array(nonce.length + box.length);
	fullMessage.set(nonce);
	fullMessage.set(box, nonce.length);

	return {
		encrypted: naclUtil.encodeBase64(fullMessage),
		salt,
	};
}

/**
 * Decrypt master password using recovery mnemonic.
 */
export async function decryptMasterPasswordWithMnemonic(
	mnemonic: string,
	encryptedBase64: string,
	salt: string,
): Promise<string> {
	const key = await deriveKeyFromMnemonic(mnemonic, salt);
	const messageWithNonce = naclUtil.decodeBase64(encryptedBase64);
	const nonce = messageWithNonce.slice(0, nacl.secretbox.nonceLength);
	const message = messageWithNonce.slice(
		nacl.secretbox.nonceLength,
		messageWithNonce.length,
	);

	const decrypted = nacl.secretbox.open(message, nonce, key);
	if (!decrypted) {
		throw new Error("Invalid recovery key or corrupted recovery record.");
	}

	const parsed = JSON.parse(naclUtil.encodeUTF8(decrypted));
	return parsed.masterPassword;
}
