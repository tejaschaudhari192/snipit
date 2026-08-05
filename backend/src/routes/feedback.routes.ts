import express, { Router, type RequestHandler } from "express";
import { submitFeedback } from "../controllers/feedback.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router: Router = express.Router();

// @route   POST /api/feedback
// @desc    Submit user feedback or bug report
// @access  Public (optional auth for tracking user)
router.post(
	"/",
	optionalAuth as RequestHandler,
	submitFeedback as RequestHandler,
);

export default router;
