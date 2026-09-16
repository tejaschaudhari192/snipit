import type { Request, Response } from "express";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import type AuthService from "@/services/auth.service.js";
import {
	generateToken,
	setAuthCookie,
	clearAuthCookie,
} from "@/lib/auth.utils.js";
import EmailService from "@/services/email.service.js";
import sessionService from "@/services/session.service.js";
import logger from "@/config/logger.js";

class AuthController {
	private emailService = new EmailService();
	constructor(private readonly authService: AuthService) {}

	async registerUser(req: Request, res: Response) {
		try {
			const user = await this.authService.registerUser(req.body);
			res.status(201).json({
				_id: user._id,
				username: user.username,
				email: user.email,
				message: "User registered successfully",
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			if (message === "USER_ALREADY_EXISTS") {
				return res.status(400).json({ message: "User already exists" });
			}
			res.status(500).json({ message });
		}
	}

	async loginUser(req: Request, res: Response) {
		try {
			const user = await this.authService.loginUser(req.body);
			const session = await sessionService.createSession(
				user._id as string,
				req,
			);
			const token = generateToken(
				user._id as string,
				session._id.toString(),
			);
			setAuthCookie(res, token);

			// Trigger non-blocking login security notification email
			const userAgent = req.headers["user-agent"] || "";
			const ipAddress =
				req.ip ||
				req.headers["x-forwarded-for"] ||
				req.socket.remoteAddress ||
				"127.0.0.1";
			this.emailService
				.sendLoginNotificationEmail(
					user.email,
					user.username,
					userAgent as string,
					ipAddress as string,
				)
				.catch((err) =>
					logger.error(
						"Failed to send login notification email:",
						err,
					),
				);

			res.json({
				_id: user._id,
				username: user.username,
				email: user.email,
				token,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			if (message === "INVALID_CREDENTIALS") {
				return res
					.status(401)
					.json({ message: "Invalid email or password" });
			}
			res.status(500).json({ message });
		}
	}

	async logoutUser(req: Request, res: Response) {
		const authReq = req as AuthRequest;
		if (authReq.sessionId && authReq.user?._id) {
			await sessionService
				.revokeSession(authReq.user._id as string, authReq.sessionId)
				.catch(() => {});
		}
		clearAuthCookie(res);
		res.status(200).json({ message: "Logged out successfully" });
	}

	async getSessions(req: Request, res: Response) {
		const authReq = req as AuthRequest;
		if (!authReq.user || !authReq.sessionId) {
			return res.status(401).json({ message: "Not authorized" });
		}
		try {
			const sessions = await sessionService.getUserSessions(
				authReq.user._id as string,
				authReq.sessionId,
			);
			res.status(200).json({ sessions });
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			res.status(500).json({ message });
		}
	}

	async revokeSession(req: Request, res: Response) {
		const authReq = req as AuthRequest;
		if (!authReq.user || !authReq.sessionId) {
			return res.status(401).json({ message: "Not authorized" });
		}
		const sessionId = req.params.id as string;
		if (!sessionId) {
			return res.status(400).json({ message: "Session ID required" });
		}

		try {
			const success = await sessionService.revokeSession(
				authReq.user._id as string,
				sessionId,
			);
			if (!success) {
				return res.status(404).json({ message: "Session not found" });
			}

			// If revoking own current session, clear cookie
			if (authReq.sessionId === sessionId) {
				clearAuthCookie(res);
			}

			res.status(200).json({
				message: "Session revoked successfully",
				isCurrent: authReq.sessionId === sessionId,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			res.status(500).json({ message });
		}
	}

	async revokeAllOtherSessions(req: Request, res: Response) {
		const authReq = req as AuthRequest;
		if (!authReq.user || !authReq.sessionId) {
			return res.status(401).json({ message: "Not authorized" });
		}

		try {
			const count = await sessionService.revokeAllOtherSessions(
				authReq.user._id as string,
				authReq.sessionId,
			);
			res.status(200).json({
				message: `Logged out of ${count} other sessions successfully`,
				revokedCount: count,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			res.status(500).json({ message });
		}
	}

	async getMe(req: Request, res: Response) {
		const user = (req as AuthRequest).user;
		if (!user) return res.status(401).json({ message: "Not authorized" });
		res.status(200).json({
			_id: user._id,
			username: user.username,
			email: user.email,
			avatar: user.avatar,
		});
	}

	async updateMe(req: Request, res: Response) {
		const user = (req as AuthRequest).user;
		if (!user) return res.status(401).json({ message: "Not authorized" });

		try {
			const { username, avatar } = req.body;
			const updatedUser = await this.authService.updateUserProfile(
				user._id as string,
				{ username, avatar },
			);

			res.status(200).json({
				_id: updatedUser._id,
				username: updatedUser.username,
				email: updatedUser.email,
				avatar: updatedUser.avatar,
				message: "Profile updated successfully",
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			if (message === "USERNAME_ALREADY_EXISTS") {
				return res
					.status(400)
					.json({ message: "Username already exists" });
			}
			if (message === "USER_NOT_FOUND") {
				return res.status(404).json({ message: "User not found" });
			}
			res.status(500).json({ message });
		}
	}

	async forgotPassword(req: Request, res: Response) {
		try {
			await this.authService.forgotPassword(req.body.email);
			res.status(200).json({ success: true, data: "Email sent" });
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			const status = message === "USER_NOT_FOUND" ? 404 : 500;
			res.status(status).json({ message });
		}
	}

	async resetPassword(req: Request, res: Response) {
		try {
			const user = await this.authService.resetPassword(
				req.params.token as string,
				req.body.password,
			);
			const session = await sessionService.createSession(
				user._id as string,
				req,
			);
			const authToken = generateToken(
				user._id as string,
				session._id.toString(),
			);
			setAuthCookie(res, authToken);

			res.status(200).json({
				success: true,
				token: authToken,
				_id: user._id,
				username: user.username,
				email: user.email,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			res.status(400).json({ message });
		}
	}

	async googleLogin(req: Request, res: Response) {
		try {
			const user = await this.authService.googleLogin(req.body.idToken);
			const session = await sessionService.createSession(
				user._id as string,
				req,
			);
			const token = generateToken(
				user._id as string,
				session._id.toString(),
			);
			setAuthCookie(res, token);

			// Trigger non-blocking login security notification email
			const userAgent = req.headers["user-agent"] || "";
			const ipAddress =
				req.ip ||
				req.headers["x-forwarded-for"] ||
				req.socket.remoteAddress ||
				"127.0.0.1";
			this.emailService
				.sendLoginNotificationEmail(
					user.email,
					user.username,
					userAgent as string,
					ipAddress as string,
				)
				.catch((err) =>
					logger.error(
						"Failed to send login notification email:",
						err,
					),
				);

			res.json({
				_id: user._id,
				username: user.username,
				email: user.email,
				token,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : String(error);
			res.status(401).json({ message });
		}
	}
}

export default AuthController;
