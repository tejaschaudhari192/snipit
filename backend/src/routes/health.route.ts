import logger from "@/config/logger.js";
import { Router } from "express";
import { catchAsync } from "@/lib/errors.js";
import healthService, {
	type HealthStepUpdate,
} from "@/services/health.service.js";

const router: Router = Router();

router.get(
	"/",
	catchAsync(async (req, res) => {
		const health = await healthService.getHealth();
		const statusCode = health.status === "alive" ? 200 : 503;
		return res.status(statusCode).json(health);
	}),
);

router.get("/stream", async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	const sendUpdate = (data: HealthStepUpdate) => {
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	};

	const updates = await healthService.getStreamUpdates();

	// Determine if updates are from cache (already completed) or fresh
	const isCached = updates.every(
		(u) => u.status === "ok" || u.status === "error",
	);

	for (const update of updates) {
		sendUpdate(update);
		// Small delay if streaming from cache for better UX
		if (isCached) {
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	}

	res.end();
});

export default router;
