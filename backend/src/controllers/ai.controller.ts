import type { Request, Response } from "express";
import type AiService from "@/services/ai.service.js";

class AiController {
	constructor(private readonly aiService: AiService) {}

	async detectLanguage(req: Request, res: Response) {
		try {
			const { content } = req.body;
			if (!content) {
				return res.status(400).json({ error: "Content is required" });
			}

			const language = await this.aiService.detectLanguage(content);
			res.json({ language });
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to detect language";
			res.status(500).json({ error: message });
		}
	}

	async detectSpeechLanguage(req: Request, res: Response) {
		try {
			const { content } = req.body;
			if (!content) {
				return res.status(400).json({ error: "Content is required" });
			}

			const language = await this.aiService.detectSpeechLanguage(content);
			res.json({ language });
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to detect speech language";
			res.status(500).json({ error: message });
		}
	}

	async enhanceContent(req: Request, res: Response) {
		try {
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
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to enhance content";
			res.status(500).json({ error: message });
		}
	}

	async autocomplete(req: Request, res: Response) {
		try {
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
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to generate completion";
			res.status(500).json({ error: message });
		}
	}

	async generateDrawContent(req: Request, res: Response) {
		try {
			const { description } = req.body;
			if (!description) {
				return res
					.status(400)
					.json({ error: "Description is required" });
			}

			const elements =
				await this.aiService.generateDrawContent(description);
			res.json({ elements });
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to generate draw content";
			res.status(500).json({ error: message });
		}
	}

	async transcribeAudio(req: Request, res: Response) {
		try {
			if (!req.file) {
				return res
					.status(400)
					.json({ error: "Audio file is required" });
			}

			const text = await this.aiService.transcribeAudio(
				req.file.path,
				req.file.originalname,
			);
			res.json({ text });
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to transcribe audio";
			res.status(500).json({ error: message });
		}
	}

	async prepareSpeech(req: Request, res: Response) {
		try {
			const { content, contentType } = req.body;
			if (!content) {
				return res.status(400).json({ error: "Content is required" });
			}

			const text = await this.aiService.prepareForSpeech(
				content,
				contentType || "text",
			);
			res.json({ text });
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to prepare speech";
			res.status(500).json({ error: message });
		}
	}

	async suggestId(req: Request, res: Response) {
		try {
			const { content, files } = req.body;
			if (!content && (!files || files.length === 0)) {
				return res.status(400).json({
					error: "Content or files are required for ID suggestion",
				});
			}

			const id = await this.aiService.suggestId(content || "", files);
			res.json({ id });
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to suggest ID";
			res.status(500).json({ error: message });
		}
	}
}

export default AiController;
