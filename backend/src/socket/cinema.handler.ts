import type { Server as SocketIOServer, Socket } from "socket.io";
import type { ActiveUser, SharedVideoState } from "@/types/index.js";

export interface CinemaRoom {
	hostSocketId: string;
	url: string;
	isP2pMode: boolean;
}

export function broadcastCinemaUsers(
	io: SocketIOServer,
	activeUsers: Map<
		string,
		ActiveUser & { pasteId: string; cinemaRoomId?: string }
	>,
	roomId: string,
) {
	const roomUsers = Array.from(activeUsers.values()).filter(
		(u) => u.cinemaRoomId === roomId,
	);
	io.to(roomId).emit("cinema-room-users", roomUsers);
}

export function registerCinemaHandlers(
	io: SocketIOServer,
	socket: Socket,
	activeUsers: Map<
		string,
		ActiveUser & { pasteId: string; cinemaRoomId?: string }
	>,
	cinemaRooms: Map<string, CinemaRoom>,
	sharedVideoState: Map<string, SharedVideoState>,
) {
	const broadcast = (roomId: string) =>
		broadcastCinemaUsers(io, activeUsers, roomId);

	socket.on(
		"create-cinema-room",
		({ roomId, videoUrl, isP2pMode, userName }) => {
			if (typeof roomId !== "string" || !roomId.trim()) return;
			const user = activeUsers.get(socket.id);
			if (user) {
				user.cinemaRoomId = roomId;
				if (userName) user.name = userName;
				socket.join(roomId);
				cinemaRooms.set(roomId, {
					hostSocketId: socket.id,
					url: typeof videoUrl === "string" ? videoUrl : "",
					isP2pMode: Boolean(isP2pMode),
				});
				broadcast(roomId);
			}
		},
	);

	socket.on("join-cinema-room", ({ roomId, userName }) => {
		if (typeof roomId !== "string" || !roomId.trim()) return;
		const user = activeUsers.get(socket.id);
		if (user) {
			user.cinemaRoomId = roomId;
			if (userName) user.name = userName;
			socket.join(roomId);

			const roomState = cinemaRooms.get(roomId);
			if (roomState) {
				socket.emit("cinema-room-state", {
					videoUrl: roomState.url,
					isP2pMode: roomState.isP2pMode,
					hostSocketId: roomState.hostSocketId,
				});

				const vState = sharedVideoState.get(roomId);
				if (vState) {
					let currentPos = vState.currentTime;
					if (vState.isPlaying) {
						const elapsed =
							(Date.now() - vState.lastSyncedAt) / 1000;
						currentPos += elapsed;
					}
					socket.emit("cinema-video-state", {
						action: vState.isPlaying ? "play" : "pause",
						time: currentPos,
					});
				}
			}

			broadcast(roomId);
		}
	});

	socket.on("cinema-video-state", ({ roomId, action, time }) => {
		if (typeof roomId !== "string" || !roomId.trim()) return;
		sharedVideoState.set(roomId, {
			isPlaying: action === "play",
			currentTime: typeof time === "number" ? time : 0,
			lastSyncedAt: Date.now(),
		});
		socket.to(roomId).emit("cinema-video-state", { action, time });
	});

	socket.on(
		"cinema-change-video",
		({ roomId, videoUrl }: { roomId: string; videoUrl: string }) => {
			if (
				typeof roomId !== "string" ||
				typeof videoUrl !== "string" ||
				!roomId.trim() ||
				!videoUrl.trim() ||
				roomId.length > 100 ||
				videoUrl.length > 2048
			) {
				return;
			}

			const room = cinemaRooms.get(roomId);
			if (!room || room.hostSocketId !== socket.id) return;
			room.url = videoUrl;
			sharedVideoState.set(roomId, {
				isPlaying: false,
				currentTime: 0,
				lastSyncedAt: Date.now(),
			});
			io.to(roomId).emit("cinema-video-changed", { videoUrl });
		},
	);

	socket.on("cinema-chat-message", ({ roomId, message }) => {
		if (typeof roomId !== "string" || !roomId.trim()) return;
		const user = activeUsers.get(socket.id);
		if (user && message) {
			const chatMsg = {
				id: Math.random().toString(36).substring(7),
				sender: user.name,
				senderId: socket.id,
				text: typeof message === "string" ? message.slice(0, 1000) : "",
				timestamp: Date.now(),
			};
			io.to(roomId).emit("cinema-chat-message", chatMsg);
		}
	});

	socket.on("cinema-reaction", ({ roomId, emoji }) => {
		if (typeof roomId !== "string" || !roomId.trim()) return;
		const user = activeUsers.get(socket.id);
		if (user && emoji) {
			io.to(roomId).emit("cinema-reaction", {
				emoji,
				sender: user.name,
			});
		}
	});

	socket.on("cinema-signal", ({ roomId, to, signal }) => {
		if (typeof roomId !== "string") return;
		if (to) {
			io.to(to).emit("cinema-signal", {
				from: socket.id,
				signal,
			});
		} else {
			socket.to(roomId).emit("cinema-signal", {
				from: socket.id,
				signal,
			});
		}
	});

	socket.on("cinema-sync-request", ({ roomId }) => {
		if (typeof roomId !== "string") return;
		const room = cinemaRooms.get(roomId);
		if (room && room.hostSocketId) {
			io.to(room.hostSocketId).emit("cinema-sync-request", {
				requesterId: socket.id,
			});
		}
	});

	socket.on("cinema-sync-response", ({ requesterId, state }) => {
		if (typeof requesterId === "string") {
			io.to(requesterId).emit("cinema-sync-response", state);
		}
	});
}
