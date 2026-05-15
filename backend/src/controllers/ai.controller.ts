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

		if (content === undefined || !instruction) {
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

	async generateDrawContent(req: Request, res: Response) {
		const { description } = req.body;

		if (!description) {
			return res.status(400).json({ error: "Description is required" });
		}

		const elements = await this.aiService.generateDrawContent(description);
		res.json({ elements });
	}

	async transcribeAudio(req: Request, res: Response) {
		if (!req.file) {
			return res.status(400).json({ error: "Audio file is required" });
		}

		const text = await this.aiService.transcribeAudio(
			req.file.path,
			req.file.originalname,
		);
		res.json({ text });
	}

	async prepareSpeech(req: Request, res: Response) {
		const { content, contentType } = req.body;

		if (!content) {
			return res.status(400).json({ error: "Content is required" });
		}

		const text = await this.aiService.prepareForSpeech(
			content,
			contentType || "text",
		);
		res.json({ text });
	}

	async suggestId(req: Request, res: Response) {
		const { content, files } = req.body;

		if (!content && (!files || files.length === 0)) {
			return res.status(400).json({
				error: "Content or files are required for ID suggestion",
			});
		}

		const id = await this.aiService.suggestId(content || "", files);
		res.json({ id });
	}
}

export default AiController;
