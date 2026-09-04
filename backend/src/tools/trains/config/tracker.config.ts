import configurations from "@/config/configurations.js";

export const TRACKER_CONFIG = {
	// How often a specific PNR should be re-checked (1 hour = 60 minutes)
	CHECK_INTERVAL_MS: 60 * 60 * 1000,
	// Background scheduler loop tick interval while server is awake (5 minutes)
	SCHEDULER_TICK_INTERVAL_MS: 5 * 60 * 1000,
	// Maximum concurrent PNR checks when processing overdue subscriptions
	BATCH_CONCURRENCY: 3,
	// Maximum days after train journey date before subscription auto-deactivates
	MAX_DAYS_AFTER_JOURNEY: 1,
	// Secret key to authorize Render Cron / external wake-up pings
	JOB_SECRET: configurations.job_secret,
} as const;
