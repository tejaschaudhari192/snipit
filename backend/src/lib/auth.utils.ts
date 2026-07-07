import type { Response } from "express";
import jwt from "jsonwebtoken";
import configurations from "@/config/configurations.js";

export const extractTokenFromRequest = (req: {
	headers: {
		authorization?: string | string[] | undefined;
		cookie?: string | undefined;
	};
	cookies?: { jwt?: string };
}): string | null => {
	const authHeader = req.headers.authorization;
	if (
		authHeader &&
		typeof authHeader === "string" &&
		authHeader.startsWith("Bearer")
	) {
		return authHeader.split(" ")[1] ?? null;
	} else if (req.cookies && req.cookies.jwt) {
		return req.cookies.jwt ?? null;
	} else if (req.headers.cookie) {
		const cookies = req.headers.cookie.split(";").reduce(
			(acc, cookieStr) => {
				const [key, val] = cookieStr.split("=").map((c) => c.trim());
				if (key && val) {
					acc[key] = val;
				}
				return acc;
			},
			{} as Record<string, string>,
		);
		return cookies.jwt ?? null;
	}
	return null;
};

export const generateToken = (id: string) => {
	return jwt.sign({ id }, configurations.jwt.secret, {
		expiresIn: configurations.jwt.expiry as
			`${number}d` | `${number}h` | `${number}m` | `${number}s`,
	});
};

export const getCookieOptions = () => {
	const isProduction = process.env.NODE_ENV === "production";
	return {
		httpOnly: true,
		secure: isProduction,
		sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
		maxAge: configurations.cookie.maxAge,
		path: "/",
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
	} catch {
		return null;
	}
};
