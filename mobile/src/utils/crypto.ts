import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import * as Crypto from "expo-crypto";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { pbkdf2 as fastPbkdf2 } from "fast-sha256";

nacl.setPRNG((x: Uint8Array, n: number) => {
	const random = Crypto.getRandomValues(new Uint8Array(n));
	for (let i = 0; i < n; i++) {
		x[i] = random[i];
	}
});

let quickCrypto: any = null;
try {
	quickCrypto = require("react-native-quick-crypto");
	if (quickCrypto && quickCrypto.default) {
		quickCrypto = quickCrypto.default;
	}
} catch {
	quickCrypto = null;
}

export async function deriveMEK(
	password: string,
	salt: string,
): Promise<Uint8Array> {
	if (quickCrypto && typeof quickCrypto.pbkdf2Sync === "function") {
		try {
			const derived = quickCrypto.pbkdf2Sync(
				password,
				salt,
				100000,
				32,
				"sha256",
			);
			return new Uint8Array(derived);
		} catch (err) {
			console.log(
				"quickCrypto.pbkdf2Sync failed, attempting async/fallback:",
				err,
			);
		}
	}

	if (quickCrypto && typeof quickCrypto.pbkdf2 === "function") {
		try {
			const derived = await new Promise<Uint8Array>((resolve, reject) => {
				quickCrypto.pbkdf2(
					password,
					salt,
					100000,
					32,
					"sha256",
					(err: any, key: any) => {
						if (err) reject(err);
						else resolve(new Uint8Array(key));
					},
				);
			});
			return derived;
		} catch (err) {
			console.log("quickCrypto.pbkdf2 async failed:", err);
		}
	}

	if (typeof crypto !== "undefined" && crypto.subtle) {
		try {
			const enc = new TextEncoder();
			const keyMaterial = await crypto.subtle.importKey(
				"raw",
				enc.encode(password),
				{ name: "PBKDF2" },
				false,
				["deriveBits"],
			);
			const derivedBits = await crypto.subtle.deriveBits(
				{
					name: "PBKDF2",
					salt: enc.encode(salt),
					iterations: 100000,
					hash: "SHA-256",
				},
				keyMaterial,
				256,
			);
			return new Uint8Array(derivedBits);
		} catch (e) {
			console.log(
				"WebCrypto deriveBits failed, falling back to fast-sha256 PBKDF2:",
				e,
			);
		}
	}

	const enc = new TextEncoder();
	return fastPbkdf2(enc.encode(password), enc.encode(salt), 100000, 32);
}

export function generateSymmetricKey(): Uint8Array {
	return nacl.randomBytes(nacl.secretbox.keyLength);
}

export function encryptSymmetric(data: unknown, key: Uint8Array): string {
	const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
	const messageUint8 = naclUtil.decodeUTF8(JSON.stringify(data));
	const box = nacl.secretbox(messageUint8, nonce, key);
	const fullMessage = new Uint8Array(nonce.length + box.length);
	fullMessage.set(nonce);
	fullMessage.set(box, nonce.length);
	return naclUtil.encodeBase64(fullMessage);
}

export function decryptSymmetric<T = unknown>(
	encryptedBase64: string,
	key: Uint8Array,
): T {
	const messageWithNonce = naclUtil.decodeBase64(encryptedBase64);
	const nonce = messageWithNonce.slice(0, nacl.secretbox.nonceLength);
	const message = messageWithNonce.slice(
		nacl.secretbox.nonceLength,
		messageWithNonce.length,
	);
	const decrypted = nacl.secretbox.open(message, nonce, key);
	if (!decrypted) {
		throw new Error(
			"Decryption failed. Incorrect master password or corrupt data.",
		);
	}
	const utf8String = naclUtil.encodeUTF8(decrypted);
	try {
		return JSON.parse(utf8String) as T;
	} catch {
		return utf8String as unknown as T;
	}
}

