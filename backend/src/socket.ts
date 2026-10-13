import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import configurations from "@/config/configurations.js";
import {
	ADJECTIVES,
	ANIMALS,
	COLLABORATOR_COLORS,
} from "@/config/constants.js";
import type {
	ActiveUser,
	SharedMusicState,
	SharedVideoState,
} from "@/types/index.js";
import PasteService from "@/services/paste.service.js";
import PermissionService from "@/services/permission.service.js";
import {
	getUserIdFromToken,
	extractTokenFromRequest,
} from "@/lib/auth.utils.js";
import { handleCodeRunnerProxy } from "./socket/code-runner.proxy.js";

import {
	registerCinemaHandlers,
	broadcastCinemaUsers,
} from "./socket/cinema.handler.js";

const pasteService = new PasteService();
const permissionService = new PermissionService();
const activeUsers = new Map<
	string,
	ActiveUser & { pasteId: string; cinemaRoomId?: string }
>();
const roomContent = new Map<string, string>();
const sharedMusicState = new Map<string, SharedMusicState>();

const sharedVideoState = new Map<string, SharedVideoState>();
const cinemaRooms = new Map<
	string,
	{ hostSocketId: string; url: string; isP2pMode: boolean }
>();

// Helpers
const getSocketUserId = (socket: Socket): string | null => {
	const req = socket.request;
	const token = extractTokenFromRequest(req);
	return token ? getUserIdFromToken(token) : null;
};

const canUserEdit = async (
	pasteId: string,
	userId: string | null,
): Promise<boolean> => {
	try {
		const paste = await pasteService.getPasteById(pasteId);
		if (!paste) return false;
		return await permissionService.canEdit(userId, paste);
	} catch (error) {
		console.error("Socket: Error checking edit permissions", error);
		return false;
	}
};

