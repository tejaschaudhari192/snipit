import { useEffect, useRef, useState, useCallback } from "react";
import { type Socket } from "socket.io-client";
import type { MediaPlayerInstance } from "@vidstack/react";

interface UseCinemaSyncOptions {
	socket: Socket | null | undefined;
	roomId: string | undefined;
	isHost: boolean;
	isP2pMode: boolean;
	videoRef: React.RefObject<MediaPlayerInstance | null>;
	isPlaying: boolean;
	duration: number;
	setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
	setDuration: React.Dispatch<React.SetStateAction<number>>;
	setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
	setCommentsList: React.Dispatch<
		React.SetStateAction<
			Array<{ sender: string; text: string; color: string }>
		>
	>;
}

export function useCinemaSync({
	socket,
	roomId,
	isHost,
	isP2pMode,
	videoRef,
	duration,
	setCurrentTime,
	setDuration,
	setIsPlaying,
	setCommentsList,
}: UseCinemaSyncOptions) {
	const isIncomingEvent = useRef(false);
	const lastRemoteSyncTime = useRef(0);
	const pendingSyncRef = useRef<{
		action: "play" | "pause" | "seek";
		timestamp: number;
		duration?: number;
	} | null>(null);

	const [needsUnmute, setNeedsUnmute] = useState(false);

	const attemptPlay = useCallback(() => {
		if (!videoRef.current) return;
		try {
			videoRef.current.play().catch((err) => {
				if (err.name !== "AbortError") {
					console.warn(
						"Cinema: Autoplay unmuted was blocked. Muting to autoplay...",
						err,
					);
					if (videoRef.current) {
						videoRef.current.muted = true;
						videoRef.current
							.play()
							.then(() => {
								setNeedsUnmute(true);
							})
							.catch((e) => {
								console.error(
									"Cinema: Muted autoplay also failed:",
									e,
								);
							});
					}
				}
			});
		} catch (err) {
			console.warn("Cinema: Synchronized play attempt error:", err);
		}
	}, [videoRef]);

	const handleUnmute = useCallback(() => {
		if (videoRef.current) {
			videoRef.current.muted = false;
			setNeedsUnmute(false);
		}
	}, [videoRef]);

	const applyPendingSync = useCallback(() => {
		if (!videoRef.current || !pendingSyncRef.current) return;
		const data = pendingSyncRef.current;
		isIncomingEvent.current = true;
		lastRemoteSyncTime.current = Date.now();

		if (data.timestamp !== undefined) {
			videoRef.current.currentTime = data.timestamp;
			setCurrentTime(data.timestamp);
		}
		if (data.duration) {
			setDuration(data.duration);
		}
		if (data.action === "play") {
			setIsPlaying(true);
			attemptPlay();
		} else {
			setIsPlaying(false);
			try {
				videoRef.current.pause();
			} catch {
				console.warn(
					"Cinema: Failed to pause media during pending sync",
				);
			}
		}

		setTimeout(() => {
			isIncomingEvent.current = false;
		}, 400);
	}, [videoRef, setCurrentTime, setDuration, setIsPlaying, attemptPlay]);

	useEffect(() => {
		if (!socket) return;

		// Listen for playback state changes
		const handleSyncState = (data: {
			action: "play" | "pause" | "seek";
			timestamp: number;
			duration?: number;
		}) => {
			pendingSyncRef.current = data;

			if (!videoRef.current) return;
			isIncomingEvent.current = true;
			lastRemoteSyncTime.current = Date.now();

			if (data.duration && !isHost) {
				setDuration(data.duration);
			}

			if (data.action === "play") {
				setCurrentTime(data.timestamp);
				if (!isP2pMode || isHost) {
					const drift = Math.abs(
						videoRef.current.currentTime - data.timestamp,
					);
					if (drift > 0.8) {
						videoRef.current.currentTime = data.timestamp;
					}
				}
				setIsPlaying(true);
				attemptPlay();
			} else if (data.action === "pause") {
				setCurrentTime(data.timestamp);
				try {
					videoRef.current.pause();
				} catch {
					console.warn(
						"Cinema: Ignored sync pause, media not ready yet",
					);
				}
				if (!isP2pMode || isHost) {
					videoRef.current.currentTime = data.timestamp;
				}
				setIsPlaying(false);
			} else if (data.action === "seek") {
				setCurrentTime(data.timestamp);
				if (!isP2pMode || isHost) {
					videoRef.current.currentTime = data.timestamp;
				}
			}

			setTimeout(() => {
				isIncomingEvent.current = false;
			}, 400);
		};

		// Listen for live chat comments
		const handleChatMessage = (data: {
			text: string;
			sender: string;
			color: string;
		}) => {
			setCommentsList((prev) => [...prev, data]);
		};

		// Listen for periodic timeline pings from host
		const handleTimelineUpdate = (data: {
			timestamp: number;
			duration?: number;
		}) => {
			if (isHost) return;
			setCurrentTime(data.timestamp);
			if (data.duration) {
				setDuration(data.duration);
			}
			if (!isP2pMode && videoRef.current) {
				const drift = Math.abs(
					videoRef.current.currentTime - data.timestamp,
				);
				if (drift > 1.0) {
					videoRef.current.currentTime = data.timestamp;
				}
			}
		};

		socket.on("video-sync-state", handleSyncState);
		socket.on("video-chat-message-received", handleChatMessage);
		socket.on("video-timeline-update", handleTimelineUpdate);

		return () => {
			socket.off("video-sync-state", handleSyncState);
			socket.off("video-chat-message-received", handleChatMessage);
			socket.off("video-timeline-update", handleTimelineUpdate);
		};
	}, [
		socket,
		isHost,
		isP2pMode,
		videoRef,
		setCurrentTime,
		setDuration,
		setIsPlaying,
		setCommentsList,
		attemptPlay,
	]);

	// Periodically send current playhead position to let friends see status (host authoritative)
	useEffect(() => {
		if (!socket || !roomId || !isHost) return;

		const interval = setInterval(() => {
			if (videoRef.current) {
				socket.emit("video-timeline-ping", {
					roomId,
					timestamp: videoRef.current.currentTime || 0,
					duration: videoRef.current.duration || undefined,
				});
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [socket, roomId, videoRef, isHost]);

	// Smooth playhead estimation for watchers in P2P mode
	useEffect(() => {
		if (!isP2pMode || isHost) return;

		const interval = setInterval(() => {
			setCurrentTime((prev) => {
				const next = prev + 0.1;
				return duration > 0 && next > duration ? duration : next;
			});
		}, 100);

		return () => clearInterval(interval);
	}, [isP2pMode, isHost, duration, setCurrentTime]);

	const emitVideoState = (
		action: "play" | "pause" | "seek",
		time: number,
	) => {
		if (
			!socket ||
			isIncomingEvent.current ||
			!roomId ||
			Date.now() - lastRemoteSyncTime.current < 400
		)
			return;

		socket.emit("video-sync-action", {
			roomId,
			action,
			timestamp: time,
			duration: videoRef.current?.duration || undefined,
		});
	};

	return {
		emitVideoState,
		applyPendingSync,
		needsUnmute,
		handleUnmute,
	};
}
