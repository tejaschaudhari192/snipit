import type { Request, Response } from "express";
import User from "@/models/User.js";
import bcrypt from "bcryptjs";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import {
	generateToken,
	setAuthCookie,
	clearAuthCookie,
} from "@/lib/auth.utils.js";

const handleServerError = (res: Response, error: unknown) => {
	const message =
		error instanceof Error ? error.message : "An error occurred";
	res.status(500).json({ message });
};

export const registerUser = async (req: Request, res: Response) => {
	const { username, email, password } = req.body;

	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			res.status(400).json({ message: "User already exists" });
			return;
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = await User.create({
			username,
			email,
			password: hashedPassword,
		});

		if (user) {
			res.status(201).json({
				_id: user._id,
				username: user.username,
				email: user.email,
				message: "User registered successfully",
			});
		} else {
			res.status(400).json({ message: "Invalid user data" });
		}
	} catch (error: unknown) {
		handleServerError(res, error);
	}
};

export const loginUser = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });

		if (user && (await bcrypt.compare(password, user.password as string))) {
			const token = generateToken(user._id as string);
			setAuthCookie(res, token);

			res.json({
				_id: user._id,
				username: user.username,
				email: user.email,
				token,
			});
		} else {
			res.status(401).json({ message: "Invalid email or password" });
		}
	} catch (error: unknown) {
		handleServerError(res, error);
	}
};

export const logoutUser = async (req: Request, res: Response) => {
	clearAuthCookie(res);
	res.status(200).json({ message: "Logged out successfully" });
};

export const getMe = async (req: Request, res: Response) => {
	const user = (req as AuthRequest).user;
	if (!user) {
		res.status(401).json({ message: "Not authorized" });
		return;
	}
	res.status(200).json({
		_id: user._id,
		username: user.username,
		email: user.email,
	});
};

export const updateMe = async (req: Request, res: Response) => {
	const user = (req as AuthRequest).user;
	if (!user) {
		res.status(401).json({ message: "Not authorized" });
		return;
	}

	const { username } = req.body;

	try {
		if (username) {
			const userExists = await User.findOne({ username });
			if (
				userExists &&
				userExists._id.toString() !== user._id.toString()
			) {
				res.status(400).json({ message: "Username already exists" });
				return;
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
	} catch (error: unknown) {
		handleServerError(res, error);
	}
};
