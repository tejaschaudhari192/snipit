import Groq from "groq-sdk";
import configurations from "@/config/configurations.js";
import { VALID_LANGUAGES } from "@/config/constants.js";
import { PROMPTS } from "@/config/prompts.js";
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

	async verify() {
		if (!this.groq) return false;
		try {
			const models = await this.groq.models.list();
			return models.data.some((m) => m.id === configurations.groq_model);
		} catch (error) {
			return false;
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

		const prompt = PROMPTS.DETECT_LANGUAGE([...VALID_LANGUAGES], content);

		const chatCompletion = await this.groq.chat.completions.create({
			messages: [{ role: "user", content: prompt }],
			model: configurations.groq_model!,
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

		const systemPrompt = PROMPTS.ENHANCE_CONTENT.SYSTEM;
		const userPrompt = PROMPTS.ENHANCE_CONTENT.USER(instruction, content);

		const chatCompletion = await this.groq.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			model: configurations.groq_model!,
			temperature: 0,
		});

		return chatCompletion.choices[0]?.message?.content?.trim() || "";
	}
}

export default AiService;
