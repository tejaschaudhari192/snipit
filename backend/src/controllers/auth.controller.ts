import type { Request, Response } from "express";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import type AuthService from "@/services/auth.service.js";
import {
	generateToken,
	setAuthCookie,
	clearAuthCookie,
} from "@/lib/auth.utils.js";
import User from "@/models/User.js";
import EmailService from "@/services/email.service.js";
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
			const token = generateToken(user._id as string);
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

	async logoutUser(_req: Request, res: Response) {
		clearAuthCookie(res);
		res.status(200).json({ message: "Logged out successfully" });
	}

	async getMe(req: Request, res: Response) {
		const user = (req as AuthRequest).user;
		if (!user) return res.status(401).json({ message: "Not authorized" });
		res.status(200).json({
			_id: user._id,
			username: user.username,
			email: user.email,
		});
	}

	async updateMe(req: Request, res: Response) {
		const user = (req as AuthRequest).user;
		if (!user) return res.status(401).json({ message: "Not authorized" });

		const { username } = req.body;
		if (username) {
			const userExists = await User.findOne({ username });
			if (
				userExists &&
				userExists._id.toString() !== user._id.toString()
			) {
				return res
					.status(400)
					.json({ message: "Username already exists" });
			}
			user.username = username;
		}

		await user.save();
		res.status(200).json({
			_id: user._id,
			username: user.username,
			email: user.email,
			message: "Profile updated successfully",
		});
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
			const authToken = generateToken(user._id as string);
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
			const token = generateToken(user._id as string);
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
