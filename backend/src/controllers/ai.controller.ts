import type { Request, Response } from "express";
import type AiService from "@/services/ai.service.js";

class AiController {
	constructor(private readonly aiService: AiService) {}

	async detectLanguage(req: Request, res: Response) {
		const { content } = req.body;

		if (!content) {
			return res.status(400).json({ error: "Content is required" });
		}

		const language = await this.aiService.detectLanguage(content);
		res.json({ language });
	}

	async enhanceContent(req: Request, res: Response) {
		const { content, instruction } = req.body;

		if (!content || !instruction) {
			return res.status(400).json({
				error: "Content and instruction are required",
			});
		}

		const result = await this.aiService.enhanceContent(
			content,
			instruction,
		);
		res.json({ result });
	}

	async autocomplete(req: Request, res: Response) {
		const { language, prefix, suffix } = req.body;

		if (!prefix && !suffix) {
			return res.status(400).json({ error: "Context is required" });
		}

		const completion = await this.aiService.autocomplete(
			language || "text",
			prefix || "",
			suffix || "",
		);
		res.json({ completion });
	}
}

export default AiController;
