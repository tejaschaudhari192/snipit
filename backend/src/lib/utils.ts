import { animals, colors, adjectives } from "unique-names-generator";
import { INDIAN_VOCAB } from "./indian-vocab.js";
import { TECH_VOCAB } from "./tech-vocab.js";
import type { IdTheme } from "@/types/index.js";

/**
 * Filtered, single-word list for standard English words (e.g. "fox", "ruby", "swift")
 */
const ENGLISH_ID_WORDS: string[] = Array.from(
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
 * Clean Indian vocabulary list
 */
const INDIAN_ID_WORDS: string[] = Array.from(
	new Set(
		INDIAN_VOCAB.map((w) =>
			w
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "")
				.trim(),
		).filter((w) => w.length >= 3 && w.length <= 8),
	),
);

/**
 * Clean Tech vocabulary list
 */
const TECH_ID_WORDS: string[] = Array.from(
	new Set(
		TECH_VOCAB.map((w) =>
			w
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "")
				.trim(),
		).filter((w) => w.length >= 3 && w.length <= 8),
	),
);

/**
 * Returns a random word from the dictionary based on user's preferred theme.
 * Defaults to "indian" vocabulary.
 * Themes:
 * - "indian": Indian vocabulary words
 * - "tech": Developer / tech vocabulary
 * - "english": Standard English words
 * - "all": Equal random mix across all sets
 */
export function getRandomWord(theme: IdTheme = "indian"): string {
	let list: string[];

	switch (theme) {
		case "indian":
			list = INDIAN_ID_WORDS;
			break;
		case "tech":
			list = TECH_ID_WORDS;
			break;
		case "english":
			list = ENGLISH_ID_WORDS;
			break;
		case "all":
		default: {
			const rand = Math.random();
			if (rand < 0.5) {
				list = INDIAN_ID_WORDS;
			} else if (rand < 0.75) {
				list = TECH_ID_WORDS;
			} else {
				list = ENGLISH_ID_WORDS;
			}
			break;
		}
	}

	if (!list || list.length === 0) list = INDIAN_ID_WORDS;
	return list[Math.floor(Math.random() * list.length)] || "snip";
}

/**
 * Generates an automatic ID.
 * - attempt 0: Pure single word (e.g. "suraj", "node", "fox")
 * - attempt > 0: Word + number (e.g. "suraj2", "node42")
 */
export function uniqueIdGenerator(
	attempt = 0,
	baseWord?: string,
	theme: IdTheme = "indian",
): string {
	const word = baseWord || getRandomWord(theme);
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
