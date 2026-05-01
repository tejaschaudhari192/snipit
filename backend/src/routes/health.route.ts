import logger from "@/config/logger.js";
import { Router } from "express";
import mongoose from "mongoose";
import { supabase, isSupabaseConfigured } from "@/config/supabase.js";
import EmailService from "@/services/email.service.js";
import AiService from "@/services/ai.service.js";
import configurations from "@/config/configurations.js";
import { catchAsync } from "@/lib/errors.js";

const emailService = new EmailService();
const aiService = new AiService();
const router: Router = Router();

interface ServiceStatus {
	status: "ok" | "error" | "unknown";
	message?: string;
}

interface HealthResponse {
	status: "alive" | "down";
	timestamp: string;
	services: {
		database: ServiceStatus;
		supabase: ServiceStatus;
		smtp: ServiceStatus;
	};
}

router.get(
	"/",
	catchAsync(async (req, res) => {
		logger.info("Checking System Health Status");

		const health: HealthResponse = {
			status: "alive",
			timestamp: new Date().toISOString(),
			services: {
				database: { status: "unknown" },
				supabase: { status: "unknown" },
				smtp: { status: "unknown" },
			},
		};

		// 1. Check MongoDB (Critical)
		try {
			const dbState = mongoose.connection.readyState;
			if (dbState === 1) {
				health.services.database = {
					status: "ok",
					message: "Connected to MongoDB",
				};
			} else {
				health.status = "down";
				health.services.database = {
					status: "error",
					message: `MongoDB state: ${dbState}`,
				};
			}
		} catch (error: any) {
			health.status = "down";
			health.services.database = {
				status: "error",
				message: error.message,
			};
		}

		// 2. Check Supabase (Non-Critical for health status)
		try {
			if (!isSupabaseConfigured || !supabase) {
				health.services.supabase = {
					status: "error",
					message: "Supabase not configured",
				};
			} else {
				const { error } = await supabase.storage.listBuckets();
				if (error) {
					health.services.supabase = {
						status: "error",
						message: error.message,
					};
				} else {
					health.services.supabase = {
						status: "ok",
						message: "Connected to Supabase",
					};
				}
			}
		} catch (error: any) {
			health.services.supabase = {
				status: "error",
				message: error.message,
			};
		}

		// 3. Check SMTP (Non-Critical for health status)
		try {
			if (!configurations.smtp.user) {
				health.services.smtp = {
					status: "error",
					message: "SMTP not configured",
				};
			} else {
				await emailService.verify();
				health.services.smtp = {
					status: "ok",
					message: "SMTP service is ready",
				};
			}
		} catch (error: any) {
			health.services.smtp = {
				status: "error",
				message: error.message,
			};
		}

		const statusCode = health.status === "alive" ? 200 : 503;
		return res.status(statusCode).json(health);
	}),
);

router.get("/stream", async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	const sendUpdate = (data: any) => {
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	};

	let completedSteps = 0;
	const totalSteps = 4;

	const performCheck = async (
		step: string,
		label: string,
		icon: string,
		checkFn: () => Promise<string>,
	) => {
		const status = await checkFn();
		completedSteps++;
		sendUpdate({
			step,
			label,
			icon,
			status,
			progress: Math.round((completedSteps / (totalSteps + 1)) * 100),
		});
		return status;
	};

	const checkDatabase = async () => {
		try {
			const dbState = mongoose.connection.readyState;
			return dbState === 1 ? "ok" : "error";
		} catch {
			return "error";
		}
	};

	const checkSupabase = async () => {
		try {
			if (!isSupabaseConfigured || !supabase) return "error";
			const { error } = await supabase.storage.listBuckets();
			return error ? "error" : "ok";
		} catch {
			return "error";
		}
	};

	const checkSMTP = async () => {
		try {
			if (!configurations.smtp.user) return "error";
			await emailService.verify();
			return "ok";
		} catch {
			return "error";
		}
	};

	const checkAI = async () => {
		try {
			const isOk = await aiService.verify();
			return isOk ? "ok" : "error";
		} catch {
			return "error";
		}
	};

	// Start all checks in parallel
	const checkPromises = [
		performCheck("Database", "Connecting to Database...", "database", checkDatabase),
		performCheck("Storage", "Checking Storage...", "hard-drive", checkSupabase),
		performCheck("Email Server", "Verifying Email Server...", "mail", checkSMTP),
		performCheck("AI Service", "Activating AI Engine...", "sparkles", checkAI),
	];

	const results = await Promise.all(checkPromises);

	// If database (the first check in the array) failed, we stop here
	if (results[0] === "error") {
		return res.end();
	}

	sendUpdate({
		step: "Ready",
		label: "Starting Snipit...",
		icon: "check",
		status: "ok",
		progress: 100,
	});

	res.end();
});

export default router;
