/**
 * TTS (Text-to-Speech) Helper Utilities
 */

/**
 * Estimates the active word and its start character index in the spoken text
 * based on the current playhead position (currentTime / duration).
 */
export const getWordAtPlayhead = (
	spokenText: string,
	currentTime: number,
	duration: number,
): { word: string; actualStart: number } => {
	if (!spokenText || !duration) return { word: "", actualStart: 0 };

	const pct = currentTime / duration;
	const estimatedCharIndex = Math.floor(pct * spokenText.length);

	// Extract estimated word based on playhead position
	const textBefore = spokenText.slice(0, estimatedCharIndex);
	const wordStart = textBefore.search(/[^\s,.;:!?]+$/);
	const actualStart = wordStart !== -1 ? wordStart : estimatedCharIndex;

	const textAfter = spokenText.slice(actualStart);
	const wordMatch = textAfter.match(/^[^\s,.;:!?]+/);
	const word = wordMatch ? wordMatch[0] : "";

	return { word, actualStart };
};

/**
 * Maps the target word to the correct position index inside the Monaco Editor,
 * using context-aware buffer searching.
 */
export const getMonacoIndexForWord = (
	editorValue: string,
	word: string,
	estimatedStart: number,
	contentType: string,
): number => {
	if (contentType === "text") {
		return estimatedStart;
	}

	// Search within a 50-character buffer of the current spoken index
	const searchBuffer = editorValue.indexOf(
		word,
		Math.max(0, estimatedStart - 50),
	);
	if (searchBuffer !== -1) {
		return searchBuffer;
	}

	// Fallback to global search if buffer search fails
	const globalSearch = editorValue.indexOf(word);
	if (globalSearch !== -1) {
		return globalSearch;
	}

	return estimatedStart;
};
