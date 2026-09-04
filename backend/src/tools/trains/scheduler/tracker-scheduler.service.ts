import logger from "@/config/logger.js";
import { pnrTrackingService } from "../services/pnr-tracking.service.js";
import { TRACKER_CONFIG } from "../config/tracker.config.js";
import type { ITrackerSchedulerStats } from "./tracker-scheduler.types.js";

class TrackerSchedulerService {
	private timer: NodeJS.Timeout | null = null;
	private isProcessing = false;
	private stats: ITrackerSchedulerStats = {
		isRunning: false,
		lastProcessedCount: 0,
		totalErrors: 0,
	};

	/**
	 * Initialize the scheduler on server startup / cold wake-up
	 */
	public async init(): Promise<void> {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}

		this.stats.isRunning = true;
		logger.info(
			`🕒 PNR Tracker Scheduler initialized (Tick every ${TRACKER_CONFIG.SCHEDULER_TICK_INTERVAL_MS / 1000}s, per-PNR interval ${TRACKER_CONFIG.CHECK_INTERVAL_MS / (60 * 1000)}m)`,
		);

		// Start periodic interval loop
		this.timer = setInterval(() => {
			this.triggerSweep().catch((err) => {
				logger.error("Error during scheduled PNR tracking sweep:", err);
			});
		}, TRACKER_CONFIG.SCHEDULER_TICK_INTERVAL_MS);

		// Immediately trigger a catch-up sweep upon boot/wake-up for any overdue items
		setTimeout(() => {
			this.triggerSweep().catch((err) => {
				logger.error(
					"Error during startup PNR tracking catch-up sweep:",
					err,
				);
			});
		}, 3000);
	}

	/**
	 * Perform a single sweep to process any due PNRs
	 */
	public async triggerSweep(): Promise<{
		processed: number;
		changesDetected: number;
		errors: number;
	}> {
		if (this.isProcessing) {
			logger.info(
				"PNR Tracker sweep already in progress. Skipping duplicate tick.",
			);
			return { processed: 0, changesDetected: 0, errors: 0 };
		}

		this.isProcessing = true;
		try {
			const result = await pnrTrackingService.processDueTrackings();
			this.stats.lastSweepAt = new Date();
			this.stats.lastProcessedCount = result.processed;
			this.stats.totalErrors += result.errors;
			return result;
		} finally {
			this.isProcessing = false;
		}
	}

	/**
	 * Stop scheduler (for graceful shutdown)
	 */
	public stop(): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		this.stats.isRunning = false;
		logger.info("PNR Tracker Scheduler stopped.");
	}

	public getStats(): ITrackerSchedulerStats {
		return { ...this.stats };
	}
}

export const trackerScheduler = new TrackerSchedulerService();
export default trackerScheduler;
