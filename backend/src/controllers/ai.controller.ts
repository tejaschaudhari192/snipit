import Groq from "groq-sdk";
import type { Request, Response } from "express";
import configurations, { VALID_LANGUAGES } from "@/config/configurations.js";

const apiKey = configurations.groq_api_key;

if (!apiKey) {
	throw new Error("GROQ_API_KEY is not set in the environment variables");
}

const groq = new Groq({ apiKey });

export const detectLanguage = async (req: Request, res: Response) => {
	try {
		const { content } = req.body;

		if (!content) {
			res.status(400).json({ error: "Content is required" });
			return;
		}

		const prompt = `Analyze the following code or text and detect its programming language.
Return ONLY the name from this list: ${VALID_LANGUAGES.join(", ")}.
If it is code but doesn't match a specific language, return 'code'.
If it is clearly plain text, return 'text'.

Content snippet:
${content.slice(0, 1000)}`;

		const chatCompletion = await groq.chat.completions.create({
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			model: "llama-3.3-70b-versatile",
		});

		let language =
			chatCompletion.choices[0]?.message?.content?.trim().toLowerCase() ||
			"text";

		language = language.trim().toLowerCase();

		// Clean up any potential extra characters (like markdown code blocks if the model outputs them)
		language = language.replace(/```/g, "").trim();

		if (!VALID_LANGUAGES.includes(language as any)) {
			language = "text";
		}

		res.json({ language });
	} catch (error) {
		console.error("Error detecting language:", error);
		res.status(500).json({ error: "Failed to detect language" });
	}
};
