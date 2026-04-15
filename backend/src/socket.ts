import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import configurations, {
	ADJECTIVES,
	ANIMALS,
	COLLABORATOR_COLORS,
} from "@/config/configurations.js";
import type { ActiveUser } from "@/types/index.js";
import PasteService from "@/services/paste.service.js";
import UserModel from "@/models/User.js";
import {
	getUserIdFromToken,
	extractTokenFromRequest,
} from "@/lib/auth.utils.js";

const pasteService = new PasteService();
const activeUsers = new Map<string, ActiveUser & { pasteId: string }>();

// Helpers
const getSocketUserId = (socket: Socket): string | null => {
	const req = socket.request;
	const token = extractTokenFromRequest(req as any);
	return token ? getUserIdFromToken(token) : null;
};

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

export const setupSocket = (server: HTTPServer) => {
	const io = new SocketIOServer(server, {
		cors: {
			origin: configurations.cors.origins,
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		},
	});

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

		socket.on("join-paste", async ({ pasteId, userName }) => {
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
		});

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

		socket.on("draw-update", async (data) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== data.pasteId) return;

			const userId = getSocketUserId(socket);
			const allowed = await canUserEdit(data.pasteId, userId);

			if (allowed) {
				socket
					.to(data.pasteId)
					.emit("draw-update", { ...data, socketId: socket.id });
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

	return io;
};
