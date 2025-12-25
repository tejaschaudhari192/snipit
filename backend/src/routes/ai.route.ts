import express from "express";
import { detectLanguage } from "@/controllers/ai.controller.js";

const router: express.Router = express.Router();

router.post("/detect-language", detectLanguage);

export default router;
