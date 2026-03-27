import express, { type Request, type Response } from "express";

const app = express();

import { connectDB } from "@/config/db.js";
import pasteRouter from "@/routes/paste.route.js";
import healthRouter from "@/routes/health.route.js";
import aiRouter from "@/routes/ai.route.js";
import jobRouter from "@/routes/job.route.js";
import cors from "cors";
import logger from "@/config/logger.js";
import { ZodError } from "zod";
import configurations, {
	ADJECTIVES,
	ANIMALS,
	COLLABORATOR_COLORS,
} from "@/config/configurations.js";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import type { ActiveUser } from "@/types/index.js";

import PasteService from "@/services/paste.service.js";
import {
	getUserIdFromToken,
	extractTokenFromRequest,
} from "@/lib/auth.utils.js";
import UserModel from "@/models/User.js";

connectDB();
const port = configurations.port;
const pasteService = new PasteService();

app.set("trust proxy", 1); // Enable trust proxy for secure cookies behind reverse proxies

const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: configurations.cors.origins,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	},
});

const activeUsers = new Map<string, ActiveUser & { pasteId: string }>();

// Helper to get userId from socket request cookies
const getSocketUserId = (socket: any): string | null => {
	const req = socket.request;
	const token = extractTokenFromRequest(req);
	return token ? getUserIdFromToken(token) : null;
};

// Helper to check if user can edit
const canUserEdit = async (
	pasteId: string,
	userId: string | null,
): Promise<boolean> => {
	const paste = await pasteService.getPasteById(pasteId);
	if (!paste) return false;

	let userEmail = null;
	if (userId) {
		const user = await UserModel.findById(userId);
		if (user) userEmail = user.email;
	}

	const isOwner = paste.owner && userId && paste.owner.toString() === userId;
	const isAnonymousOwner = !paste.owner;

	if (isOwner || isAnonymousOwner) return true;

	if (paste.shareList && userEmail) {
		const shareEntry = (paste.shareList as any).find(
			(s: any) => s.email === userEmail,
		);
		if (
			shareEntry &&
			(shareEntry.role === "editor" || shareEntry.role === "admin")
		)
			return true;
	}

	if (
		paste.allowedUsers &&
		userEmail &&
		paste.allowedUsers.includes(userEmail)
	)
		return true;
	if (paste.editPermission === "public") return true;

	return false;
};

// Helper to check if user can view
const canUserView = async (
	pasteId: string,
	userId: string | null,
): Promise<boolean> => {
	const paste = await pasteService.getPasteById(pasteId);
	if (!paste) return false;
	if (paste.visibility === "public") return true;

	let userEmail = null;
	if (userId) {
		const user = await UserModel.findById(userId);
		if (user) userEmail = user.email;
	}

	const isOwner = paste.owner && userId && paste.owner.toString() === userId;
	const isAllowed =
		paste.allowedUsers &&
		userEmail &&
		paste.allowedUsers.includes(userEmail);

	let hasShareListAccess = false;
	if (paste.shareList && userEmail) {
		const shareEntry = (paste.shareList as any).find(
			(s: any) => s.email === userEmail,
		);
		if (shareEntry) hasShareListAccess = true;
	}

	return !!(isOwner || isAllowed || hasShareListAccess);
};

