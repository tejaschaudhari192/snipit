import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import FeedbackModel from "../models/Feedback.js";
import EmailService from "../services/email.service.js";
import configurations from "../config/configurations.js";
import logger from "../config/logger.js";

const emailService = new EmailService();

export const submitFeedback = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { type, title, description, userEmail } = req.body;

		// Optional: Extract userId if the user is authenticated
		const userId = (req as AuthRequest).user?._id;

		if (!type || !title || !description) {
			res.status(400).json({
				success: false,
				message: "Type, title, and description are required fields.",
			});
			return;
		}

		if (!["bug", "feature", "general"].includes(type)) {
			res.status(400).json({
				success: false,
				message: "Invalid feedback type.",
			});
			return;
		}

		// 1. Save to Database
		const feedback = new FeedbackModel({
			type,
			title,
			description,
			userEmail,
			userId,
		});

		await feedback.save();

		// 2. Send Email
		const adminEmail = configurations.adminEmail;

		// We send email asynchronously without blocking the response
		emailService
			.sendFeedbackEmail(
				adminEmail!,
				type,
				title,
				description,
				userEmail || "Anonymous",
			)
			.catch((err) => {
				logger.error(
					"Failed to send feedback email asynchronously",
					err,
				);
			});

		res.status(201).json({
			success: true,
			message: "Feedback submitted successfully.",
			data: feedback,
		});
	} catch (error) {
		logger.error("Error submitting feedback:", error);
		res.status(500).json({
			success: false,
			message: "An error occurred while submitting feedback.",
		});
	}
};
