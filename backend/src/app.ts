import express, { type Request, type Response } from "express";
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

const app = express();

app.set("trust proxy", 1);

app.use(
	cors({
		origin: configurations.cors.origins,
		credentials: true,
		methods: "GET,POST,PUT,DELETE,OPTIONS",
		allowedHeaders: "Content-Type,Authorization",
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
app.use(
	(
		err: any,
		req: Request,
		res: Response,
		_next: import("express").NextFunction,
	) => {
		if (res.headersSent) {
			return _next(err);
		}

		const errorMessage = err?.message || "Internal Server Error";
		const errorStack = err?.stack || "";

		console.error(`[API Error] ${errorMessage}`);
		if (errorStack) console.error(errorStack);

		if (logger) {
			logger.error({ message: errorMessage, stack: errorStack });
		}

		if (err && (err.name === "ZodError" || err instanceof ZodError)) {
			const issues = (err.issues || err.errors || []) as any[];
			return res.status(400).json({
				error: "Validation failed",
				details: issues.map((e) => ({
					path: e.path,
					message: e.message,
				})),
			});
		}

		if (
			err &&
			(err.name === "ValidationError" || err.name === "CastError")
		) {
			return res.status(400).json({
				error: errorMessage,
			});
		}

		const status = err?.status || err?.statusCode || 500;
		res.status(status).json({
			error: errorMessage,
		});
	},
);

export default app;
