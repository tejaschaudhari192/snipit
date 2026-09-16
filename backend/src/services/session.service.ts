import type { Request } from "express";
import Session, { type ISession } from "@/models/Session.js";
import logger from "@/config/logger.js";

export interface SessionDeviceInfo {
	deviceType: "desktop" | "mobile" | "tablet";
	deviceName: string;
	browser: string;
	os: string;
	ipAddress: string;
}

export function parseRequestDeviceInfo(req: Request): SessionDeviceInfo {
	const ua = (req.headers["user-agent"] as string) || "";
	let deviceType: "desktop" | "mobile" | "tablet";
	let deviceName: string;
	let browser = "Unknown Browser";
	let os: string;

	// Device Type & OS
	if (/ipad|tablet/i.test(ua)) {
		deviceType = "tablet";
		deviceName = /ipad/i.test(ua) ? "Apple iPad" : "Android Tablet";
		os = /ipad/i.test(ua) ? "iPadOS" : "Android";
	} else if (/mobi|iphone|android/i.test(ua)) {
		deviceType = "mobile";
		deviceName = /iphone/i.test(ua) ? "Apple iPhone" : "Android Smartphone";
		os = /iphone/i.test(ua) ? "iOS" : "Android";
	} else {
		deviceType = "desktop";
		if (/macintosh|mac os x/i.test(ua)) {
			deviceName = "Apple Mac";
			os = "macOS";
		} else if (/windows nt 10/i.test(ua)) {
			deviceName = "Windows PC";
			os = "Windows 10/11";
		} else if (/windows/i.test(ua)) {
			deviceName = "Windows PC";
			os = "Windows";
		} else if (/linux/i.test(ua)) {
			deviceName = "Linux PC";
			os = "Linux";
		} else {
			deviceName = "Desktop Computer";
			os = "Desktop OS";
		}
	}

	// Browser Detection
	if (/edg\//i.test(ua)) {
		browser = "Microsoft Edge";
	} else if (/opr\/|opera/i.test(ua)) {
		browser = "Opera";
	} else if (/chrome|crios/i.test(ua)) {
		browser = "Google Chrome";
	} else if (/firefox|fxios/i.test(ua)) {
		browser = "Mozilla Firefox";
	} else if (/safari/i.test(ua)) {
		browser = "Apple Safari";
	}

	// Normalize IP Address
	const ipAddress =
		(req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
		req.ip ||
		req.socket.remoteAddress ||
		"127.0.0.1";

	return {
		deviceType,
		deviceName,
		browser,
		os,
		ipAddress: ipAddress === "::1" ? "127.0.0.1" : ipAddress,
	};
}

export interface SessionDTO {
	_id: string;
	deviceName: string;
	browser: string;
	os: string;
	deviceType: "desktop" | "mobile" | "tablet";
	ipAddress: string;
	lastActive: Date;
	expiresAt: Date;
	createdAt: Date;
	isCurrent: boolean;
}

class SessionService {
	async createSession(userId: string, req: Request): Promise<ISession> {
		const deviceInfo = parseRequestDeviceInfo(req);
		const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 Days

		const session = await Session.create({
			userId,
			...deviceInfo,
			lastActive: new Date(),
			expiresAt,
		});

		logger.info(
			`Created 15-day session ${session._id} for user ${userId} (${deviceInfo.browser} on ${deviceInfo.os})`,
		);
		return session;
	}

	async getUserSessions(
		userId: string,
		currentSessionId: string,
	): Promise<SessionDTO[]> {
		const sessions = await Session.find({ userId })
			.sort({ lastActive: -1 })
			.lean();

		return sessions.map((sess) => ({
			_id: sess._id.toString(),
			deviceName: sess.deviceName,
			browser: sess.browser,
			os: sess.os,
			deviceType: sess.deviceType,
			ipAddress: sess.ipAddress,
			lastActive: sess.lastActive,
			expiresAt: sess.expiresAt,
			createdAt: sess.createdAt,
			isCurrent: sess._id.toString() === currentSessionId,
		}));
	}

	async revokeSession(userId: string, sessionId: string): Promise<boolean> {
		const result = await Session.deleteOne({ _id: sessionId, userId });
		return result.deletedCount > 0;
	}

	async revokeAllOtherSessions(
		userId: string,
		currentSessionId: string,
	): Promise<number> {
		const result = await Session.deleteMany({
			userId,
			_id: { $ne: currentSessionId },
		});
		return result.deletedCount || 0;
	}

	async touchSession(sessionId: string): Promise<void> {
		try {
			await Session.updateOne(
				{ _id: sessionId },
				{ $set: { lastActive: new Date() } },
			);
		} catch (error) {
			logger.error(
				`Error updating lastActive for session ${sessionId}:`,
				error,
			);
		}
	}
}

export default new SessionService();
