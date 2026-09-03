import { Router } from "express";
import {
	getPnrStatus,
	getTrainSchedule,
	searchTrainSuggestions,
	getTrainLiveStatus,
} from "../controllers/trains.controller.js";
import { catchAsync } from "@/lib/errors.js";

const router: Router = Router();

router.get("/status", catchAsync(getPnrStatus));
router.get("/schedule", catchAsync(getTrainSchedule));
router.get("/search", catchAsync(searchTrainSuggestions));
router.get("/live-status", catchAsync(getTrainLiveStatus));

export default router;
