import express from "express";
import AiController from "@/controllers/ai.controller.js";
import AiService from "@/services/ai.service.js";
import { catchAsync } from "@/lib/errors.js";

const router: express.Router = express.Router();

const aiService = new AiService();
const aiController = new AiController(aiService);

router.post(
	"/detect-language",
	catchAsync(aiController.detectLanguage.bind(aiController)),
);
router.post(
	"/enhance",
	catchAsync(aiController.enhanceContent.bind(aiController)),
);
router.post(
	"/autocomplete",
	catchAsync(aiController.autocomplete.bind(aiController)),
);

export default router;
