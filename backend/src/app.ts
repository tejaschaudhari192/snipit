import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import configurations from "@/config/configurations.js";
import apiRouter from "@/routes/index.js";
import { connectDB } from "@/config/db.js";

import morgan from "morgan";
import logger from "@/config/logger.js";
import { errorMiddleware } from "@/middleware/error.middleware.js";

const app: express.Application = express();

// HTTP Request Logger
app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms", {
		stream: {
			write: (message) => logger.info(message.trim()),
		},
	}),
);

// Ensure DB is connected before any request
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
	try {
		await connectDB();
		next();
	} catch (error) {
		next(error);
	}
});

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
	res.send("Snipit API v1");
});

app.use("/api/v1", apiRouter);

// Error Handler
app.use(errorMiddleware);

export default app;
