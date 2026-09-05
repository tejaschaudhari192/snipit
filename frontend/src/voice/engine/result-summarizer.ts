import { loadPuterJs } from "@/lib/puter-tts";

export interface ResultSummaryRequest {
	userQuery: string;
	actionType: string;
	screenText: string;
	lang?: string;
}

export class ResultSummarizer {
	/**
	 * Generates a concise, natural, 1-2 sentence spoken summary of screen results.
	 */
	public static async summarize(req: ResultSummaryRequest): Promise<string> {
		const { userQuery, actionType, screenText, lang = "en" } = req;

		if (!screenText || screenText.trim().length < 10) {
			return "The action completed, but there is no additional details to report.";
		}

		try {
			await loadPuterJs();

			if (typeof window !== "undefined" && window.puter?.ai?.chat) {
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

				const response = await window.puter.ai.chat(
					[{ role: "user", content: prompt }],
					{
						model: "gpt-4o-mini",
						temperature: 0.5,
					},
				);

				const resObj =
					response && typeof response === "object"
						? (response as Record<string, unknown>)
						: null;
				const msgObj =
					resObj?.message && typeof resObj.message === "object"
						? (resObj.message as Record<string, unknown>)
						: null;
				const summary =
					typeof response === "string"
						? response
						: (typeof msgObj?.content === "string"
								? msgObj.content
								: "") ||
							(typeof resObj?.text === "string"
								? resObj.text
								: "");

				const cleanSummary = summary
					.replace(/[*_#`]/g, "")
					.replace(/\n+/g, " ")
					.trim();

				if (cleanSummary) {
					return cleanSummary;
				}
			}
		} catch (err) {
			console.warn(
				"ResultSummarizer failed, using generic fallback:",
				err,
			);
		}

		// Generic heuristic fallback if LLM is unavailable
		if (/confirmed|cnf|berth|coach/i.test(screenText)) {
			return "Your booking details are displayed on the screen.";
		}
		if (/error|invalid|not found/i.test(screenText)) {
			return "It looks like there was an issue retrieving the details. Please check the screen.";
		}
		return "Here are the results you requested.";
	}
}
