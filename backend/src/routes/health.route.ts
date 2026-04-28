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

	if (health.status === "error") {
		health.status = "down";
	}

	return res.status(statusCode).json(health);
});

router.get("/stream", async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	const sendUpdate = (data: any) => {
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	};

	const health: any = {
		status: "alive",
		services: {},
	};

	// 1. Check MongoDB
	try {
		const dbState = mongoose.connection.readyState;
		if (dbState === 1) {
			health.services.Database = { status: "ok" };
		} else {
			health.status = "error";
			health.services.Database = { status: "error" };
		}
	} catch (error: any) {
		health.status = "error";
		health.services.Database = { status: "error" };
	}
	sendUpdate({
		step: "Database",
		label: "Connecting to Database...",
		status: health.services.Database.status,
		progress: 25,
	});

	if (health.status === "error") return res.end();

	// 2. Check Supabase
	try {
		if (!isSupabaseConfigured || !supabase) {
			health.status = "error";
			health.services.Supabase = { status: "error" };
		} else {
			const { error } = await supabase.storage.listBuckets();
			if (error) {
				health.status = "error";
				health.services.Supabase = { status: "error" };
			} else {
				health.services.Supabase = { status: "ok" };
			}
		}
	} catch (error: any) {
		health.status = "error";
		health.services.Supabase = { status: "error" };
	}
	sendUpdate({
		step: "Supabase",
		label: "Checking Supabase...",
		status: health.services.Supabase.status,
		progress: 50,
	});

	if (health.status === "error") return res.end();

	// 3. Check SMTP
	try {
		if (!configurations.smtp.user) {
			health.status = "error";
			health.services.SMTP = { status: "error" };
		} else {
			await emailService.verify();
			health.services.SMTP = { status: "ok" };
		}
	} catch (error: any) {
		health.status = "error";
		health.services.SMTP = { status: "error" };
	}
	sendUpdate({
		step: "SMTP",
		label: "Verifying Mail Server...",
		status: health.services.SMTP.status,
		progress: 75,
	});

	if (health.status === "error") return res.end();

	sendUpdate({
		step: "Ready",
		label: "Starting Snipit...",
		status: "ok",
		progress: 100,
	});

	res.end();
});

export default router;
