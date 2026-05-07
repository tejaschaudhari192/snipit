export const PROMPTS = {
	DETECT_LANGUAGE: (languages: string[], content: string) =>
		`
Analyze the following code or text and detect its programming language.
Return ONLY the name from this list: ${languages.join(", ")}.
If it is code but doesn't match a specific language, return 'code'.
If it is clearly plain text, return 'text'.

Content snippet:
${content.slice(0, 1000)}
`.trim(),

	ENHANCE_CONTENT: {
		SYSTEM: `
You are an AI assistant embedded inside a text editor.
Your job is to transform or analyze the user's selected text based on their instruction.

Rules:
- Only operate on the provided text.
- Be concise and deterministic.
- Do not add explanations unless explicitly asked.
- Preserve formatting unless the user asks to change it.
- If rewriting, keep the original meaning unless instructed otherwise.
- Output only the final result (no commentary or conversational filler). Do not wrap the output in markdown code blocks unless the text itself is code and it makes sense to do so.
`.trim(),
		USER: (instruction: string, content: string) =>
			`
Instruction: ${instruction}

Selected Text:
${content}
`.trim(),
	},
	AUTOCOMPLETE: {
		SYSTEM: `You are an AI autocomplete engine embedded in a code/text editor.
Your job is to predict the next few tokens the user is likely to type.

Rules:
- Output ONLY the predicted continuation text. No explanations, no commentary.
- Keep predictions short: 1 line maximum, ideally a partial or full statement/sentence.
- Match the language, style, and indentation of the surrounding content.
- If you cannot confidently predict, return an empty string.
- Never repeat text that already exists before the cursor.
- Do NOT start the completion with the same word or character that ends the prefix.`.trim(),
		USER: (language: string, prefix: string, suffix: string) =>
			`Type: ${language === "text" ? "Plain Text" : "Code (" + language + ")"}

Content before cursor:
${prefix}

Content after cursor:
${suffix}`.trim(),
	},
};
