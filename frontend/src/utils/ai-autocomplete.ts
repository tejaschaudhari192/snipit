/**
 * Processes the AI completion to handle whitespace issues between the prefix and the completion.
 * Prevents double spaces and adds missing spaces between words/alphanumeric tokens.
 */
export const processAiCompletion = (
	completion: string,
	prefix: string,
): string => {
	if (!completion) return "";

	let processed = completion;

	// Strip accidental markdown fences like ```typescript ... ```
	if (processed.startsWith("```")) {
		processed = processed.replace(/^```[a-zA-Z0-9_-]*\n?/, "");
		processed = processed.replace(/\n?```$/, "");
	}

	// If the model echoed back the ending of prefix, strip the overlap
	const trimmedPrefix = prefix.slice(-30);
	for (let len = Math.min(trimmedPrefix.length, 25); len >= 4; len--) {
		const sub = trimmedPrefix.slice(-len);
		if (processed.startsWith(sub)) {
			processed = processed.slice(len);
			break;
		}
	}

	const prefixEndsWithSpace = /\s$/.test(prefix);
	const completionStartsWithSpace = /^\s/.test(processed);

	if (prefixEndsWithSpace && completionStartsWithSpace) {
		// Avoid double spaces
		processed = processed.trimStart();
	} else if (
		!prefixEndsWithSpace &&
		!completionStartsWithSpace &&
		/[a-zA-Z0-9]$/.test(prefix) &&
		/^[a-zA-Z0-9]/.test(processed)
	) {
		// Add missing space between alphanumeric tokens
		processed = " " + processed;
	}

	return processed;
};

import type { editor, Position } from "monaco-editor";

/**
 * Extracts the prefix and suffix context around a given position in a Monaco model.
 */
export const getMonacoContext = (
	model: editor.ITextModel,
	position: Position,
): { prefix: string; suffix: string } => {
	const prefix = model.getValueInRange({
		startLineNumber: 1,
		startColumn: 1,
		endLineNumber: position.lineNumber,
		endColumn: position.column,
	});

	const suffix = model.getValueInRange({
		startLineNumber: position.lineNumber,
		startColumn: position.column,
		endLineNumber: model.getLineCount(),
		endColumn: model.getLineMaxColumn(model.getLineCount()),
	});

	return { prefix, suffix };
};