const canUserView = async (
	pasteId: string,
	userId: string | null,
): Promise<boolean> => {
	try {
		const paste = await pasteService.getPasteById(pasteId);
		if (!paste) return false;
		return await permissionService.canView(userId, paste);
	} catch (error) {
		console.error("Socket: Error checking view permissions", error);
		return false;
	}
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
		const userId = getSocketUserId(socket);
		if (userId) {
			socket.join(userId);
		}

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
			isRecording: false,
			pasteId: "",
			cinemaRoomId: "",
		});

		const broadcastRoomUsers = (pasteId: string) => {
			const roomUsers = Array.from(activeUsers.values()).filter(
				(u) => u.pasteId === pasteId,
			);
			io.to(pasteId).emit("room-users", roomUsers);
		};

		registerCinemaHandlers(
			io,
			socket,
			activeUsers,
			cinemaRooms,
			sharedVideoState,
		);

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
				user.isRecording = false;
				if (userName) user.name = userName;
				socket.join(pasteId);

				// Send latest live content to new joiner
				const currentContent = roomContent.get(pasteId);
				if (currentContent !== undefined) {
					socket.emit("room-state", { content: currentContent });
				}

				// Send shared music state to new joiner if active
				const mState = sharedMusicState.get(pasteId);
				if (mState) {
					socket.emit("music:share-state", mState);
				}

				// Send shared video state to new joiner if active
				const vState = sharedVideoState.get(pasteId);
				if (vState) {
					let currentPos = vState.currentTime;
					if (vState.isPlaying) {
						const elapsed =
							(Date.now() - vState.lastSyncedAt) / 1000;
						currentPos += elapsed;
					}
					socket.emit("video-sync-state", {
						action: vState.isPlaying ? "play" : "pause",
						timestamp: currentPos,
						duration: vState.duration,
					});
				}

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

		socket.on("set-recording-status", async ({ pasteId, isRecording }) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== pasteId) return;

			const userId = getSocketUserId(socket);
			const allowed = await canUserEdit(pasteId, userId);

			if (!allowed) {
				socket.emit("error", {
					message: "Recording status update not permitted",
				});
				return;
			}

			user.isRecording = isRecording;
			broadcastRoomUsers(pasteId);
		});

		// Shared Music Events
		socket.on(
			"music:share-toggle",
			({
				pasteId,
				enabled,
				track,
				isPlaying,
				currentTime,
				playlist,
				region,
				shuffle,
				repeat,
			}) => {
				const user = activeUsers.get(socket.id);
				if (!user || user.pasteId !== pasteId) return;

				if (enabled) {
					const newState: SharedMusicState = {
						enabled: true,
						initiatorSocketId: socket.id,
						track: track || null,
						isPlaying: isPlaying || false,
						currentTime: currentTime || 0,
						lastSyncedAt: Date.now(),
						playlist: playlist || [],
						region: region || "default",
						shuffle: shuffle || false,
						repeat: repeat || "all",
					};
					sharedMusicState.set(pasteId, newState);
					io.to(pasteId).emit("music:share-state", newState);
				} else {
					sharedMusicState.delete(pasteId);
					io.to(pasteId).emit("music:share-state", {
						enabled: false,
					});
				}
			},
		);

		socket.on(
			"music:sync",
			({
				pasteId,
				track,
				isPlaying,
				currentTime,
				playlist,
				region,
				shuffle,
				repeat,
			}) => {
				const user = activeUsers.get(socket.id);
				if (!user || user.pasteId !== pasteId) return;

				const mState = sharedMusicState.get(pasteId);
				if (mState && mState.initiatorSocketId === socket.id) {
					mState.track = track;
					mState.isPlaying = isPlaying;
					mState.currentTime = currentTime;
					mState.playlist = playlist;
					mState.region = region;
					mState.shuffle = shuffle;
					mState.repeat = repeat;
					mState.lastSyncedAt = Date.now();

					socket.to(pasteId).emit("music:sync-update", {
						track,
						isPlaying,
						currentTime,
						playlist,
						region,
						shuffle,
						repeat,
						timestamp: mState.lastSyncedAt,
					});
				}
			},
		);

		socket.on("music:play", ({ pasteId, currentTime }) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== pasteId) return;

			const mState = sharedMusicState.get(pasteId);
			if (mState) {
				mState.isPlaying = true;
				if (currentTime !== undefined) mState.currentTime = currentTime;
				mState.lastSyncedAt = Date.now();

				socket.to(pasteId).emit("music:play-update", {
					currentTime: mState.currentTime,
				});
			}
		});

		socket.on("music:pause", ({ pasteId, currentTime }) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== pasteId) return;

			const mState = sharedMusicState.get(pasteId);
			if (mState) {
				mState.isPlaying = false;
				if (currentTime !== undefined) mState.currentTime = currentTime;
				mState.lastSyncedAt = Date.now();

				socket.to(pasteId).emit("music:pause-update", {
					currentTime: mState.currentTime,
				});
			}
		});

		socket.on("music:seek", ({ pasteId, currentTime }) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== pasteId) return;

			const mState = sharedMusicState.get(pasteId);
			if (mState) {
				mState.currentTime = currentTime;
				mState.lastSyncedAt = Date.now();

				socket.to(pasteId).emit("music:seek-update", {
					currentTime,
				});
			}
		});

		socket.on("music:volume", ({ pasteId, volume }) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== pasteId) return;

			const mState = sharedMusicState.get(pasteId);
			if (mState) {
				mState.volume = volume;
				socket.to(pasteId).emit("music:volume-update", { volume });
			}
		});

		socket.on("music:track-change", ({ pasteId, track, currentIndex }) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== pasteId) return;

			const mState = sharedMusicState.get(pasteId);
			if (mState) {
				mState.track = track;
				mState.currentTime = 0;
				mState.lastSyncedAt = Date.now();

				socket.to(pasteId).emit("music:track-update", {
					track,
					currentIndex,
				});
			}
		});

		socket.on("music:request-state", ({ pasteId }) => {
			const mState = sharedMusicState.get(pasteId);
			if (mState) {
				socket.emit("music:share-state", mState);
			}
		});

		socket.on("music:ping", ({ clientTimestamp }) => {
			socket.emit("music:pong", {
				clientTimestamp,
				serverTimestamp: Date.now(),
			});
		});

		socket.on("leave-paste", (pasteId) => {
			const user = activeUsers.get(socket.id);
			if (user && user.pasteId === pasteId) {
				user.pasteId = "";
				user.isEditing = false;
				user.isRecording = false;
				socket.leave(pasteId);
				broadcastRoomUsers(pasteId);

				const mState = sharedMusicState.get(pasteId);
				if (mState && mState.initiatorSocketId === socket.id) {
					sharedMusicState.delete(pasteId);
					io.to(pasteId).emit("music:share-state", {
						enabled: false,
					});
				}

				const roomUsers = Array.from(activeUsers.values()).filter(
					(u) => u.pasteId === pasteId,
				);
				if (roomUsers.length === 0) {
					sharedVideoState.delete(pasteId);
				}
			}
		});

		socket.on("edit-paste", async (data) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== data.pasteId) return;

			const userId = getSocketUserId(socket);
			const allowed = await canUserEdit(data.pasteId, userId);

			if (allowed) {
				if (data.content !== undefined) {
					roomContent.set(data.pasteId, data.content);
				}
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

		socket.on(
			"video-sync-action",
			async (data: {
				roomId: string;
				action: "play" | "pause" | "seek";
				timestamp: number;
				duration?: number;
			}) => {
				const user = activeUsers.get(socket.id);
				if (!user || user.cinemaRoomId !== data.roomId) return;

				const isPlaying = data.action === "play";
				sharedVideoState.set(data.roomId, {
					isPlaying,
					currentTime: data.timestamp,
					lastSyncedAt: Date.now(),
					duration: data.duration,
				});

				socket.to(data.roomId).emit("video-sync-state", {
					action: data.action,
					timestamp: data.timestamp,
					duration: data.duration,
				});
			},
		);

		socket.on(
			"video-reaction-send",
			async (data: { roomId: string; emoji: string }) => {
				const user = activeUsers.get(socket.id);
				if (!user || user.cinemaRoomId !== data.roomId) return;

				socket.to(data.roomId).emit("video-reaction-received", {
					emoji: data.emoji,
					name: user.name,
				});
			},
		);

		socket.on(
			"video-chat-message",
			async (data: { roomId: string; text: string }) => {
				const user = activeUsers.get(socket.id);
				if (!user || user.cinemaRoomId !== data.roomId) return;

				io.to(data.roomId).emit("video-chat-message-received", {
					text: data.text,
					sender: user.name,
					color: user.color,
				});
			},
		);

		socket.on(
			"video-timeline-ping",
			async (data: {
				roomId: string;
				timestamp: number;
				duration?: number;
			}) => {
				const user = activeUsers.get(socket.id);
				if (!user || user.cinemaRoomId !== data.roomId) return;

				const vState = sharedVideoState.get(data.roomId);
				if (vState) {
					vState.currentTime = data.timestamp;
					vState.lastSyncedAt = Date.now();
					if (data.duration) vState.duration = data.duration;
				} else {
					sharedVideoState.set(data.roomId, {
						isPlaying: true,
						currentTime: data.timestamp,
						lastSyncedAt: Date.now(),
						duration: data.duration,
					});
				}

				socket.to(data.roomId).emit("video-timeline-update", {
					socketId: socket.id,
					timestamp: data.timestamp,
					duration: data.duration,
				});
			},
		);

		socket.on("cursor-move", async (data) => {
			const { pasteId, ...cursorData } = data;
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== pasteId) return;

			const userId = getSocketUserId(socket);
			const allowed = await canUserEdit(pasteId, userId);

			if (allowed) {
				socket.to(pasteId).emit("user-cursor-move", {
					socketId: socket.id,
					...cursorData,
				});
			}
		});

		// Delegate all code running to isolated runner microservice proxy
		handleCodeRunnerProxy(socket);

		socket.on("disconnect", () => {
			const user = activeUsers.get(socket.id);
			if (user) {
				if (user.pasteId) {
					const pasteId = user.pasteId;
					activeUsers.delete(socket.id);
					broadcastRoomUsers(pasteId);

					const mState = sharedMusicState.get(pasteId);
					if (mState && mState.initiatorSocketId === socket.id) {
						sharedMusicState.delete(pasteId);
						io.to(pasteId).emit("music:share-state", {
							enabled: false,
						});
					}

					const roomUsers = Array.from(activeUsers.values()).filter(
						(u) => u.pasteId === pasteId,
					);

					// Notify remaining room peers for WebRTC cleanup
					socket.to(pasteId).emit("user-disconnected", {
						socketId: socket.id,
					});

					if (roomUsers.length === 0) {
						sharedVideoState.delete(pasteId);
					}
				} else if (user.cinemaRoomId) {
					const cinemaRoomId = user.cinemaRoomId;
					const roomState = cinemaRooms.get(cinemaRoomId);
					if (roomState && roomState.hostSocketId === socket.id) {
						cinemaRooms.delete(cinemaRoomId);
						sharedVideoState.delete(cinemaRoomId);
						io.to(cinemaRoomId).emit("cinema-host-disconnected");
					}

					activeUsers.delete(socket.id);
					broadcastCinemaUsers(io, activeUsers, cinemaRoomId);

					const roomUsers = Array.from(activeUsers.values()).filter(
						(u) => u.cinemaRoomId === cinemaRoomId,
					);
					if (roomUsers.length === 0) {
						cinemaRooms.delete(cinemaRoomId);
						sharedVideoState.delete(cinemaRoomId);
					}
				} else {
					activeUsers.delete(socket.id);
				}
			} else {
				activeUsers.delete(socket.id);
			}
		});
	});

	return io;
};
