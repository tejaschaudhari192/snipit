import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import configurations from "@/config/configurations.js";
import pasteRouter from "@/routes/paste.route.js";
import healthRouter from "@/routes/health.route.js";
import aiRouter from "@/routes/ai.route.js";
import jobRouter from "@/routes/job.route.js";
import authRouter from "@/routes/auth.routes.js";
import { ZodError } from "zod";
import logger from "@/config/logger.js";

const app: express.Application = express();

app.use(
	cors({
		origin: configurations.cors.origins,
		credentials: true,
		methods: "GET,POST,PUT,DELETE,OPTIONS",
		allowedHeaders:
			"Content-Type,Authorization,X-Requested-With,Accept,Origin",
		optionsSuccessStatus: 200,
	}),
);

app.use(express.json());
app.use(cookieParser());

app.get("/api", (req: Request, res: Response) => {
	res.send("Hello");
});

app.use("/api/auth", authRouter);
app.use("/api/", pasteRouter);
app.use("/health/", healthRouter);
app.use("/api/", aiRouter);
app.use("/job", jobRouter);

// Error Handler
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
	if (res.headersSent) {
		return _next(err);
	}

	const error = err as any; // Localized cast for error properties
	const errorMessage = error?.message || "Internal Server Error";
	const errorStack = error?.stack || "";

	console.error(`[API Error] ${errorMessage}`);
	if (errorStack) console.error(errorStack);

	if (logger) {
		logger.error({ message: errorMessage, stack: errorStack });
	}

	if (err instanceof ZodError) {
		return res.status(400).json({
			error: "Validation failed",
			details: err.issues.map((e) => ({
				path: e.path,
				message: e.message,
			})),
		});
	}

	if (
		error &&
		(error.name === "ValidationError" || error.name === "CastError")
	) {
		return res.status(400).json({
			error: errorMessage,
		});
	}

	const status = error?.status || error?.statusCode || 500;
	res.status(status).json({
		error: errorMessage,
	});
});

export default app;
