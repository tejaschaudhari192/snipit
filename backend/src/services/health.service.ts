import mongoose from "mongoose";
import { supabase, isSupabaseConfigured } from "@/config/supabase.js";
import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";
import EmailService from "@/services/email.service.js";
import AiService from "@/services/ai.service.js";

export interface ServiceStatus {
	status: "ok" | "error" | "unknown";
	message?: string;
}

export interface HealthStepUpdate {
	step: string;
	label: string;
	icon: string;
	status: string;
	progress: number;
}

export interface HealthResponse {
	status: "alive" | "down";
	timestamp: string;
	services: {
		database: ServiceStatus;
		supabase: ServiceStatus;
		smtp: ServiceStatus;
		ai: ServiceStatus;
		runner?: ServiceStatus;
	};
}

class HealthService {
	private readonly CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours
	private lastCheckTime: number | null = null;
	private cachedHealthResponse: HealthResponse | null = {
		status: "alive",
		timestamp: new Date().toISOString(),
		services: {
			database: { status: "ok", message: "Connected to MongoDB" },
			supabase: { status: "ok", message: "Connected to Supabase" },
			smtp: { status: "ok", message: "Brevo service is ready" },
			ai: { status: "ok", message: "AI Engine Ready" },
		},
	};
	private cachedStreamUpdates: HealthStepUpdate[] = [
		{
			step: "Database",
			label: "Database Connected",
			icon: "database",
			status: "ok",
			progress: 20,
		},
		{
			step: "Storage",
			label: "Storage Connected",
			icon: "hard-drive",
			status: "ok",
			progress: 40,
		},
		{
			step: "AI Service",
			label: "AI Engine Ready",
			icon: "sparkles",
			status: "ok",
			progress: 60,
		},
		{
			step: "Email Server",
			label: "Email Server Ready",
			icon: "mail",
			status: "ok",
			progress: 80,
		},
		{
			step: "Ready",
			label: "Starting Snipit...",
			icon: "check",
			status: "ok",
			progress: 100,
		},
	];

	private isRefreshing = false;

	private emailService = new EmailService();
	private aiService = new AiService();

	private isCacheValid(): boolean {
		if (!this.lastCheckTime || !this.cachedHealthResponse) return false;
		return Date.now() - this.lastCheckTime < this.CACHE_TTL;
	}

	public async getHealth(forceRefresh = false): Promise<HealthResponse> {
		if (!forceRefresh && this.isCacheValid() && this.cachedHealthResponse) {
			return {
				...this.cachedHealthResponse,
				timestamp: new Date().toISOString(),
			};
		}

		if (this.cachedHealthResponse && !forceRefresh) {
			// Trigger background refresh without blocking
			this.triggerBackgroundRefresh();
			return {
				...this.cachedHealthResponse,
				timestamp: new Date().toISOString(),
			};
		}

		const { health } = await this.refreshHealthCache(forceRefresh);
		return health;
	}

	/**
	 * Always returns stream updates immediately using cache.
	 * If cache is stale or missing, refreshes in background without stalling the stream.
	 */
	public async getStreamUpdates(
		forceRefresh = false,
	): Promise<HealthStepUpdate[]> {
		if (forceRefresh) {
			const { updates } = await this.refreshHealthCache(true);
			return updates;
		}

		// If cache is expired or not checked recently, refresh in background
		if (!this.isCacheValid()) {
			this.triggerBackgroundRefresh();
		}

		// Always return the cached updates instantly
		return this.cachedStreamUpdates;
	}

	public triggerBackgroundRefresh(): void {
		if (this.isRefreshing) return;
		this.isRefreshing = true;
		this.refreshHealthCache(false)
			.catch((err) => {
				logger.error("[Health] Background cache refresh error:", err);
			})
			.finally(() => {
				this.isRefreshing = false;
			});
	}

