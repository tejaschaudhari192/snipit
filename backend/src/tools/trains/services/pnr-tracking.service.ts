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
import type { PnrData } from "../types/trains.types.js";
import type { Types, HydratedDocument } from "mongoose";

const emailService = new EmailService();

export class PnrTrackingService {
	/**
	 * Subscribe a logged-in user to hourly PNR status updates
	 */
	public async subscribe(
		userId: Types.ObjectId | string,
		userEmail: string,
		pnr: string,
	): Promise<{ tracking: HydratedDocument<IPnrTracking>; isNew: boolean }> {
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

			// Send notification email to user AND all subscribed alert recipients
			if (tracking.notifyEmail) {
				const pnrUrl = `${configurations.domain}/tools/trains?pnr=${tracking.pnr}`;
				const recipientEmails = Array.from(
					new Set([
						tracking.userEmail,
						...(tracking.alertRecipients || []),
					]),
				).filter(Boolean);

				await Promise.allSettled(
					recipientEmails.map(async (recipientEmail) => {
						try {
							await emailService.sendPnrStatusUpdateEmail(
								recipientEmail,
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
						} catch (emailErr) {
							logger.error(
								`Failed to send PNR status update to recipient ${recipientEmail} for PNR ${tracking.pnr}:`,
								emailErr,
							);
						}
					}),
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

	/**
	 * Share PNR ticket via email with one or more recipients,
	 * and optionally register them for automated status change alerts.
	 */
	public async shareTicket(
		userId: Types.ObjectId | string | undefined,
		senderEmail: string | undefined,
		senderName: string | undefined,
		pnr: string,
		payload: {
			recipients: string[];
			note?: string | undefined;
			subscribeAlerts: boolean;
			ticketData?: PnrData | undefined;
		},
	): Promise<{
		success: boolean;
		sentCount: number;
		recipients: string[];
		alertsSubscribed: boolean;
	}> {
		const cleanPnr = pnr.trim();
		if (!/^\d{10}$/.test(cleanPnr)) {
			throw new Error("Invalid PNR number: must be exactly 10 digits");
		}

		const cleanRecipients = Array.from(
			new Set(
				(payload.recipients || [])
					.map((r) => r.trim().toLowerCase())
					.filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r)),
			),
		);

		if (cleanRecipients.length === 0) {
			throw new Error("At least one valid recipient email is required");
		}

		// 1. Get or fetch ticket details for email
		let ticket: PnrData | undefined = payload.ticketData;
		if (!ticket || !ticket.train) {
			ticket = await pnrService.fetchPnrStatus(cleanPnr);
		}

		if (!ticket) {
			throw new Error("Unable to retrieve ticket details for sharing");
		}

		const pnrUrl = `${configurations.domain}/tools/trains?pnr=${cleanPnr}`;

		// 2. Dispatch immediate ticket share emails via Brevo
		const emailPromises = cleanRecipients.map((toEmail) =>
			emailService.sendPnrTicketShareEmail(toEmail, {
				pnr: cleanPnr,
				trainName: ticket.train || "Train",
				trainNumber: ticket.trainNumber || "",
				travelClass: ticket.class || "",
				from: ticket.from || "",
				fromCode: ticket.fromCode,
				to: ticket.to || "",
				toCode: ticket.toCode,
				departureDate: ticket.departureDate || ticket.date || "",
				departureTime: ticket.departure || "",
				arrivalDate: ticket.arrivalDate || ticket.date || "",
				arrivalTime: ticket.arrival || "",
				passengers: ticket.passengers || [],
				senderName,
				senderEmail,
				note: payload.note,
				alertsSubscribed: payload.subscribeAlerts,
				pnrUrl,
			}),
		);

		await Promise.allSettled(emailPromises);

		// 3. Associate with tracking and record share history if user is authenticated
		let alertsSubscribed = false;
		if (userId || senderEmail) {
			let tracking: HydratedDocument<IPnrTracking> | null = userId
				? await PnrTracking.findOne({ userId, pnr: cleanPnr })
				: null;

			if (!tracking && userId && senderEmail) {
				const snapshot: IPnrStatusSnapshot =
					PnrDiffService.createSnapshot(ticket);
				const nextCheckAt = new Date(
					Date.now() + TRACKER_CONFIG.CHECK_INTERVAL_MS,
				);

				try {
					tracking = await PnrTracking.create({
						userId,
						userEmail: senderEmail,
						pnr: cleanPnr,
						trainNumber: ticket.trainNumber || "",
						trainName: ticket.train || "Train",
						from: ticket.from || "",
						fromCode: ticket.fromCode,
						to: ticket.to || "",
						toCode: ticket.toCode,
						departureDate:
							ticket.departureDate || ticket.date || "",
						lastStatus: snapshot,
						statusHistory: [
							{
								timestamp: new Date(),
								changeSummary: payload.subscribeAlerts
									? "Tracking and sharing started"
									: "Ticket shared",
								changes: [
									payload.subscribeAlerts
										? "Subscription activated via share"
										: "Ticket details shared with companions",
								],
								newStatus: snapshot,
							},
						],
						isActive: Boolean(payload.subscribeAlerts),
						notifyEmail: Boolean(payload.subscribeAlerts),
						alertRecipients: payload.subscribeAlerts
							? cleanRecipients
							: [],
						sharedWith: [],
						lastCheckedAt: new Date(),
						nextCheckAt,
					});
				} catch (err: unknown) {
					const mongoErr = err as { code?: number };
					if (mongoErr && mongoErr.code === 11000) {
						tracking = await PnrTracking.findOne({
							userId,
							pnr: cleanPnr,
						});
					} else {
						logger.warn(
							`Failed to create tracking record during share: ${err}`,
						);
					}
				}
			}

			if (tracking) {
				// Record or update shared recipients history
				const currentSharedWith = tracking.sharedWith || [];
				const now = new Date();

				for (const email of cleanRecipients) {
					const existingIdx = currentSharedWith.findIndex(
						(s) => s.email.toLowerCase() === email.toLowerCase(),
					);
					if (existingIdx >= 0) {
						currentSharedWith[existingIdx] = {
							email,
							sharedAt: now,
							alertsSubscribed: Boolean(
								payload.subscribeAlerts ||
								currentSharedWith[existingIdx]
									?.alertsSubscribed,
							),
							note:
								payload.note ||
								currentSharedWith[existingIdx]?.note,
						};
					} else {
						currentSharedWith.push({
							email,
							sharedAt: now,
							alertsSubscribed: Boolean(payload.subscribeAlerts),
							note: payload.note,
						});
					}
				}
				tracking.sharedWith = currentSharedWith;

				if (payload.subscribeAlerts) {
					const existingRecipients = new Set(
						tracking.alertRecipients || [],
					);
					for (const email of cleanRecipients) {
						existingRecipients.add(email);
					}
					tracking.alertRecipients = Array.from(existingRecipients);
					tracking.isActive = true;
					tracking.notifyEmail = true;
					alertsSubscribed = true;
				}

				await tracking.save();
			}
		}

		return {
			success: true,
			sentCount: cleanRecipients.length,
			recipients: cleanRecipients,
			alertsSubscribed,
		};
	}

	/**
	 * Retrieve currently subscribed alert recipients and share history for a PNR
	 */
	public async getTrackingRecipients(
		userId: Types.ObjectId | string,
		pnr: string,
	): Promise<{
		pnr: string;
		recipients: string[];
		sharedWith: Array<{
			email: string;
			sharedAt: Date;
			alertsSubscribed: boolean;
			note?: string | undefined;
		}>;
		isTrackingActive: boolean;
	}> {
		const cleanPnr = pnr.trim();
		const tracking = await PnrTracking.findOne({ userId, pnr: cleanPnr });
		const recipients = tracking?.alertRecipients || [];
		const sharedWith = [...(tracking?.sharedWith || [])];

		// Backwards compatibility: If emails were saved in alertRecipients previously, ensure they appear in sharedWith
		if (tracking && recipients.length > 0) {
			let needsSave = false;
			for (const email of recipients) {
				const exists = sharedWith.some(
					(s) => s.email.toLowerCase() === email.toLowerCase(),
				);
				if (!exists) {
					const backfillRecord = {
						email,
						sharedAt: tracking.createdAt || new Date(),
						alertsSubscribed: true,
					};
					sharedWith.push(backfillRecord);
					if (!tracking.sharedWith) tracking.sharedWith = [];
					tracking.sharedWith.push(backfillRecord);
					needsSave = true;
				}
			}
			if (needsSave) {
				await tracking.save();
			}
		}

		return {
			pnr: cleanPnr,
			recipients,
			sharedWith,
			isTrackingActive: Boolean(tracking?.isActive),
		};
	}

	/**
	 * Remove a recipient from PNR tracking alerts
	 */
	public async removeTrackingRecipient(
		userId: Types.ObjectId | string,
		pnr: string,
		emailToRemove: string,
	): Promise<{
		success: boolean;
		remainingRecipients: string[];
		sharedWith: Array<{
			email: string;
			sharedAt: Date;
			alertsSubscribed: boolean;
			note?: string | undefined;
		}>;
	}> {
		const cleanPnr = pnr.trim();
		const cleanEmail = emailToRemove.trim().toLowerCase();
		const tracking = await PnrTracking.findOne({ userId, pnr: cleanPnr });
		if (!tracking) {
			return { success: false, remainingRecipients: [], sharedWith: [] };
		}

		tracking.alertRecipients = (tracking.alertRecipients || []).filter(
			(e) => e.toLowerCase() !== cleanEmail,
		);

		if (tracking.sharedWith) {
			tracking.sharedWith = tracking.sharedWith.map((item) => {
				if (item.email.toLowerCase() === cleanEmail) {
					return {
						email: item.email,
						sharedAt: item.sharedAt,
						alertsSubscribed: false,
						note: item.note,
					};
				}
				return item;
			});
		}

		await tracking.save();
		return {
			success: true,
			remainingRecipients: tracking.alertRecipients,
			sharedWith: tracking.sharedWith || [],
		};
	}
}

export const pnrTrackingService = new PnrTrackingService();
export default pnrTrackingService;
