/**
 * Processes the AI completion to handle whitespace issues between the prefix and the completion.
 * Prevents double spaces and adds missing spaces between words/alphanumeric tokens.
 */
export const processAiCompletion = (
	completion: string,
	prefix: string,
): string => {
	let processed = completion;

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

/**
 * Extracts the prefix and suffix context around a given position in a Monaco model.
 */
export const getMonacoContext = (
	model: any, // eslint-disable-line @typescript-eslint/no-explicit-any
	position: any, // eslint-disable-line @typescript-eslint/no-explicit-any
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
