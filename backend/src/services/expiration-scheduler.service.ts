import logger from "@/config/logger.js";
import pasteModel from "@/models/Paste.js";
import type PasteService from "./paste.service.js";

// Maximum 32-bit signed integer for setTimeout (~24.8 days)
const MAX_TIMEOUT_MS = 2147483647;
// 24 hours in milliseconds for daily cleanup interval
const DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000;

class ExpirationSchedulerService {
	private timers = new Map<string, NodeJS.Timeout>();
	private dailyTimer: NodeJS.Timeout | null = null;
	private pasteService: PasteService | null = null;
	private isCleaning = false;

	/**
	 * Sets the PasteService reference for execution
	 */
	setPasteService(service: PasteService) {
		this.pasteService = service;
	}

	/**
	 * Schedules real-time deletion for an expiring snippet
	 */
	schedule(pasteId: string, expiresAt: Date | null) {
		this.cancel(pasteId);

		if (!expiresAt) return;

		const expiryDate = new Date(expiresAt);
		const delayMs = expiryDate.getTime() - Date.now();

		if (delayMs <= 0) {
			// Already expired: trigger deletion immediately
			this.triggerDeletion(pasteId);
			return;
		}

		// Only schedule in-memory timers for tasks within MAX_TIMEOUT_MS
		if (delayMs <= MAX_TIMEOUT_MS) {
			const timer = setTimeout(() => {
				this.timers.delete(pasteId);
				this.triggerDeletion(pasteId);
			}, delayMs);

			this.timers.set(pasteId, timer);
		}
	}

	/**
	 * Cancels any active timer for a snippet
	 */
	cancel(pasteId: string) {
		const existingTimer = this.timers.get(pasteId);
		if (existingTimer) {
			clearTimeout(existingTimer);
			this.timers.delete(pasteId);
		}
	}

	/**
	 * Triggers document deletion and Supabase file cleanup
	 */
	private async triggerDeletion(pasteId: string) {
		if (!this.pasteService) {
			logger.warn(
				`Expiration trigger skipped for ${pasteId}: PasteService not set`,
			);
			return;
		}

		try {
			logger.info(
				`⏰ Real-time expiration triggered for snippet ${pasteId}`,
			);
			await this.pasteService.deletePaste(pasteId);
		} catch (error) {
			logger.error(`Failed to auto-expire snippet ${pasteId}:`, error);
		}
	}

	/**
	 * Independent cleanup sweep: finds all expired pastes and purges them
	 * along with their storage files and collaborators.
	 */
	async triggerDailyCleanupSweep(): Promise<{
		processed: number;
		errors: number;
	}> {
		if (this.isCleaning) {
			logger.info(
				"Daily cleanup sweep already in progress. Skipping duplicate run.",
			);
			return { processed: 0, errors: 0 };
		}

		if (!this.pasteService) {
			logger.warn("Daily cleanup sweep skipped: PasteService not set");
			return { processed: 0, errors: 0 };
		}

		this.isCleaning = true;
		let processed = 0;
		let errors = 0;

		try {
			const now = new Date();
			// Find all pastes where expiresAt is non-null and <= now
			const expiredPastes = await pasteModel
				.find({
					expiresAt: { $ne: null, $lte: now },
				})
				.select("id")
				.lean()
				.exec();

			if (expiredPastes.length > 0) {
				logger.info(
					`🧹 Found ${expiredPastes.length} expired pastes to clean up in daily sweep`,
				);

				for (const paste of expiredPastes) {
					try {
						this.cancel(paste.id);
						await this.pasteService.deletePaste(paste.id);
						processed++;
					} catch (err) {
						logger.error(
							`Error deleting expired paste ${paste.id} during daily sweep:`,
							err,
						);
						errors++;
					}
				}
			}

			logger.info(
				`✅ Daily cleanup sweep completed: ${processed} purged, ${errors} errors`,
			);
			return { processed, errors };
		} catch (error) {
			logger.error("Error during daily cleanup sweep:", error);
			return { processed, errors: errors + 1 };
		} finally {
			this.isCleaning = false;
		}
	}

	/**
	 * Initializes the scheduler on server startup:
	 * 1. Sets PasteService
	 * 2. Queues near-term active timers (expiring in next 24h)
	 * 3. Schedules initial catch-up sweep 3 seconds after boot
	 * 4. Starts periodic 24-hour background cleanup interval
	 */
	async init(service: PasteService) {
		this.setPasteService(service);

		// Stop any existing daily timer
		if (this.dailyTimer) {
			clearInterval(this.dailyTimer);
			this.dailyTimer = null;
		}

		try {
			const now = new Date();
			const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

			// Look for active snippets expiring in the next 24 hours
			const expiringPastes = await pasteModel
				.find({
					expiresAt: { $gt: now, $lte: horizon },
				})
				.select("id expiresAt")
				.exec();

			for (const paste of expiringPastes) {
				if (paste.id && paste.expiresAt) {
					this.schedule(paste.id, paste.expiresAt);
				}
			}

			logger.info(
				`✅ Expiration scheduler initialized: ${expiringPastes.length} active timers queued`,
			);
		} catch (error) {
			logger.error(
				"Failed to initialize expiration scheduler timers:",
				error,
			);
		}

		// Initial catch-up sweep 3 seconds after startup to purge any overdue items
		setTimeout(() => {
			this.triggerDailyCleanupSweep().catch((err) => {
				logger.error(
					"Error during startup expired paste catch-up sweep:",
					err,
				);
			});
		}, 3000);

		// Periodic daily cleanup interval loop (24 hours)
		this.dailyTimer = setInterval(() => {
			this.triggerDailyCleanupSweep().catch((err) => {
				logger.error(
					"Error during scheduled daily cleanup sweep:",
					err,
				);
			});
		}, DAILY_INTERVAL_MS);

		// Unref so this timer doesn't prevent Node process from exiting if needed
		if (this.dailyTimer && typeof this.dailyTimer.unref === "function") {
			this.dailyTimer.unref();
		}
	}

	/**
	 * Stops all active timers (for graceful shutdown or tests)
	 */
	stop() {
		for (const timer of this.timers.values()) {
			clearTimeout(timer);
		}
		this.timers.clear();

		if (this.dailyTimer) {
			clearInterval(this.dailyTimer);
			this.dailyTimer = null;
		}
	}
}

export const expirationScheduler = new ExpirationSchedulerService();
export default expirationScheduler;
