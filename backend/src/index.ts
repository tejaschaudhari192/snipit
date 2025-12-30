import express, { type Request, type Response } from "express";
const app = express();
import { connectDB } from "@/config/db.js";
import pasteRouter from "@/routes/paste.route.js";
import healthRouter from "@/routes/health.route.js";
import aiRouter from "@/routes/ai.route.js";
import cors from "cors";
import logger from "@/config/logger.js";
import { ZodError } from "zod";

connectDB();
const port = process.env.PORT;

app.use(
  cors({
    origin: [
      "https://cpaste.vercel.app",
      "https://snipit-nu.vercel.app",
      "http://localhost:5173",
      "http://192.168.0.2:5173",
    ],
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  }),
);

app.get("/api", (req: Request, res: Response) => {
  res.send("Hello");
});

app
  .use(express.json())
  .use("/api/", pasteRouter)
  .use("/health/", healthRouter)
  .use("/api/", aiRouter);

app.use(
  (
    err: any,
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
      const issues = err.issues || err.errors || [];
      return res.status(400).json({
        error: "Validation failed",
        details: issues.map((e: any) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }

    // Handle Mongoose validation errors (status 400)
    if (err && (err.name === "ValidationError" || err.name === "CastError")) {
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
