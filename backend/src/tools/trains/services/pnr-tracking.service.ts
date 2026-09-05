import logger from "@/config/logger.js";
import configurations from "@/config/configurations.js";
import EmailService from "@/services/email.service.js";
import { pnrService } from "./trains.service.js";
import { PnrDiffService } from "./pnr-diff.service.js";
import { PnrTracking } from "../models/pnr-tracking.model.js";
import { TRACKER_CONFIG } from "../config/tracker.config.js";
import type {
	IPnrTracking,
	IPnrStatusSnapshot,
} from "../types/pnr-tracking.types.js";
import type { Types } from "mongoose";

const emailService = new EmailService();

export class PnrTrackingService {
	/**
	 * Subscribe a logged-in user to hourly PNR status updates
	 */
	public async subscribe(
		userId: Types.ObjectId | string,
		userEmail: string,
		pnr: string,
	): Promise<{ tracking: IPnrTracking; isNew: boolean }> {
		const cleanPnr = pnr.trim();
		if (!/^\d{10}$/.test(cleanPnr)) {
			throw new Error("Invalid PNR number: must be exactly 10 digits");
		}

		// 1. Fetch live PNR status snapshot from upstream provider
		const currentStatus = await pnrService.fetchPnrStatus(cleanPnr);
		if (!currentStatus || currentStatus.error) {
			throw new Error(
				currentStatus?.error ||
					"Failed to retrieve PNR details. Please check the PNR number.",
			);
		}

		const snapshot: IPnrStatusSnapshot =
			PnrDiffService.createSnapshot(currentStatus);

		const nextCheckAt = new Date(
			Date.now() + TRACKER_CONFIG.CHECK_INTERVAL_MS,
		);

		// 2. Upsert tracking record for this user and PNR
		const existing = await PnrTracking.findOne({
			userId,
			pnr: cleanPnr,
		});

		if (existing) {
			existing.isActive = true;
			existing.notifyEmail = true;
			existing.userEmail = userEmail;
			existing.lastStatus = snapshot;
			existing.nextCheckAt = nextCheckAt;
			existing.lastCheckedAt = new Date();
			existing.trainNumber =
				currentStatus.trainNumber || existing.trainNumber || "";
			existing.trainName =
				currentStatus.train || existing.trainName || "Train";
			existing.from = currentStatus.from || existing.from || "";
			existing.fromCode = currentStatus.fromCode || existing.fromCode;
			existing.to = currentStatus.to || existing.to || "";
			existing.toCode = currentStatus.toCode || existing.toCode;
			existing.departureDate =
				currentStatus.departureDate ||
				currentStatus.date ||
				existing.departureDate ||
				"";

			await existing.save();
			logger.info(
				`Re-activated PNR tracking for user ${userEmail}, PNR: ${cleanPnr}`,
			);
			return { tracking: existing, isNew: false };
		}

		try {
			const newTracking = await PnrTracking.create({
				userId,
				userEmail,
				pnr: cleanPnr,
				trainNumber: currentStatus.trainNumber || "",
				trainName: currentStatus.train || "Train",
				from: currentStatus.from || "",
				fromCode: currentStatus.fromCode,
				to: currentStatus.to || "",
				toCode: currentStatus.toCode,
				departureDate:
					currentStatus.departureDate || currentStatus.date || "",
				lastStatus: snapshot,
				statusHistory: [
					{
						timestamp: new Date(),
						changeSummary: "Tracking started",
						changes: ["Subscription activated"],
						newStatus: snapshot,
					},
				],
				isActive: true,
				notifyEmail: true,
				lastCheckedAt: new Date(),
				nextCheckAt,
			});

			logger.info(
				`Created new PNR tracking for user ${userEmail}, PNR: ${cleanPnr}`,
			);
			return { tracking: newTracking, isNew: true };
		} catch (err: unknown) {
			// Handle duplicate key race condition gracefully
			const mongoErr = err as { code?: number };
			if (mongoErr && mongoErr.code === 11000) {
				const fallback = await PnrTracking.findOne({
					userId,
					pnr: cleanPnr,
				});
				if (fallback) {
					fallback.isActive = true;
					await fallback.save();
					return { tracking: fallback, isNew: false };
				}
			}
			throw err;
		}
	}

	/**
	 * Unsubscribe / stop tracking a PNR
	 */
	public async unsubscribe(
		userId: Types.ObjectId | string,
		pnr: string,
	): Promise<boolean> {
		const cleanPnr = pnr.trim();
		const result = await PnrTracking.findOneAndUpdate(
			{ userId, pnr: cleanPnr },
			{ $set: { isActive: false } },
			{ new: true },
		);
		return Boolean(result);
	}

	/**
	 * Get current tracking state of a PNR for a specific user
	 */
	public async getTrackingStatus(
		userId: Types.ObjectId | string,
		pnr: string,
	): Promise<{
		isTracked: boolean;
		isTracking: boolean;
		tracking: IPnrTracking | null;
	}> {
		const cleanPnr = pnr.trim();
		const tracking = await PnrTracking.findOne({
			userId,
			pnr: cleanPnr,
			isActive: true,
		}).lean<IPnrTracking>();

		const isTracked = Boolean(tracking);
		return {
			isTracked,
			isTracking: isTracked,
			tracking: tracking || null,
		};
	}

