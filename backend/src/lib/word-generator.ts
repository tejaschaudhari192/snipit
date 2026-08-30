import {
	uniqueNamesGenerator,
	adjectives,
	animals,
	colors,
	countries,
	names,
	starWars,
	languages,
	NumberDictionary,
} from "unique-names-generator";

/**
 * Tokenizes dictionary entries into individual single words (splits multi-words like "anakin skywalker" -> "anakin", "skywalker")
 */
const sanitizeDictionary = (list: string[]): string[] => {
	const words = new Set<string>();
	for (const item of list) {
		const tokens = item
			.toLowerCase()
			.replace(/[^a-zA-Z0-9\s-_]/g, "")
			.split(/[\s_-]+/)
			.map((w) => w.trim())
			.filter((w) => w.length >= 2);

		for (const token of tokens) {
			words.add(token);
		}
	}
	return Array.from(words);
};

const CATEGORY_DICTIONARIES: Record<string, string[]> = {
	animals: sanitizeDictionary(animals),
	colors: sanitizeDictionary(colors),
	adjectives: sanitizeDictionary(adjectives),
	countries: sanitizeDictionary(countries),
	names: sanitizeDictionary(names),
	starWars: sanitizeDictionary(starWars),
	languages: sanitizeDictionary(languages),
};

export type WordCategory = keyof typeof CATEGORY_DICTIONARIES;

export const WORD_CATEGORIES = Object.keys(
	CATEGORY_DICTIONARIES,
) as WordCategory[];

/**
 * Generates a combination of words from selected categories using unique-names-generator
 */
export function generateWordId(
	count: number = 2,
	categories: WordCategory[] = ["animals", "colors"],
	includeNumber: boolean = false,
	style: "lowerCase" | "capital" = "lowerCase",
	separator: string = "-",
): string {
	const activeCategories =
		categories && categories.length > 0
			? categories.filter((c) => CATEGORY_DICTIONARIES[c])
			: (["animals", "colors"] as WordCategory[]);

	const validCategories =
		activeCategories.length > 0
			? activeCategories
			: (["animals"] as WordCategory[]);

	const fallbackDict = CATEGORY_DICTIONARIES.animals ?? [];
	const selectedDictionaries: string[][] = [];

	for (let i = 0; i < count; i++) {
		const cat = validCategories[i % validCategories.length];
		const dict = cat ? CATEGORY_DICTIONARIES[cat] : fallbackDict;
		selectedDictionaries.push(dict ?? fallbackDict);
	}

	if (includeNumber) {
		selectedDictionaries.push(
			NumberDictionary.generate({ min: 10, max: 999 }),
		);
	}

	const generated = uniqueNamesGenerator({
		dictionaries: selectedDictionaries,
		separator,
		style,
	});

	// Robust URL-safe cleanup: normalize all spaces/underscores/consecutive separators
	const sepPattern = separator.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
	return generated
		.replace(/[\s_]+/g, separator)
		.replace(new RegExp(`${sepPattern}+`, "g"), separator)
		.trim();
}