export const PASSWORD_CHARS = {
	lowercase: "abcdefghijklmnopqrstuvwxyz",
	uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	numbers: "0123456789",
	symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export interface GenerateOptions {
	length?: number;
	numbers?: boolean;
	symbols?: boolean;
	uppercase?: boolean;
	lowercase?: boolean;
	strict?: boolean;
}

export function generatePassword(
	optionsOrLength: GenerateOptions | number = 15,
): string {
	const options: GenerateOptions =
		typeof optionsOrLength === "number"
			? {
					length: optionsOrLength,
					lowercase: true,
					uppercase: true,
					numbers: true,
					symbols: true,
				}
			: optionsOrLength;

	const {
		length = 15,
		numbers = true,
		symbols = true,
		uppercase = true,
		lowercase = true,
		strict = true,
	} = options;
	let pool = "";
	if (uppercase) pool += PASSWORD_CHARS.uppercase;
	if (numbers) pool += PASSWORD_CHARS.numbers;
	if (lowercase) pool += PASSWORD_CHARS.lowercase;
	if (symbols) pool += PASSWORD_CHARS.symbols;
	if (strict && pool.length === 0) {
		pool =
			PASSWORD_CHARS.lowercase +
			PASSWORD_CHARS.uppercase +
			PASSWORD_CHARS.numbers +
			PASSWORD_CHARS.symbols;
	}
	const randomBytes = nacl.randomBytes(length);
	return Array.from(randomBytes)
		.map((n: number) => pool[n % pool.length])
		.join("");
}

export type SeparatorType = "none" | "hash" | "hyphen" | "space" | "comma";

export function getSeparatorChar(sep: SeparatorType): string {
	switch (sep) {
		case "hash":
			return "#";
		case "hyphen":
			return "-";
		case "space":
			return " ";
		case "comma":
			return ",";
		default:
			return "";
	}
}

export function evaluatePasswordStrength(password: string): {
	score: number;
	label: string;
} {
	const length = password.length;
	let score = 0;

	if (length >= 12) score += 1;
	if (length >= 16) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[a-z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1;
	if (/[^A-Za-z0-9]/.test(password)) score += 1;

	if (score <= 2) return { score, label: "Weak" };
	if (score <= 4) return { score, label: "Moderate" };
	if (score <= 6) return { score, label: "Strong" };
	return { score, label: "Very Strong" };
}

export function generatePassphrase(
	options: {
		wordCount?: number;
		separator?: SeparatorType;
		capitalize?: boolean;
		includeNumber?: boolean;
	} = {},
): string {
	const {
		wordCount = 3,
		separator = "hyphen",
		capitalize = true,
		includeNumber = true,
	} = options;
	const sepChar = getSeparatorChar(separator);
	const words: string[] = [];
	const wordCountClamped = Math.max(2, Math.min(10, wordCount));
	const randomBytes = nacl.randomBytes(wordCountClamped * 2);
	for (let i = 0; i < wordCountClamped; i++) {
		const index =
			((randomBytes[i * 2] << 8) | randomBytes[i * 2 + 1]) %
			wordlist.length;
		let word = wordlist[index] || "word";
		if (capitalize) {
			word = word.charAt(0).toUpperCase() + word.slice(1);
		}
		words.push(word);
	}
	const passphrase = words.join(sepChar);
	if (!includeNumber) return passphrase;
	const suffix = (Math.floor(Math.random() * 900) + 100).toString();
	return `${passphrase}${sepChar}${suffix}`;
}

export function generateRecoveryMnemonic(): string {
	const entropy = Crypto.getRandomValues(new Uint8Array(16));
	return require("@scure/bip39").entropyToMnemonic(entropy, wordlist);
}

export function isValidMnemonic(mnemonic: string): boolean {
	return require("@scure/bip39").validateMnemonic(
		mnemonic.trim().toLowerCase(),
		wordlist,
	);
}

export async function deriveKeyFromMnemonic(
	mnemonic: string,
	salt: string,
): Promise<Uint8Array> {
	const { mnemonicToSeedSync } = require("@scure/bip39");
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

export async function encryptMasterPasswordWithMnemonic(
	mnemonic: string,
	masterPassword: string,
): Promise<{ encrypted: string; salt: string }> {
	const salt =
		Math.random().toString(36).substring(2) + Date.now().toString(36);
	const key = await deriveKeyFromMnemonic(mnemonic, salt);
	const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
	const messageUint8 = naclUtil.decodeUTF8(
		JSON.stringify({ masterPassword }),
	);
	const box = nacl.secretbox(messageUint8, nonce, key);
	const fullMessage = new Uint8Array(nonce.length + box.length);
	fullMessage.set(nonce);
	fullMessage.set(box, nonce.length);
	return { encrypted: naclUtil.encodeBase64(fullMessage), salt };
}

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
