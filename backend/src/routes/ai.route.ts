import express from "express";
import multer from "multer";
import os from "os";
import path from "path";
import AiController from "@/controllers/ai.controller.js";
import AiService from "@/services/ai.service.js";
import { catchAsync } from "@/lib/errors.js";

const router: express.Router = express.Router();

// Configure multer for temporary storage
const upload = multer({ dest: path.join(os.tmpdir(), "snipit-uploads") });

const aiService = new AiService();
const aiController = new AiController(aiService);

router.post(
	"/detect-language",
	catchAsync(aiController.detectLanguage.bind(aiController)),
);
router.post(
	"/detect-speech-language",
	catchAsync(aiController.detectSpeechLanguage.bind(aiController)),
);
router.post(
	"/enhance",
	catchAsync(aiController.enhanceContent.bind(aiController)),
);
router.post(
	"/autocomplete",
	catchAsync(aiController.autocomplete.bind(aiController)),
);
router.post(
	"/draw",
	catchAsync(aiController.generateDrawContent.bind(aiController)),
);
router.post(
	"/transcribe",
	upload.single("audio"),
	catchAsync(aiController.transcribeAudio.bind(aiController)),
);
router.post(
	"/prepare-speech",
	catchAsync(aiController.prepareSpeech.bind(aiController)),
);
router.post("/tts", catchAsync(aiController.tts.bind(aiController)));
router.post(
	"/suggest-id",
	catchAsync(aiController.suggestId.bind(aiController)),
);

export default router;
