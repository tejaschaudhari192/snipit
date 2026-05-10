import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import logger from "@/config/logger.js";
import { AppError } from "@/lib/errors.js";

interface MongooseCastError extends Error {
	path: string;
	value: string;
}

export const errorMiddleware = (
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const error =
		err instanceof Error
			? (err as AppError)
			: (new Error(String(err)) as AppError);
	if (res.headersSent) {
		return _next(err);
	}

	const statusCode = error.statusCode || 500;
	const message = error.message || "Internal Server Error";

	// Log error
	if (statusCode >= 500) {
		logger.error({
			message,
			stack: error.stack,
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
	if (error.name === "ValidationError") {
		return res.status(400).json({
			error: message,
		});
	}

	if (error.name === "CastError") {
		const castErr = error as unknown as MongooseCastError;
		return res.status(400).json({
			error: `Invalid ${castErr.path}: ${castErr.value}`,
		});
	}

	// Handle JWT Errors
	if (error.name === "JsonWebTokenError") {
		return res.status(401).json({
			error: "Invalid token. Please log in again.",
		});
	}

	if (error.name === "TokenExpiredError") {
		return res.status(401).json({
			error: "Your token has expired. Please log in again.",
		});
	}

	// Default Response
	res.status(statusCode).json({
		error: message,
		...(process.env.NODE_ENV === "development" && { stack: error.stack }),
	});
};
