import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import logger from "@/config/logger.js";
import { AppError } from "@/lib/errors.js";

export const errorMiddleware = (
	err: any,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (res.headersSent) {
		return _next(err);
	}

	const statusCode = err.statusCode || err.status || 500;
	const message = err.message || "Internal Server Error";

	// Log error
	if (statusCode >= 500) {
		logger.error({
			message,
			stack: err.stack,
			path: req.path,
			method: req.method,
		});
	} else {
		logger.warn({
			message,
			path: req.path,
			method: req.method,
		});
	}

	// Handle Zod Validation Errors
	if (err instanceof ZodError) {
		return res.status(400).json({
			error: "Validation failed",
			details: err.issues.map((e) => ({
				path: e.path,
				message: e.message,
			})),
		});
	}

	// Handle Mongoose Errors
	if (err.name === "ValidationError") {
		return res.status(400).json({
			error: message,
		});
	}

	if (err.name === "CastError") {
		return res.status(400).json({
			error: `Invalid ${err.path}: ${err.value}`,
		});
	}

	// Handle JWT Errors
	if (err.name === "JsonWebTokenError") {
		return res.status(401).json({
			error: "Invalid token. Please log in again.",
		});
	}

	if (err.name === "TokenExpiredError") {
		return res.status(401).json({
			error: "Your token has expired. Please log in again.",
		});
	}

	// Default Response
	res.status(statusCode).json({
		error: message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};
