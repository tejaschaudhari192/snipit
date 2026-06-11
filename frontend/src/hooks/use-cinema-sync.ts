import { useEffect, useRef } from "react";
import { type Socket } from "socket.io-client";

interface UseCinemaSyncOptions {
	socket: Socket | null | undefined;
	pasteId: string | undefined;
	isHost: boolean;
	isP2pMode: boolean;
	videoRef: React.RefObject<HTMLVideoElement | null>;
	isPlaying: boolean;
	duration: number;
	setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
	setDuration: React.Dispatch<React.SetStateAction<number>>;
	setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
	setIsBuffering: React.Dispatch<React.SetStateAction<boolean>>;
	setCommentsList: React.Dispatch<
		React.SetStateAction<
			Array<{ sender: string; text: string; color: string }>
		>
	>;
}

export function useCinemaSync({
	socket,
	pasteId,
	isHost,
	isP2pMode,
	videoRef,
	isPlaying,
	duration,
	setCurrentTime,
	setDuration,
	setIsPlaying,
	setIsBuffering,
	setCommentsList,
}: UseCinemaSyncOptions) {
	const isIncomingEvent = useRef(false);

	useEffect(() => {
		if (!socket) return;

		// Listen for playback state changes
		const handleSyncState = (data: {
			action: "play" | "pause" | "seek";
			timestamp: number;
			duration?: number;
		}) => {
			if (!videoRef.current) return;
			isIncomingEvent.current = true;

			if (data.duration && !isHost) {
				setDuration(data.duration);
			}

			if (data.action === "play") {
				setCurrentTime(data.timestamp);
				if (!isP2pMode || isHost) {
					const drift = Math.abs(
						videoRef.current.currentTime - data.timestamp,
					);
					if (drift > 1.5) {
						videoRef.current.currentTime = data.timestamp;
					}
				}
				videoRef.current.play().catch((err) => {
					if (err.name !== "AbortError") {
						console.error("Cinema: Sync play failed:", err);
					}
					setIsPlaying(false);
					setIsBuffering(false);
				});
				setIsPlaying(true);
			} else if (data.action === "pause") {
				setCurrentTime(data.timestamp);
				videoRef.current.pause();
				if (!isP2pMode || isHost) {
					videoRef.current.currentTime = data.timestamp;
				}
				setIsPlaying(false);
				setIsBuffering(false);
			} else if (data.action === "seek") {
				setCurrentTime(data.timestamp);
				if (!isP2pMode || isHost) {
					videoRef.current.currentTime = data.timestamp;
				}
				setIsBuffering(false);
			}

			setTimeout(() => {
				isIncomingEvent.current = false;
			}, 150);
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
		setIsBuffering,
		setCommentsList,
	]);

	// Periodically send current playhead position to let friends see status
	useEffect(() => {
		if (!socket || !isPlaying || !videoRef.current) return;

		const interval = setInterval(() => {
			if (videoRef.current && pasteId) {
				socket.emit("video-timeline-ping", {
					pasteId,
					timestamp: videoRef.current.currentTime,
					duration: videoRef.current.duration || undefined,
				});
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [socket, isPlaying, pasteId, videoRef]);

	// Smooth playhead estimation for watchers in P2P mode
	useEffect(() => {
		if (!isP2pMode || isHost || !isPlaying) return;

		const interval = setInterval(() => {
			setCurrentTime((prev) => {
				const next = prev + 0.1;
				return duration > 0 && next > duration ? duration : next;
			});
		}, 100);

		return () => clearInterval(interval);
	}, [isP2pMode, isHost, isPlaying, duration, setCurrentTime]);

	const emitVideoState = (
		action: "play" | "pause" | "seek",
		time: number,
	) => {
		if (!socket || isIncomingEvent.current || !pasteId) return;
		socket.emit("video-sync-action", {
			pasteId,
			action,
			timestamp: time,
			duration: videoRef.current?.duration || undefined,
		});
	};

	return {
		emitVideoState,
	};
}