	/**
	 * Get all tracked PNRs for a user
	 */
	public async getUserTrackings(
		userId: Types.ObjectId | string,
	): Promise<IPnrTracking[]> {
		return PnrTracking.find({ userId })
			.sort({ updatedAt: -1 })
			.lean<IPnrTracking[]>();
	}

	/**
	 * Process all subscriptions whose next check is due
	 * This is invoked by the background scheduler tick and by the Render cron ping
	 */
	public async processDueTrackings(): Promise<{
		processed: number;
		changesDetected: number;
		errors: number;
	}> {
		const now = new Date();

		// Find active records where nextCheckAt <= now
		const dueSubscriptions = await PnrTracking.find({
			isActive: true,
			nextCheckAt: { $lte: now },
		}).limit(50); // Cap batch to keep processing swift

		if (dueSubscriptions.length === 0) {
			return { processed: 0, changesDetected: 0, errors: 0 };
		}

		logger.info(
			`🚂 PNR Tracker: processing ${dueSubscriptions.length} overdue subscriptions`,
		);

		let processed = 0;
		let changesDetected = 0;
		let errors = 0;

		// Process in batches of BATCH_CONCURRENCY to balance throughput and rate limits
		const batchSize = TRACKER_CONFIG.BATCH_CONCURRENCY;
		for (let i = 0; i < dueSubscriptions.length; i += batchSize) {
			const batch = dueSubscriptions.slice(i, i + batchSize);

			await Promise.allSettled(
				batch.map(async (tracking) => {
					try {
						const hasChanged =
							await this.checkSingleSubscription(tracking);
						processed++;
						if (hasChanged) changesDetected++;
					} catch (err) {
						errors++;
						logger.error(
							`Error checking PNR ${tracking.pnr} for user ${tracking.userEmail}:`,
							err,
						);
						// Reschedule so a temporary error doesn't block future checks
						tracking.nextCheckAt = new Date(
							Date.now() + TRACKER_CONFIG.CHECK_INTERVAL_MS,
						);
						await tracking.save();
					}
				}),
			);
		}

		return { processed, changesDetected, errors };
	}

	/**
	 * Check a single PNR subscription and notify user if changed
	 */
	private async checkSingleSubscription(
		tracking: IPnrTracking,
	): Promise<boolean> {
		const liveData = await pnrService.fetchPnrStatus(tracking.pnr);
		if (!liveData || liveData.error) {
			logger.warn(
				`Skipping PNR check for ${tracking.pnr}: ${liveData?.error || "provider returned no data"}`,
			);
			tracking.nextCheckAt = new Date(
				Date.now() + TRACKER_CONFIG.CHECK_INTERVAL_MS,
			);
			await tracking.save();
			return false;
		}

		// 1. Detect changes
		const diff = PnrDiffService.diff(tracking.lastStatus, liveData);
		const newSnapshot = PnrDiffService.createSnapshot(liveData);

		if (diff.hasChanged) {
			logger.info(
				`🔔 PNR ${tracking.pnr} changed for ${tracking.userEmail}: ${diff.changeSummary}`,
			);

			// Append history
			tracking.statusHistory.unshift({
				timestamp: new Date(),
				changeSummary: diff.changeSummary,
				changes: diff.changes,
				previousStatus: tracking.lastStatus,
				newStatus: newSnapshot,
			});

			// Update snapshot
			tracking.lastStatus = newSnapshot;

			// Send notification email
			if (tracking.notifyEmail && tracking.userEmail) {
				const pnrUrl = `${configurations.domain}/tools/trains?pnr=${tracking.pnr}`;
				await emailService.sendPnrStatusUpdateEmail(
					tracking.userEmail,
					{
						pnr: tracking.pnr,
						trainName: tracking.trainName,
						trainNumber: tracking.trainNumber,
						from: tracking.from,
						to: tracking.to,
						departureDate: tracking.departureDate,
						changes: diff.changes,
						isConfirmed: diff.isConfirmed,
						isChartPrepared: diff.isChartPrepared,
						pnrUrl,
					},
				);
			}
		}

		// 2. Check if journey is already completed (>24h past departure date)
		if (tracking.departureDate) {
			const depDate = new Date(tracking.departureDate);
			if (!isNaN(depDate.getTime())) {
				const oneDayAfter = new Date(
					depDate.getTime() +
						TRACKER_CONFIG.MAX_DAYS_AFTER_JOURNEY *
							24 *
							60 *
							60 *
							1000,
				);
				if (Date.now() > oneDayAfter.getTime()) {
					tracking.isActive = false;
					logger.info(
						`Auto-deactivated tracking for completed journey on PNR ${tracking.pnr}`,
					);
				}
			}
		}

		// Update check timestamps
		tracking.lastCheckedAt = new Date();
		tracking.nextCheckAt = new Date(
			Date.now() + TRACKER_CONFIG.CHECK_INTERVAL_MS,
		);
		await tracking.save();

		return diff.hasChanged;
	}
}

export const pnrTrackingService = new PnrTrackingService();
export default pnrTrackingService;
