import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

type AsyncFunction = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<void | unknown>;

export const catchAsync = (fn: AsyncFunction) => {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
};