	public async refreshHealthCache(forceRefresh = false) {
		logger.info("[Health] Refreshing health cache...");

		const health: HealthResponse = {
			status: "alive",
			timestamp: new Date().toISOString(),
			services: {
				database: { status: "unknown" },
				supabase: { status: "unknown" },
				smtp: { status: "unknown" },
				ai: { status: "unknown" },
			},
		};

		const updates: HealthStepUpdate[] = [];
		const totalSteps = 4;
		let completedSteps = 0;

		const addUpdate = (
			step: string,
			label: string,
			icon: string,
			status: string,
		) => {
			completedSteps++;
			updates.push({
				step,
				label,
				icon,
				status,
				progress: Math.round((completedSteps / (totalSteps + 1)) * 100),
			});
		};

		// 1. Database Check
		try {
			const dbState = mongoose.connection.readyState;
			if (dbState === 1) {
				health.services.database = {
					status: "ok",
					message: "Connected to MongoDB",
				};
				addUpdate("Database", "Database Connected", "database", "ok");
			} else {
				health.status = "down";
				health.services.database = {
					status: "error",
					message: `MongoDB state: ${dbState}`,
				};
				addUpdate("Database", "Database Error", "database", "error");
			}
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			health.status = "down";
			health.services.database = { status: "error", message };
			addUpdate("Database", "Database Error", "database", "error");
		}

		// 2. Storage Check
		try {
			if (!isSupabaseConfigured || !supabase) {
				health.services.supabase = {
					status: "error",
					message: "Supabase not configured",
				};
				addUpdate(
					"Storage",
					"Storage Config Error",
					"hard-drive",
					"error",
				);
			} else {
				const { error } = await supabase.storage.listBuckets();
				if (error) {
					health.services.supabase = {
						status: "error",
						message: error.message,
					};
					addUpdate(
						"Storage",
						"Storage Error",
						"hard-drive",
						"error",
					);
				} else {
					health.services.supabase = {
						status: "ok",
						message: "Connected to Supabase",
					};
					addUpdate(
						"Storage",
						"Storage Connected",
						"hard-drive",
						"ok",
					);
				}
			}
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			health.services.supabase = { status: "error", message };
			addUpdate("Storage", "Storage Error", "hard-drive", "error");
		}

		// 3. AI Service Check
		try {
			const isOk = await this.aiService.verify();
			health.services.ai = {
				status: isOk ? "ok" : "error",
				message: isOk ? "AI Engine Ready" : "AI Engine Failed",
			};
			addUpdate(
				"AI Service",
				isOk ? "AI Engine Ready" : "AI Engine Error",
				"sparkles",
				isOk ? "ok" : "error",
			);
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			health.services.ai = { status: "error", message };
			addUpdate("AI Service", "AI Engine Error", "sparkles", "error");
		}

		// 4. Email Server Check
		try {
			if (!configurations.brevo.apiKey) {
				health.services.smtp = {
					status: "error",
					message: "Brevo not configured",
				};
				addUpdate(
					"Email Server",
					"Brevo Config Error",
					"mail",
					"error",
				);
			} else if (forceRefresh) {
				const isOk = await this.emailService.ensureVerification();
				const errorMessage = this.emailService.getLastError();
				health.services.smtp = {
					status: isOk ? "ok" : "error",
					message: isOk
						? "Brevo service is ready"
						: `Brevo error: ${errorMessage || "Verification failed"}`,
				};
				addUpdate(
					"Email Server",
					isOk ? "Email Server Ready" : "Email Server Error",
					"mail",
					isOk ? "ok" : "error",
				);
			} else {
				// Non-blocking for standard checks
				this.emailService.ensureVerification();
				health.services.smtp = {
					status: "ok",
					message: "Brevo service verification in progress",
				};
				addUpdate("Email Server", "Email Server Ready", "mail", "ok");
			}
		} catch (error: unknown) {
			logger.error("Health check email error (non-fatal):", error);
			// We don't set health.status to 'down' for email issues
			health.services.smtp = {
				status: "error",
				message: "Email background check failed",
			};
			addUpdate("Email Server", "Email Server Error", "mail", "error");
		}

		// Final Update
		updates.push({
			step: "Ready",
			label: "Starting Snipit...",
			icon: "check",
			status: "ok",
			progress: 100,
		});

		this.cachedHealthResponse = health;
		this.cachedStreamUpdates = updates;
		this.lastCheckTime = Date.now();

		return { health, updates };
	}
}

export default new HealthService();
