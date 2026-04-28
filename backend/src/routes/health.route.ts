import logger from "@/config/logger.js";
import { Router } from "express";
import mongoose from "mongoose";
import { supabase, isSupabaseConfigured } from "@/config/supabase.js";
import EmailService from "@/services/email.service.js";
import configurations from "@/config/configurations.js";

const emailService = new EmailService();

const router: Router = Router();

router.get("/", async (req, res) => {
	logger.info("Checking System Health Status");

	const health: any = {
		status: "alive",
		timestamp: new Date().toISOString(),
		services: {
			database: {
				status: "unknown",
				message: "",
			},
			supabase: {
				status: "unknown",
				message: "",
			},
			smtp: {
				status: "unknown",
				message: "",
			},
		},
	};

	// 1. Check MongoDB
	try {
		const dbState = mongoose.connection.readyState;
		// 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
		if (dbState === 1) {
			health.services.database.status = "ok";
			health.services.database.message = "Connected to MongoDB";
		} else {
			health.status = "error";
			health.services.database.status = "error";
			health.services.database.message = `MongoDB state: ${dbState}`;
		}
	} catch (error: any) {
		health.status = "error";
		health.services.database.status = "error";
		health.services.database.message = error.message;
	}

	// 2. Check Supabase
	try {
		if (!isSupabaseConfigured || !supabase) {
			health.status = "error";
			health.services.supabase.status = "error";
			health.services.supabase.message = "Supabase not configured";
		} else {
			// Try a simple operation to verify connection
			const { error } = await supabase.storage.listBuckets();
			if (error) {
				health.status = "error";
				health.services.supabase.status = "error";
				health.services.supabase.message = error.message;
			} else {
				health.services.supabase.status = "ok";
				health.services.supabase.message = "Connected to Supabase";
			}
		}
	} catch (error: any) {
		health.status = "error";
		health.services.supabase.status = "error";
		health.services.supabase.message = error.message;
	}

	// 3. Check SMTP
	try {
		if (!configurations.smtp.user) {
			health.status = "error";
			health.services.smtp.status = "error";
			health.services.smtp.message = "SMTP not configured";
		} else {
			await emailService.verify();
			health.services.smtp.status = "ok";
			health.services.smtp.message = "SMTP service is ready";
		}
	} catch (error: any) {
		health.status = "error";
		health.services.smtp.status = "error";
		health.services.smtp.message = error.message;
	}

	const statusCode = health.status === "alive" ? 200 : 503;

	// Final status check: if any service is down, the overall status shouldn't be "alive"
	if (health.status === "error") {
		health.status = "down";
	}

	return res.status(statusCode).json(health);
});

export default router;
