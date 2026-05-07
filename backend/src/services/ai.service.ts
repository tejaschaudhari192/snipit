import Groq from "groq-sdk";
import configurations from "@/config/configurations.js";
import { VALID_LANGUAGES } from "@/config/constants.js";
import { PROMPTS } from "@/config/prompts.js";
import { AppError } from "@/lib/errors.js";

class AiService {
	private groq: Groq;

	constructor() {
		this.groq = new Groq({ apiKey: configurations.groq_api_key });
	}

	async verify() {
		try {
			const models = await this.groq.models.list();
			return models.data.some((m) => m.id === configurations.groq_model);
		} catch (error) {
			return false;
		}
	}

	async detectLanguage(content: string): Promise<string> {
		const prompt = PROMPTS.DETECT_LANGUAGE([...VALID_LANGUAGES], content);

		const chatCompletion = await this.groq.chat.completions.create({
			messages: [{ role: "user", content: prompt }],
			model: configurations.groq_model,
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
		const systemPrompt = PROMPTS.ENHANCE_CONTENT.SYSTEM;
		const userPrompt = PROMPTS.ENHANCE_CONTENT.USER(instruction, content);

		const chatCompletion = await this.groq.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			model: configurations.groq_model,
			temperature: 0,
		});

		return chatCompletion.choices[0]?.message?.content?.trim() || "";
	}

	async autocomplete(
		language: string,
		prefix: string,
		suffix: string,
	): Promise<string> {
		const chatCompletion = await this.groq.chat.completions.create({
			messages: [
				{ role: "system", content: PROMPTS.AUTOCOMPLETE.SYSTEM },
				{
					role: "user",
					content: PROMPTS.AUTOCOMPLETE.USER(
						language,
						prefix,
						suffix,
					),
				},
			],
			model: configurations.groq_model,
			temperature: 0,
			max_tokens: 128,
			stop: ["\n\n"],
		});

		return chatCompletion.choices[0]?.message?.content?.trim() || "";
	}
}

export default AiService;
