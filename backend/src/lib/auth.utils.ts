import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import configurations from "@/config/configurations.js";

export const extractTokenFromRequest = (req: Request): string | null => {
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		return req.headers.authorization.split(" ")[1] ?? null;
	} else if (req.cookies && req.cookies.jwt) {
		return req.cookies.jwt ?? null;
	}
	return null;
};

export const generateToken = (id: string) => {
	return jwt.sign({ id }, configurations.jwt.secret, {
		expiresIn: configurations.jwt.expiry as any,
	});
};

export const getCookieOptions = () => {
	const isProduction = process.env.NODE_ENV === "production";
	return {
		httpOnly: true,
		secure: isProduction,
		sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
		maxAge: configurations.cookie.maxAge,
	};
};

export const setAuthCookie = (res: Response, token: string) => {
	res.cookie("jwt", token, getCookieOptions());
};

export const clearAuthCookie = (res: Response) => {
	const options = getCookieOptions();
	res.cookie("jwt", "", {
		...options,
		expires: new Date(0),
		maxAge: 0,
	});
};

export const getUserIdFromToken = (token: string): string | null => {
	try {
		const decoded = jwt.verify(token, configurations.jwt.secret) as {
			id: string;
		};
		return decoded.id;
	} catch (error) {
		return null;
	}
};
