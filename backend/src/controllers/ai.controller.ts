import type { Request, Response } from "express";
import AiService from "@/services/ai.service.js";
import { catchAsync } from "@/lib/errors.js";

const aiService = new AiService();

export const detectLanguage = catchAsync(
	async (req: Request, res: Response) => {
		const { content } = req.body;

		if (!content) {
			return res.status(400).json({ error: "Content is required" });
		}

		const language = await aiService.detectLanguage(content);
		res.json({ language });
	},
);

export const enhanceContent = catchAsync(
	async (req: Request, res: Response) => {
		const { content, instruction } = req.body;

		if (!content || !instruction) {
			return res.status(400).json({
				error: "Content and instruction are required",
			});
		}

		const result = await aiService.enhanceContent(content, instruction);
		res.json({ result });
	},
);
