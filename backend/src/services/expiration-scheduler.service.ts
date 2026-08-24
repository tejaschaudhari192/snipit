import logger from "@/config/logger.js";
import pasteModel from "@/models/Paste.js";
import type PasteService from "./paste.service.js";

// Maximum 32-bit signed integer for setTimeout (~24.8 days)
const MAX_TIMEOUT_MS = 2147483647;

class ExpirationSchedulerService {
	private timers = new Map<string, NodeJS.Timeout>();
	private pasteService: PasteService | null = null;

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
				`⏰ Cron-less real-time expiration triggered for snippet ${pasteId}`,
			);
			await this.pasteService.deletePaste(pasteId);
		} catch (error) {
			logger.error(`Failed to auto-expire snippet ${pasteId}:`, error);
		}
	}

	/**
	 * Initializes the scheduler on server startup by queuing all near-term expiring pastes
	 */
	async init(service: PasteService) {
		this.setPasteService(service);

		try {
			const now = new Date();
			// Look for active snippets expiring in the next 24 hours
			const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

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
			logger.error("Failed to initialize expiration scheduler:", error);
		}
	}
}

export const expirationScheduler = new ExpirationSchedulerService();
export default expirationScheduler;
