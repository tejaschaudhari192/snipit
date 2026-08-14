/**
 * Secure random password generation using the Web Crypto API.
 * Replaces generate-password-ts to avoid Node crypto module imports.
 */

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

	const chars = {
		lowercase: "abcdefghijklmnopqrstuvwxyz",
		uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		numbers: "0123456789",
		symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
	};

	let pool = "";
	if (uppercase) pool += chars.uppercase;
	if (numbers) pool += chars.numbers;
	if (lowercase) pool += chars.lowercase;
	if (symbols) pool += chars.symbols;

	if (strict && pool.length === 0) {
		pool =
			chars.lowercase + chars.uppercase + chars.numbers + chars.symbols;
	}

	const array = new Uint32Array(length);
	window.crypto.getRandomValues(array);
	return Array.from(array)
		.map((n) => pool[n % pool.length])
		.join("");
}
