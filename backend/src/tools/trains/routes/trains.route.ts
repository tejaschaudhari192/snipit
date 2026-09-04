import { Router } from "express";
import {
	getPnrStatus,
	getTrainSchedule,
	searchTrainSuggestions,
	getTrainLiveStatus,
	getSearchTrainsBetweenStations,
	getTrainFareCalculation,
	getStationSuggestions,
} from "../controllers/trains.controller.js";
import { catchAsync } from "@/lib/errors.js";
import trackingRouter from "./pnr-tracking.route.js";

const router: Router = Router();

router.use("/tracking", trackingRouter);

router.get("/status", catchAsync(getPnrStatus));
router.get("/schedule", catchAsync(getTrainSchedule));
router.get("/search", catchAsync(searchTrainSuggestions));
router.get("/stations", catchAsync(getStationSuggestions));
router.get(
	"/search-between-stations",
	catchAsync(getSearchTrainsBetweenStations),
);
router.get("/fare", catchAsync(getTrainFareCalculation));
router.get("/live-status", catchAsync(getTrainLiveStatus));

export default router;
