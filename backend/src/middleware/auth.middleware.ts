import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "@/models/User.js";
import type { IUser } from "@/types/index.js";

export interface AuthRequest extends Request {
	user?: IUser | null;
}

export const protect = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			token = req.headers.authorization.split(" ")[1];
			if (!token) {
				res.status(401).json({ message: "Not authorized, no token" });
				return;
			}
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "default_secret",
			) as { id: string };

			req.user = await User.findById(decoded.id).select("-password");
			next();
		} catch (error) {
			console.error(error);
			res.status(401).json({ message: "Not authorized, token failed" });
		}
	} else if (req.cookies && req.cookies.jwt) {
		// Check for cookie
		try {
			token = req.cookies.jwt;
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "default_secret",
			) as { id: string };
			req.user = await User.findById(decoded.id).select("-password");
			next();
		} catch (error) {
			console.error(error);
			res.status(401).json({ message: "Not authorized, token failed" });
		}
	} else {
		res.status(401).json({ message: "Not authorized, no token" });
	}
};
