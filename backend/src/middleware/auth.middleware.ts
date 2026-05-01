import type { Request, Response, NextFunction } from "express";
import User from "@/models/User.js";
import type { IUser } from "@/types/index.js";
import {
	extractTokenFromRequest,
	getUserIdFromToken,
} from "@/lib/auth.utils.js";

export interface AuthRequest extends Request {
	user?: IUser | null;
}

export const protect = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	const token = extractTokenFromRequest(req);

	if (!token) {
		res.status(401).json({ message: "Not authorized, no token" });
		return;
	}

	try {
		const userId = getUserIdFromToken(token);
		if (!userId) {
			res.status(401).json({ message: "Not authorized, token failed" });
			return;
		}

		const user = await User.findById(userId).select("-password");
		if (!user) {
			res.status(401).json({ message: "Not authorized, user not found" });
			return;
		}

		req.user = user;
		next();
	} catch (error) {
		console.error(error);
		res.status(401).json({ message: "Not authorized, token failed" });
	}
};

export const optionalProtect = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	const token = extractTokenFromRequest(req);

	if (!token) {
		return next();
	}

	try {
		const userId = getUserIdFromToken(token);
		if (!userId) return next();

		const user = await User.findById(userId).select("-password");
		if (user) {
			req.user = user;
		}
		next();
	} catch {
		next();
	}
};
