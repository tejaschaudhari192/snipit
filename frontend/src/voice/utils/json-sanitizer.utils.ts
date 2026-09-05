/**
 * Cleans LLM JSON markdown blocks and safely parses into strongly typed data.
 */
export function cleanAndParseJson<T>(rawContent: string): T | null {
	if (!rawContent || !rawContent.trim()) return null;

	let cleaned = rawContent.trim();
	if (cleaned.startsWith("```json")) {
		cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "");
	} else if (cleaned.startsWith("```")) {
		cleaned = cleaned.replace(/^```/, "").replace(/```$/, "");
	}
	cleaned = cleaned.trim();

	try {
		return JSON.parse(cleaned) as T;
	} catch {
		// Fallback: regex search for outer JSON object
		const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			try {
				return JSON.parse(jsonMatch[0]) as T;
			} catch {
				return null;
			}
		}
		return null;
	}
}
