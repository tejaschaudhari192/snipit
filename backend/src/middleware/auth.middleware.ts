import type { Request, Response, NextFunction } from "express";
import User from "@/models/User.js";
import Session from "@/models/Session.js";
import type { IUser } from "@/types/index.js";
import {
	extractTokenFromRequest,
	verifyTokenPayload,
	getUserIdFromToken,
} from "@/lib/auth.utils.js";
import sessionService from "@/services/session.service.js";

export interface AuthRequest extends Request {
	user?: IUser | null;
	sessionId?: string;
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
		const payload = verifyTokenPayload(token);
		if (!payload) {
			res.status(401).json({ message: "Not authorized, token failed" });
			return;
		}

		// Verify that the session is active in database
		const activeSession = await Session.findById(payload.sessionId);
		if (!activeSession) {
			res.status(401).json({
				message: "Session expired or revoked. Please log in again.",
				sessionRevoked: true,
			});
			return;
		}
		req.sessionId = payload.sessionId;
		// Debounced touch on session
		sessionService.touchSession(payload.sessionId).catch(() => {});

		const user = await User.findById(payload.id).select("-password");
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

export const optionalAuth = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	const token = extractTokenFromRequest(req);

	if (!token) {
		return next();
	}

	try {
		const decodedId = getUserIdFromToken(token);
		if (!decodedId) {
			return next();
		}

		const user = await User.findById(decodedId).select("-password").exec();

		if (user) {
			req.user = user;
		}

		next();
	} catch {
		// Even on error, we proceed as anonymous
		next();
	}
};
