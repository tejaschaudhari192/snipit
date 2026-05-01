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
}

export default AiController;