io.on("connection", (socket) => {
	const userColor =
		COLLABORATOR_COLORS[
			Math.floor(Math.random() * COLLABORATOR_COLORS.length)
		] || "#ef4444";
	const userName = `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)] || "Anonymous"} ${ANIMALS[Math.floor(Math.random() * ANIMALS.length)] || "Panda"}`;

	activeUsers.set(socket.id, {
		socketId: socket.id,
		name: userName,
		color: userColor,
		isEditing: false,
		pasteId: "",
	});

	const broadcastRoomUsers = (pasteId: string) => {
		const roomUsers = Array.from(activeUsers.values()).filter(
			(u) => u.pasteId === pasteId,
		);
		io.to(pasteId).emit("room-users", roomUsers);
	};

	socket.on(
		"join-paste",
		async ({
			pasteId,
			userName,
		}: {
			pasteId: string;
			userName?: string;
		}) => {
			const userId = getSocketUserId(socket);
			const allowed = await canUserView(pasteId, userId);

			if (!allowed) {
				socket.emit("error", {
					message: "Access denied or paste not found",
				});
				return;
			}

			const user = activeUsers.get(socket.id);
			if (user) {
				user.pasteId = pasteId;
				user.isEditing = false;
				if (userName) user.name = userName;
				socket.join(pasteId);
				broadcastRoomUsers(pasteId);
			}
		},
	);

	socket.on("set-editing-status", async ({ pasteId, isEditing }) => {
		const user = activeUsers.get(socket.id);
		if (!user || user.pasteId !== pasteId) return;

		const userId = getSocketUserId(socket);
		const allowed = await canUserEdit(pasteId, userId);

		if (!allowed) {
			socket.emit("error", { message: "Editing not permitted" });
			return;
		}

		user.isEditing = isEditing;
		broadcastRoomUsers(pasteId);
	});

	socket.on("leave-paste", (pasteId) => {
		const user = activeUsers.get(socket.id);
		if (user && user.pasteId === pasteId) {
			user.pasteId = "";
			user.isEditing = false;
			socket.leave(pasteId);
			broadcastRoomUsers(pasteId);
		}
	});

	socket.on("edit-paste", async (data) => {
		const user = activeUsers.get(socket.id);
		if (!user || user.pasteId !== data.pasteId) return;

		const userId = getSocketUserId(socket);
		const allowed = await canUserEdit(data.pasteId, userId);

		if (allowed) {
			socket
				.to(data.pasteId)
				.emit("paste-updated", { ...data, socketId: socket.id });
		}
	});

	socket.on("cursor-move", async ({ pasteId, position }) => {
		const user = activeUsers.get(socket.id);
		if (!user || user.pasteId !== pasteId) return;

		const userId = getSocketUserId(socket);
		const allowed = await canUserEdit(pasteId, userId);

		if (allowed) {
			socket.to(pasteId).emit("user-cursor-move", {
				socketId: socket.id,
				position,
			});
		}
	});

	socket.on("disconnect", () => {
		const user = activeUsers.get(socket.id);
		if (user && user.pasteId) {
			const pasteId = user.pasteId;
			activeUsers.delete(socket.id);
			broadcastRoomUsers(pasteId);
		} else {
			activeUsers.delete(socket.id);
		}
	});
});

app.use(
	cors({
		origin: configurations.cors.origins,
		credentials: true,
		methods: "GET,POST,PUT,DELETE,OPTIONS",
		allowedHeaders: "Content-Type,Authorization",
	}),
);

app.get("/api", (req: Request, res: Response) => {
	res.send("Hello");
});

import cookieParser from "cookie-parser";
import authRouter from "@/routes/auth.routes.js";

app.use(express.json())
	.use(cookieParser())

	.use("/api/auth", authRouter)
	.use("/api/", pasteRouter)
	.use("/health/", healthRouter)
	.use("/api/", aiRouter)
	.use("/job", jobRouter);

app.use(
	(
		err: Error & {
			status?: number;
			statusCode?: number;
			issues?: unknown[];
			errors?: unknown[];
			name?: string;
		},
		req: Request,
		res: Response,
		_next: import("express").NextFunction,
	) => {
		// If headers already sent, delegate to default Express error handler
		if (res.headersSent) {
			return _next(err);
		}

		// Detailed logging for debugging
		const errorMessage = err?.message || "Internal Server Error";
		const errorStack = err?.stack || "";

		console.error(`[API Error] ${errorMessage}`);
		if (errorStack) console.error(errorStack);

		if (logger) {
			logger.error({ message: errorMessage, stack: errorStack });
		}

		// Handle Zod validation errors (status 400)
		if (err && (err.name === "ZodError" || err instanceof ZodError)) {
			const issues = (err.issues || err.errors || []) as {
				path: (string | number)[];
				message: string;
			}[];
			return res.status(400).json({
				error: "Validation failed",
				details: issues.map((e) => ({
					path: e.path,
					message: e.message,
				})),
			});
		}

		// Handle Mongoose validation errors (status 400)
		if (
			err &&
			(err.name === "ValidationError" || err.name === "CastError")
		) {
			return res.status(400).json({
				error: errorMessage,
			});
		}

		// Handle custom errors or default to 500
		const status = err?.status || err?.statusCode || 500;
		res.status(status).json({
			error: errorMessage,
		});
	},
);

server.listen(port, () => logger.info(`Listening on ${port}`));
