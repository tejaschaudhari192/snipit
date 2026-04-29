import Groq from "groq-sdk";
import configurations, { VALID_LANGUAGES } from "@/config/configurations.js";
import { AppError } from "@/lib/errors.js";

class AiService {
	private groq: Groq;

	constructor() {
		const apiKey = configurations.groq_api_key;
		if (!apiKey) {
			// Don't throw at initialization time to avoid crashing the server
			// instead, handle it during service calls
			this.groq = null as any;
		} else {
			this.groq = new Groq({ apiKey });
		}
	}

	private checkConfig() {
		if (!this.groq) {
			throw new AppError(
				"GROQ_API_KEY is not configured on the server",
				500,
			);
		}
	}

	async detectLanguage(content: string): Promise<string> {
		this.checkConfig();

		const prompt = `Analyze the following code or text and detect its programming language.
Return ONLY the name from this list: ${VALID_LANGUAGES.join(", ")}.
If it is code but doesn't match a specific language, return 'code'.
If it is clearly plain text, return 'text'.

Content snippet:
${content.slice(0, 1000)}`;

		const chatCompletion = await this.groq.chat.completions.create({
			messages: [{ role: "user", content: prompt }],
			model: "llama-3.3-70b-versatile",
		});

		let language =
			chatCompletion.choices[0]?.message?.content?.trim().toLowerCase() ||
			"text";

		// Clean up potential markdown or extra whitespace
		language = language.replace(/```/g, "").trim();

		if (
			!VALID_LANGUAGES.includes(
				language as (typeof VALID_LANGUAGES)[number],
			)
		) {
			return "text";
		}

		return language;
	}

	async enhanceContent(
		content: string,
		instruction: string,
	): Promise<string> {
		this.checkConfig();

		const systemPrompt = `You are an AI assistant embedded inside a text editor.
Your job is to transform or analyze the user's selected text based on their instruction.

Rules:
- Only operate on the provided text.
- Be concise and deterministic.
- Do not add explanations unless explicitly asked.
- Preserve formatting unless the user asks to change it.
- If rewriting, keep the original meaning unless instructed otherwise.
- Output only the final result (no commentary or conversational filler). Do not wrap the output in markdown code blocks unless the text itself is code and it makes sense to do so.`;

		const userPrompt = `Instruction: ${instruction}\n\nSelected Text:\n${content}`;

		const chatCompletion = await this.groq.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			model: "llama-3.3-70b-versatile",
			temperature: 0,
		});

		return chatCompletion.choices[0]?.message?.content?.trim() || "";
	}
}

export default AiService;
