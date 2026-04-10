import express from "express";
import { detectLanguage, enhanceContent } from "@/controllers/ai.controller.js";

const router: express.Router = express.Router();

router.post("/detect-language", detectLanguage);
router.post("/enhance", enhanceContent);

export default router;
