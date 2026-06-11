import Sanscript from "@indic-transliteration/sanscript";
import { TRANSLITERATION_LANGUAGES } from "@/constants";

/**
 * Generates phonetic variations of a given English/Latin word to improve transliteration match chances.
 */
export const getPhoneticVariations = (word: string): string[] => {
	const variations = new Set<string>();
	const base = word.toLowerCase();
	variations.add(base);

	// Vowel variations
	if (base.endsWith("i")) variations.add(base.slice(0, -1) + "I");
	if (base.endsWith("u")) variations.add(base.slice(0, -1) + "U");
	if (base.includes("a")) variations.add(base.replace(/a/g, "A"));
	if (base.includes("i")) variations.add(base.replace(/i/g, "I"));
	if (base.includes("u")) variations.add(base.replace(/u/g, "U"));

	// Consonant variations (retroflex)
	if (base.includes("t")) variations.add(base.replace(/t/g, "T"));
	if (base.includes("d")) variations.add(base.replace(/d/g, "D"));
	if (base.includes("n")) variations.add(base.replace(/n/g, "N"));
	if (base.includes("sh")) variations.add(base.replace(/sh/g, "S"));

	// Combinations
	if (base.endsWith("i") && base.includes("t")) {
		variations.add(base.replace(/t/g, "T").slice(0, -1) + "I");
	}

	return Array.from(variations);
};

/**
 * Gets a set of unique transliterated outputs in the target language script.
 */
export const getTransliteratedSuggestions = (
	word: string,
	targetLanguage: string,
): string[] => {
	if (!word || !/^[a-zA-Z]+$/.test(word)) {
		return [];
	}

	const itransVariations = getPhoneticVariations(word);
	const indicSet = new Set<string>();

	const langObj = TRANSLITERATION_LANGUAGES.find(
		(l) => l.value === targetLanguage,
	);
	const targetScript = langObj ? langObj.script : "devanagari";

	itransVariations.forEach((v) => {
		const transliterated = Sanscript.t(v, "itrans", targetScript);
		if (transliterated) indicSet.add(transliterated);
	});

	return Array.from(indicSet);
};
