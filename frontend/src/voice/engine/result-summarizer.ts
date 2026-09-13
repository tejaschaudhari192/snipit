import api from "@/lib/api";

export interface ResultSummaryRequest {
	userQuery: string;
	actionType: string;
	screenText: string;
	lang?: string;
}

export class ResultSummarizer {
	/**
	 * Generates a concise, natural, 1-2 sentence spoken summary of screen results
	 * using Groq qwen/qwen3.8-27b via the backend service.
	 */
	public static async summarize(req: ResultSummaryRequest): Promise<string> {
		const { userQuery, actionType, screenText, lang = "en" } = req;

		if (!screenText || screenText.trim().length < 10) {
			return "The action completed, but there is no additional details to report.";
		}

		try {
			const prompt = `You are the voice of Snipit Copilot.
The user requested: "${userQuery}".
The application executed the action "${actionType}" and the screen now shows the following output:
"""
${screenText}
"""

Rules for your verbal response:
1. Speak in the user's active language: "${lang}".
2. Provide a concise, clear spoken summary of the key finding or outcome (1-2 sentences, max 25 words) in "${lang}".
3. If there are booking/ticket results (e.g. PNR, train name, coach, berth, confirmation status), speak the most critical details directly in "${lang}".
4. If there are train search or schedule results, state how many trains were found and the top option or timings in "${lang}".
5. If there is an error on the screen (e.g., "invalid PNR", "not found", "server error"), state it clearly and politely in "${lang}".
6. Do NOT use markdown, bullet points, asterisks, or symbols. Output ONLY plain, warm, conversational text suitable for speech synthesis.`;

			const res = await api.post<{ text: string }>(
				"/ai/voice/summarize",
				{ prompt },
			);
			if (res.data?.text) {
				return res.data.text;
			}

			throw new Error("Empty summary returned by Groq voice service");
		} catch (err) {
			console.error("Groq ResultSummarizer failed:", err);
			throw err;
		}
	}
}
