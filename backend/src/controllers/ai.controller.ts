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

		if (
			!VALID_LANGUAGES.includes(
				language as (typeof VALID_LANGUAGES)[number],
			)
		) {
			language = "text";
		}

		res.json({ language });
	} catch (error) {
		console.error("Error detecting language:", error);
		res.status(500).json({ error: "Failed to detect language" });
	}
};

export const enhanceContent = async (req: Request, res: Response) => {
	try {
		const { content, instruction } = req.body;

		if (!content || !instruction) {
			res.status(400).json({
				error: "Content and instruction are required",
			});
			return;
		}

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

		const chatCompletion = await groq.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			model: "llama-3.3-70b-versatile",
			temperature: 0,
		});

		const result = chatCompletion.choices[0]?.message?.content || "";

		res.json({ result: result.trim() });
	} catch (error) {
		console.error("Error enhancing content:", error);
		res.status(500).json({ error: "Failed to enhance content" });
	}
};
