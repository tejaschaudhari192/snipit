import type { Response, NextFunction } from "express";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import { pnrTrackingService } from "../services/pnr-tracking.service.js";
import { trackerScheduler } from "../scheduler/tracker-scheduler.service.js";
import { TRACKER_CONFIG } from "../config/tracker.config.js";

export async function subscribePnr(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		if (!req.user || !req.user._id) {
			res.status(401).json({ error: "User authentication required" });
			return;
		}

		const pnr = req.body.pnr ? String(req.body.pnr).trim() : "";
		if (!pnr || !/^\d{10}$/.test(pnr)) {
			res.status(400).json({
				error: "Valid 10-digit PNR number is required",
			});
			return;
		}

		const result = await pnrTrackingService.subscribe(
			req.user._id,
			req.user.email,
			pnr,
		);

		res.json({
			success: true,
			message: result.isNew
				? "Tracking enabled! You will be emailed hourly if your status changes."
				: "Tracking re-activated successfully.",
			tracking: result.tracking,
		});
	} catch (err) {
		next(err);
	}
}

export async function unsubscribePnr(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		if (!req.user || !req.user._id) {
			res.status(401).json({ error: "User authentication required" });
			return;
		}

		const pnr = req.body.pnr ? String(req.body.pnr).trim() : "";
		if (!pnr) {
			res.status(400).json({ error: "PNR number is required" });
			return;
		}

		const success = await pnrTrackingService.unsubscribe(req.user._id, pnr);

		res.json({
			success,
			message: success
				? "Stopped tracking PNR."
				: "Tracking record not found.",
		});
	} catch (err) {
		next(err);
	}
}

export async function getPnrTrackingStatus(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		if (!req.user || !req.user._id) {
			res.status(401).json({ error: "User authentication required" });
			return;
		}

		const pnr = req.params.pnr ? String(req.params.pnr).trim() : "";
		if (!pnr) {
			res.status(400).json({ error: "PNR number is required" });
			return;
		}

		const status = await pnrTrackingService.getTrackingStatus(
			req.user._id,
			pnr,
		);

		res.json(status);
	} catch (err) {
		next(err);
	}
}

export async function getMyTrackings(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		if (!req.user || !req.user._id) {
			res.status(401).json({ error: "User authentication required" });
			return;
		}

		const trackings = await pnrTrackingService.getUserTrackings(
			req.user._id,
		);

		res.json(trackings);
	} catch (err) {
		next(err);
	}
}

/**
 * Render Cron / External Webhook to wake up app and trigger due checks
 * Protected by secret token in query (?secret=...) or header (x-job-secret)
 */
export async function cronTriggerSweep(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const providedSecret =
			(req.query.secret as string) ||
			(req.headers["x-job-secret"] as string) ||
			(req.headers.authorization
				? req.headers.authorization.replace(/^Bearer\s+/i, "")
				: "");

		if (!providedSecret || providedSecret !== TRACKER_CONFIG.JOB_SECRET) {
			res.status(403).json({ error: "Unauthorized: Invalid job secret" });
			return;
		}

		const sweepResult = await trackerScheduler.triggerSweep();
		res.json({
			success: true,
			timestamp: new Date().toISOString(),
			sweepResult,
			schedulerStats: trackerScheduler.getStats(),
		});
	} catch (err) {
		next(err);
	}
}
