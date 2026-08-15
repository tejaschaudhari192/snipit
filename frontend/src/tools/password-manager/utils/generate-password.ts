/**
 * Secure random password generation using the Web Crypto API.
 * Replaces generate-password-ts to avoid Node crypto module imports.
 */

import { PASSWORD_CHARS } from "./constants";

export interface GenerateOptions {
	length?: number;
	numbers?: boolean;
	symbols?: boolean;
	uppercase?: boolean;
	lowercase?: boolean;
	strict?: boolean;
}

export function generatePassword(options: GenerateOptions = {}): string {
	const {
		length = 15,
		numbers = false,
		symbols = true,
		uppercase = false,
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

	const array = new Uint32Array(length);
	window.crypto.getRandomValues(array);
	return Array.from(array)
		.map((n) => pool[n % pool.length])
		.join("");
}
