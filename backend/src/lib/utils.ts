import { animals, colors, adjectives } from "unique-names-generator";

/**
 * Filtered, single-word list for fast auto ID generation (e.g. "fox", "ruby", "swift")
 */
const AUTO_ID_WORDS: string[] = Array.from(
	new Set(
		[...animals, ...colors, ...adjectives]
			.flatMap((item) =>
				item
					.toLowerCase()
					.replace(/[^a-z0-9]/g, "")
					.trim(),
			)
			.filter((w) => w.length >= 3 && w.length <= 8),
	),
);

/**
 * Returns a random word from the dictionary (e.g. "fox", "ruby", "swift")
 */
export function getRandomWord(): string {
	return (
		AUTO_ID_WORDS[Math.floor(Math.random() * AUTO_ID_WORDS.length)] ||
		"snip"
	);
}

/**
 * Generates an automatic ID.
 * - attempt 0: Pure single word (e.g. "fox", "swift")
 * - attempt > 0: Word + number (e.g. "fox2", "fox42")
 */
export function uniqueIdGenerator(attempt = 0, baseWord?: string): string {
	const word = baseWord || getRandomWord();
	if (attempt === 0) {
		return word;
	}
	if (attempt === 1) {
		// First fallback: small single digit (2 to 9)
		const singleDigit = Math.floor(2 + Math.random() * 8);
		return `${word}${singleDigit}`;
	}
	// Subsequent fallbacks: 2-digit number (10 to 99)
	const number = Math.floor(10 + Math.random() * 90);
	return `${word}${number}`;
}

export function dateConverter(expiresTime: string) {
	let expiresAt: Date | null;
	const now = new Date();

	switch (expiresTime) {
		case "1h":
			expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000); // +1 hour
			break;
		case "1d":
			expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
			break;
		case "1w":
			expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +1 week
			break;
		case "1m":
			expiresAt = new Date(now.setMonth(now.getMonth() + 1)); // +1 month
			break;
		case "1y":
			expiresAt = new Date(now.setFullYear(now.getFullYear() + 1)); // +1 year
			break;
		case "never":
			expiresAt = null;
			break;
		case "one-time":
			expiresAt = null; // special handling (e.g. delete after first view)
			break;
		default: {
			const customDate = new Date(expiresTime);
			expiresAt =
				expiresTime && !isNaN(customDate.getTime()) ? customDate : null;
		}
	}

	return expiresAt;
}
