import { Router } from "express";
import {
	subscribePnr,
	unsubscribePnr,
	getPnrTrackingStatus,
	getMyTrackings,
	cronTriggerSweep,
	sharePnrTicket,
	getPnrAlertRecipients,
	removePnrAlertRecipient,
} from "../controllers/pnr-tracking.controller.js";
import { protect, optionalProtect } from "@/middleware/auth.middleware.js";
import { catchAsync } from "@/lib/errors.js";

const router: Router = Router();

// Render Cron / External Webhook endpoint to trigger due checks (authorized via secret)
router.get("/cron-check", catchAsync(cronTriggerSweep));

// Ticket sharing (accessible to both logged-in and guest users; associates tracking if logged in)
router.post("/share", optionalProtect, catchAsync(sharePnrTicket));

// Authenticated user tracking & recipient management endpoints
router.post("/subscribe", protect, catchAsync(subscribePnr));
router.post("/unsubscribe", protect, catchAsync(unsubscribePnr));
router.get("/status/:pnr", protect, catchAsync(getPnrTrackingStatus));
router.get("/my-trackings", protect, catchAsync(getMyTrackings));
router.get("/recipients/:pnr", protect, catchAsync(getPnrAlertRecipients));
router.delete("/recipients/:pnr", protect, catchAsync(removePnrAlertRecipient));

export default router;
