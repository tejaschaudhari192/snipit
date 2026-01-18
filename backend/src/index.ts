import express, { type Request, type Response } from "express";

const app = express();

import { connectDB } from "@/config/db.js";
import pasteRouter from "@/routes/paste.route.js";
import healthRouter from "@/routes/health.route.js";
import aiRouter from "@/routes/ai.route.js";
import jobRouter from "@/routes/job.route.js";
import cors from "cors";
import logger from "@/config/logger.js";
import { ZodError } from "zod";
import configurations from "@/config/configurations.js";

connectDB();
const port = configurations.port;

app.set("trust proxy", 1); // Enable trust proxy for secure cookies behind reverse proxies

app.use(
	cors({
		origin: configurations.cors.origins,
		credentials: true,
		methods: "GET,POST,PUT,DELETE,OPTIONS",
		allowedHeaders: "Content-Type,Authorization",
	}),
);

app.get("/api", (req: Request, res: Response) => {
	res.send("Hello");
});

import cookieParser from "cookie-parser";
import authRouter from "@/routes/auth.routes.js";

app.use(express.json())
	.use(cookieParser())

	.use("/api/auth", authRouter)
	.use("/api/", pasteRouter)
	.use("/health/", healthRouter)
	.use("/api/", aiRouter)
	.use("/job", jobRouter);

app.use(
	(
		err: Error & {
			status?: number;
			statusCode?: number;
			issues?: unknown[];
			errors?: unknown[];
			name?: string;
		},
		req: Request,
		res: Response,
		_next: import("express").NextFunction,
	) => {
		// If headers already sent, delegate to default Express error handler
		if (res.headersSent) {
			return _next(err);
		}

		// Detailed logging for debugging
		const errorMessage = err?.message || "Internal Server Error";
		const errorStack = err?.stack || "";

		console.error(`[API Error] ${errorMessage}`);
		if (errorStack) console.error(errorStack);

		if (logger) {
			logger.error({ message: errorMessage, stack: errorStack });
		}

		// Handle Zod validation errors (status 400)
		if (err && (err.name === "ZodError" || err instanceof ZodError)) {
			const issues = (err.issues || err.errors || []) as {
				path: (string | number)[];
				message: string;
			}[];
			return res.status(400).json({
				error: "Validation failed",
				details: issues.map((e) => ({
					path: e.path,
					message: e.message,
				})),
			});
		}

		// Handle Mongoose validation errors (status 400)
		if (
			err &&
			(err.name === "ValidationError" || err.name === "CastError")
		) {
			return res.status(400).json({
				error: errorMessage,
			});
		}

		// Handle custom errors or default to 500
		const status = err?.status || err?.statusCode || 500;
		res.status(status).json({
			error: errorMessage,
		});
	},
);

app.listen(port, () => logger.info(`Listening on ${port}`));
