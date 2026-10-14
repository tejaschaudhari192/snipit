import { Router } from "express";

export const healthRouter = Router();

// Root / Hello endpoint for simple ping / cron job keep-alive
healthRouter.get(["/", "/hello"], (_req, res) => {
	res.json({
		message: "Hello from Snipit Code Runner!",
		service: "snipit-runner",
		status: "healthy",
		timestamp: new Date().toISOString(),
	});
});

// Detailed health endpoint for splash screen & system monitoring
healthRouter.get("/health", (_req, res) => {
	const memoryUsage = process.memoryUsage();
	res.json({
		status: "ok",
		service: "snipit-runner",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		system: {
			nodeVersion: process.version,
			platform: process.platform,
			memory: {
				rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
				heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
			},
		},
	});
});

export default healthRouter;
