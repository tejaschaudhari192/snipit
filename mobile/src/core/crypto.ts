import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import * as Crypto from "expo-crypto";
import { wordlist } from "@scure/bip39/wordlists/english.js";

// Configure TweetNaCl PRNG for React Native Android / iOS release builds
// Without this, TweetNaCl throws "Error: no PRNG" on native platforms.
nacl.setPRNG((x: Uint8Array, n: number) => {
	const random = Crypto.getRandomValues(new Uint8Array(n));
	for (let i = 0; i < n; i++) {
		x[i] = random[i];
	}
});

import { pbkdf2 as fastPbkdf2 } from "fast-sha256";

let quickCrypto: any = null;
try {
	// Attempt to load react-native-quick-crypto C++ JSI implementation
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	quickCrypto = require("react-native-quick-crypto");
	if (quickCrypto && quickCrypto.default) {
		quickCrypto = quickCrypto.default;
	}
} catch {
	quickCrypto = null;
}

/**
 * Derives a 32-byte Master Encryption Key (MEK) from a password & salt.
 * Matches web implementation: PBKDF2 with 100,000 iterations, SHA-256, 256 bits.
 *
 * Performance:
 * 1. Native C++ JSI (react-native-quick-crypto): ~15-40ms (Instant, sub-second!)
 * 2. WebCrypto (crypto.subtle on browsers): ~50-80ms
 * 3. Pure JS fallback (fast-sha256): used only if native bindings are unavailable.
 */
export async function deriveMEK(
	password: string,
	salt: string,
): Promise<Uint8Array> {
	// 1. Native C++ JSI PBKDF2 via react-native-quick-crypto (Blazing fast: ~20ms!)
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
			console.log("quickCrypto.pbkdf2Sync failed, attempting async/fallback:", err);
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

	// 2. Standard WebCrypto (Web browser environment)
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
			console.log("WebCrypto deriveBits failed, falling back to fast-sha256 PBKDF2:", e);
		}
	}

	// 3. Pure JavaScript fallback if native is unavailable:
	const enc = new TextEncoder();
	return fastPbkdf2(enc.encode(password), enc.encode(salt), 100000, 32);
}

/**
 * Generate a random 32-byte symmetric key for vault items
 */
export function generateSymmetricKey(): Uint8Array {
	return nacl.randomBytes(nacl.secretbox.keyLength);
}

/**
 * Encrypt data symmetrically using TweetNaCl secretbox (XSalsa20-Poly1305)
 */
export function encryptSymmetric(data: unknown, key: Uint8Array): string {
	const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
	const messageUint8 = naclUtil.decodeUTF8(JSON.stringify(data));
	const box = nacl.secretbox(messageUint8, nonce, key);

	const fullMessage = new Uint8Array(nonce.length + box.length);
	fullMessage.set(nonce);
	fullMessage.set(box, nonce.length);

	return naclUtil.encodeBase64(fullMessage);
}

/**
 * Decrypt data symmetrically using TweetNaCl secretbox
 */
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
		throw new Error("Decryption failed. Incorrect master password or corrupt data.");
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

/**
 * Generate a secure random password matching the web implementation.
 */
export function generatePassword(optionsOrLength: GenerateOptions | number = 15): string {
	const options: GenerateOptions =
		typeof optionsOrLength === "number"
			? { length: optionsOrLength, lowercase: true, uppercase: true, numbers: true, symbols: true }
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

/**
 * Advanced passphrase generator using diceware wordlist matching web.
 */
export function generatePassphrase(options: {
	wordCount?: number;
	separator?: SeparatorType;
	capitalize?: boolean;
	includeNumber?: boolean;
} = {}): string {
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
		const index = ((randomBytes[i * 2] << 8) | randomBytes[i * 2 + 1]) % wordlist.length;
		let word = wordlist[index] || "word";
		if (capitalize) {
			word = word.charAt(0).toUpperCase() + word.slice(1);
		}
		words.push(word);
	}

	if (includeNumber && words.length > 0) {
		const numBytes = nacl.randomBytes(1);
		const num = (numBytes[0] % 100).toString();
		words[words.length - 1] += num;
	}

	return words.join(sepChar);
}

/**
 * Calculates password strength score (0 to 4) and label matching web
 */
export function evaluatePasswordStrength(pass: string): {
	score: number;
	label: string;
	color: string;
	headerBg: string;
	barBg: string;
} {
	if (!pass) {
		return {
			score: 0,
			label: "Risky",
			color: "#ef4444",
			headerBg: "#da1111",
			barBg: "#b30e0e",
		};
	}

	let score = 0;
	if (pass.length >= 8) score++;
	if (pass.length >= 14) score++;
	if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
	if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;

	if (score <= 1) {
		return {
			score: 1,
			label: "Weak",
			color: "#ef4444",
			headerBg: "#da1111",
			barBg: "#b30e0e",
		};
	}
	if (score === 2) {
		return {
			score: 2,
			label: "Fair",
			color: "#f59e0b",
			headerBg: "#d97706",
			barBg: "#b45309",
		};
	}
	if (score === 3) {
		return {
			score: 3,
			label: "Strong",
			color: "#10b981",
			headerBg: "#059669",
			barBg: "#047857",
		};
	}
	return {
		score: 4,
		label: "Secure",
		color: "#059669",
		headerBg: "#047857",
		barBg: "#065f46",
	};
}
