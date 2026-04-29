import logger from "@/config/logger.js";
import { Router } from "express";
import mongoose from "mongoose";
import { supabase, isSupabaseConfigured } from "@/config/supabase.js";
import EmailService from "@/services/email.service.js";
import configurations from "@/config/configurations.js";
import { catchAsync } from "@/lib/errors.js";

const emailService = new EmailService();
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

	let isDatabaseOk = true;

	// 1. Check MongoDB
	try {
		const dbState = mongoose.connection.readyState;
		if (dbState !== 1) {
			isDatabaseOk = false;
		}
	} catch (error: any) {
		isDatabaseOk = false;
	}

	sendUpdate({
		step: "Database",
		label: "Connecting to Database...",
		status: isDatabaseOk ? "ok" : "error",
		progress: 25,
	});

	if (!isDatabaseOk) return res.end();

	// 2. Check Supabase
	let supabaseStatus = "ok";
	try {
		if (!isSupabaseConfigured || !supabase) {
			supabaseStatus = "error";
		} else {
			const { error } = await supabase.storage.listBuckets();
			if (error) supabaseStatus = "error";
		}
	} catch (error: any) {
		supabaseStatus = "error";
	}

	sendUpdate({
		step: "Supabase",
		label: "Checking Supabase...",
		status: supabaseStatus,
		progress: 50,
	});

	// 3. Check SMTP
	let smtpStatus = "ok";
	try {
		if (!configurations.smtp.user) {
			smtpStatus = "error";
		} else {
			await emailService.verify();
		}
	} catch (error: any) {
		smtpStatus = "error";
	}

	sendUpdate({
		step: "SMTP",
		label: "Verifying Mail Server...",
		status: smtpStatus,
		progress: 75,
	});

	sendUpdate({
		step: "Ready",
		label: "Starting Snipit...",
		status: "ok",
		progress: 100,
	});

	res.end();
});

export default router;
