import { Router } from "express";
import {
	subscribePnr,
	unsubscribePnr,
	getPnrTrackingStatus,
	getMyTrackings,
	cronTriggerSweep,
} from "../controllers/pnr-tracking.controller.js";
import { protect } from "@/middleware/auth.middleware.js";
import { catchAsync } from "@/lib/errors.js";

const router: Router = Router();

// Render Cron / External Webhook endpoint to trigger due checks (authorized via secret)
router.get("/cron-check", catchAsync(cronTriggerSweep));

// Authenticated user tracking endpoints
router.post("/subscribe", protect, catchAsync(subscribePnr));
router.post("/unsubscribe", protect, catchAsync(unsubscribePnr));
router.get("/status/:pnr", protect, catchAsync(getPnrTrackingStatus));
router.get("/my-trackings", protect, catchAsync(getMyTrackings));

export default router;
