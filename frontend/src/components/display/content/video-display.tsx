import { useEffect, useRef, useState } from "react";
import { type Socket } from "socket.io-client";
import { type PasteData, type ActiveUser } from "@/types";
import { Tv, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/utils";
import { CinemaChat } from "./cinema-chat";
import { CinemaControls } from "./cinema-controls";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useWebRtc } from "@/hooks/use-webrtc";
import { calculateBufferPercent } from "@/utils/video-utils";
import {
	CinemaBufferOverlay,
	CinemaErrorOverlay,
	CinemaP2pConnectingOverlay,
	CinemaHostBroadcastOverlay,
	CinemaUnmuteOverlay,
} from "./cinema-overlays";

interface VideoDisplayProps {
	paste: PasteData;
	contentRef: (node: HTMLElement | null) => void;
	socketRef?: React.MutableRefObject<Socket | null>;
	activeUsers?: ActiveUser[];
	isEdit: boolean;
	content: string;
	onContentChange: (val: string) => void;
}

interface FloatingEmoji {
	id: number;
	emoji: string;
	left: number;
	name: string;
}

export const VideoDisplay = ({
	paste,
	contentRef,
	socketRef,
	activeUsers = [],
	isEdit,
	content,
	onContentChange,
}: VideoDisplayProps) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const theaterRef = useRef<HTMLDivElement>(null);

	// P2P and Host Detection state
	const location = useLocation();
	const { user } = useAuth();

	const videoSrc =
		content ||
		paste?.fileUrl ||
		(paste?.files && paste.files[0]?.url) ||
		"";

	const isP2pMode = videoSrc === "p2p://local-stream";

	const [localFile, setLocalFile] = useState<File | null>(
		(location.state as { localVideoFile?: File } | null)?.localVideoFile ||
			null,
	);

	const isHost =
		isEdit ||
		(paste && user && paste.owner === user._id) ||
		localFile !== null;

	const [videoUrlInput, setVideoUrlInput] = useState(content || "");
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(0.8);
	const [prevVolume, setPrevVolume] = useState(0.8);

	const handleToggleMute = () => {
		if (volume > 0) {
			setPrevVolume(volume);
			setVolume(0);
			if (videoRef.current) videoRef.current.volume = 0;
		} else {
			setVolume(prevVolume);
			if (videoRef.current) videoRef.current.volume = prevVolume;
		}
	};

	const [isBuffering, setIsBuffering] = useState(false);
	const [bufferPercent, setBufferPercent] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isControlsHovered, setIsControlsHovered] = useState(false);
	const [commentsList, setCommentsList] = useState<
		Array<{ sender: string; text: string; color: string }>
	>([]);
	const [chatInput, setChatInput] = useState("");
	const [videoError, setVideoError] = useState<string | null>(null);
	const [isMuted, setIsMuted] = useState(!isHost);
	const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(!isHost);

	const [localUrl, setLocalUrl] = useState<string>("");

	useEffect(() => {
		if (localFile) {
			const url = URL.createObjectURL(localFile);
			setLocalUrl(url);
			return () => URL.revokeObjectURL(url);
		}
	}, [localFile]);

	// Reset error when source URL changes
	useEffect(() => {
		setVideoError(null);
	}, [videoSrc, localUrl]);

	const socket = socketRef?.current;

	// WebRTC Setup (Only active in P2P mode to prevent overlaying CDN streams)
	const { remoteStream, isConnecting: isWebRtcConnecting } = useWebRtc({
		socket: isP2pMode ? socket : null,
		isHost: !!(isP2pMode && isHost),
		videoRef: isHost ? videoRef : undefined,
		pasteId: paste.id,
	});

	// Bind remote video stream to watcher's video element (Only in P2P mode)
	useEffect(() => {
		if (isP2pMode && !isHost && remoteStream && videoRef.current) {
			console.log(
				"Cinema: Binding remote WebRTC stream to watcher video element",
			);
			videoRef.current.srcObject = remoteStream;
			videoRef.current
				.play()
				.then(() => {
					console.log(
						"Cinema: Watcher stream autoplay succeeded in muted state.",
					);
				})
				.catch((err) => {
					if (err.name !== "AbortError") {
						console.error(
							"Cinema: Watcher stream play failed:",
							err,
						);
					}
				});
		} else if (
			!isP2pMode &&
			videoRef.current &&
			videoRef.current.srcObject
		) {
			console.log("Cinema: Resetting watcher video srcObject to null");
			videoRef.current.srcObject = null;
		}
	}, [isHost, remoteStream, isP2pMode]);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!theaterRef.current) return;

		if (!isFullscreen) {
			setIsControlsHovered(true);
			return;
		}

		// In fullscreen, only show controls if the cursor is in the bottom 120px of the screen
		const rect = theaterRef.current.getBoundingClientRect();
		const relativeY = e.clientY - rect.top;
		const bottomThreshold = rect.height - 120;

		if (relativeY >= bottomThreshold) {
			setIsControlsHovered(true);
		} else {
			setIsControlsHovered(false);
		}
	};

	const handleMouseLeave = () => {
		setIsControlsHovered(false);
	};

	const handleFullscreen = () => {
		if (!theaterRef.current) return;
		if (!document.fullscreenElement) {
			theaterRef.current.requestFullscreen().catch(() => {});
		} else {
			document.exitFullscreen().catch(() => {});
		}
	};

	useEffect(() => {
		const handleFsChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
			setIsControlsHovered(false); // Reset controls hover state instantly when fullscreen changes
		};
		document.addEventListener("fullscreenchange", handleFsChange);
		return () =>
			document.removeEventListener("fullscreenchange", handleFsChange);
	}, []);

	// Floating reactions state
	const [reactions, setReactions] = useState<FloatingEmoji[]>([]);
	const nextReactionId = useRef(0);

	// To prevent infinite feedback loops during sync, we set this flag
	const isIncomingEvent = useRef(false);

	// Floating Emoji tray
	const emojis = ["🎉", "😂", "😮", "❤️", "🍿", "🔥", "👏"];

	useEffect(() => {
		if (!socket) {
			console.log("Cinema: Socket is not initialized");
			return;
		}

		console.log("Cinema: Binding socket listeners");

		// Listen for playback state changes
		socket.on(
			"video-sync-state",
			(data: {
				action: "play" | "pause" | "seek";
				timestamp: number;
			}) => {
				console.log("Cinema: Received video-sync-state event:", data);
				if (!videoRef.current) {
					console.warn(
						"Cinema: Received sync event but videoRef is null",
					);
					return;
				}
				isIncomingEvent.current = true;

				if (data.action === "play") {
					console.log(`Cinema: Sync play to ${data.timestamp}`);
					// Only seek if drift exceeds threshold to prevent micro-stutter
					const drift = Math.abs(
						videoRef.current.currentTime - data.timestamp,
					);
					if (drift > 1.5) {
						videoRef.current.currentTime = data.timestamp;
					}
					videoRef.current
						.play()
						.then(() => {
							console.log("Cinema: Programmatic play succeeded");
						})
						.catch((err) => {
							if (err.name !== "AbortError") {
								console.error("Cinema: Sync play failed:", err);
							}
							setIsPlaying(false);
							setIsBuffering(false);
						});
					setIsPlaying(true);
				} else if (data.action === "pause") {
					console.log(`Cinema: Sync pause to ${data.timestamp}`);
					videoRef.current.pause();
					videoRef.current.currentTime = data.timestamp;
					setIsPlaying(false);
					setIsBuffering(false);
				} else if (data.action === "seek") {
					console.log(`Cinema: Sync seek to ${data.timestamp}`);
					videoRef.current.currentTime = data.timestamp;
					setCurrentTime(data.timestamp);
					setIsBuffering(false);
				}

				setTimeout(() => {
					isIncomingEvent.current = false;
				}, 150);
			},
		);

		// Listen for flying emoji reactions
		socket.on(
			"video-reaction-received",
			(data: { emoji: string; name: string }) => {
				console.log("Cinema: Reaction received:", data);
				setReactions((prev) => [
					...prev,
					{
						id: nextReactionId.current++,
						emoji: data.emoji,
						left: Math.random() * 80 + 10, // random percentage offset
						name: data.name,
					},
				]);
			},
		);

		// Listen for live chat comments
		socket.on(
			"video-chat-message-received",
			(data: { text: string; sender: string; color: string }) => {
				console.log("Cinema: Chat message received:", data);
				setCommentsList((prev) => [...prev, data]);
			},
		);

		return () => {
			console.log("Cinema: Cleaning up socket listeners");
			socket.off("video-sync-state");
			socket.off("video-reaction-received");
			socket.off("video-chat-message-received");
		};
	}, [socket]);

	// Periodically send current playhead position to let friends see status
	useEffect(() => {
		if (!socket || !isPlaying || !videoRef.current) return;

		const interval = setInterval(() => {
			if (videoRef.current) {
				socket.emit("video-timeline-ping", {
					pasteId: paste.id,
					timestamp: videoRef.current.currentTime,
				});
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [socket, isPlaying, paste.id]);

	const emitVideoState = (
		action: "play" | "pause" | "seek",
		time: number,
	) => {
		if (!socket || isIncomingEvent.current) return;
		socket.emit("video-sync-action", {
			pasteId: paste.id,
			action,
			timestamp: time,
		});
	};

	const handlePlayPause = () => {
		if (!videoRef.current) return;
		if (isPlaying) {
			videoRef.current.pause();
			setIsPlaying(false);
			emitVideoState("pause", videoRef.current.currentTime);
		} else {
			videoRef.current.play().catch(() => {});
			setIsPlaying(true);
			emitVideoState("play", videoRef.current.currentTime);
		}
	};

	const handleTimeUpdate = () => {
		if (!videoRef.current) return;
		setCurrentTime(videoRef.current.currentTime);
	};

	const handleProgress = () => {
		if (videoRef.current) {
			const percent = calculateBufferPercent(videoRef.current);
			setBufferPercent(percent);
		}
	};

	const sendReaction = (emoji: string) => {
		if (!socket) return;
		socket.emit("video-reaction-send", {
			pasteId: paste.id,
			emoji,
		});
	};

	const sendChatMessage = () => {
		if (!socket || !chatInput.trim()) return;
		socket.emit("video-chat-message", {
			pasteId: paste.id,
			text: chatInput.trim(),
		});
		setChatInput("");
	};

	// Clean reactions list as they float up
	useEffect(() => {
		if (reactions.length === 0) return;
		const timer = setTimeout(() => {
			setReactions((prev) => prev.slice(1));
		}, 3500);
		return () => clearTimeout(timer);
	}, [reactions]);

	if (isEdit) {
		return (
			<div className="flex flex-col items-center justify-center p-6 sm:p-12 w-full h-full bg-background/20 backdrop-blur-3xl border border-border/30 rounded-2xl max-w-2xl mx-auto shadow-2xl space-y-6">
				<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/20">
					<Tv className="w-8 h-8 text-primary" />
				</div>
				<div className="text-center space-y-2">
					<h2 className="text-2xl font-bold tracking-tight">
						Cinema room setup
					</h2>
					<p className="text-sm text-muted-foreground max-w-sm">
						Paste a video or stream link to start a synchronized
						watch party with your friends.
					</p>
				</div>
				<div className="w-full space-y-4">
					<div className="flex gap-2">
						<Input
							placeholder="Paste video stream link (e.g. mp4, webm, youtube)..."
							value={videoUrlInput}
							onChange={(e) => {
								setVideoUrlInput(e.target.value);
								onContentChange(e.target.value);
							}}
							className="flex-1 shadow-inner h-11"
						/>
					</div>
					<div className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
						<Sparkles className="w-4 h-4 text-primary animate-pulse" />
						<span className="text-xs font-semibold text-primary/80">
							Supports direct streaming URLs for optimal latency
							and clarity.
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={contentRef}
			className="w-full h-full flex flex-col md:flex-row relative bg-black/95 rounded-2xl overflow-hidden shadow-2xl min-h-[500px] md:min-h-0 select-none"
		>
			{/* Main Theater Screen Area */}
			<div
				ref={theaterRef}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				className="flex-1 flex flex-col justify-center relative bg-black min-h-0 min-w-0 group"
			>
				<CinemaBufferOverlay
					isBuffering={isBuffering}
					bufferPercent={bufferPercent}
				/>

				<CinemaUnmuteOverlay
					isVisible={isAutoplayBlocked}
					onUnmute={() => {
						console.log(
							"Cinema: Unmute overlay clicked. Enabling audio stream.",
						);
						setIsMuted(false);
						setIsAutoplayBlocked(false);
						if (videoRef.current) {
							videoRef.current.muted = false;
							videoRef.current.play().catch((err) => {
								if (err.name !== "AbortError") {
									console.error(
										"Cinema: Interactive play failed:",
										err,
									);
								}
							});
						}
					}}
				/>

				<CinemaErrorOverlay
					videoError={videoError}
					videoSrc={videoSrc}
				/>

				<CinemaP2pConnectingOverlay
					isConnecting={
						!isHost &&
						isP2pMode &&
						(!remoteStream || isWebRtcConnecting)
					}
				/>

				<CinemaHostBroadcastOverlay
					isActive={!!(isP2pMode && isHost && !localFile)}
					onSelectFile={setLocalFile}
				/>

				{/* Floating reaction rendering */}
				<div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
					{reactions.map((react) => (
						<div
							key={react.id}
							style={{ left: `${react.left}%` }}
							className="absolute bottom-24 animate-float-emoji flex flex-col items-center gap-1 bg-background/25 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg"
						>
							<span className="text-3xl filter drop-shadow-md">
								{react.emoji}
							</span>
							<span className="text-[10px] text-white/80 font-bold whitespace-nowrap drop-shadow-md">
								{react.name}
							</span>
						</div>
					))}
				</div>

				{/* Main synchronised video tag */}
				<div className="flex-1 flex items-center justify-center min-h-0 w-full relative">
					{(() => {
						const finalSrc = isP2pMode
							? isHost
								? localUrl
								: ""
							: videoSrc;
						return finalSrc || !isHost ? (
							<video
								ref={videoRef}
								autoPlay
								playsInline
								muted={isMuted}
								src={finalSrc || undefined}
								{...({
									referrerPolicy: "no-referrer",
								} as Record<string, string>)}
								className="max-w-full max-h-full aspect-video"
								onTimeUpdate={handleTimeUpdate}
								onProgress={handleProgress}
								onPlay={() => {
									setIsPlaying(true);
									setIsBuffering(false);
								}}
								onPause={() => {
									setIsPlaying(false);
									setIsBuffering(false);
								}}
								onSeeked={() => setIsBuffering(false)}
								onCanPlay={() => setIsBuffering(false)}
								onWaiting={() => setIsBuffering(true)}
								onPlaying={() => setIsBuffering(false)}
								onLoadedMetadata={() => {
									setDuration(
										videoRef.current?.duration || 0,
									);
									if (isP2pMode && isHost && socket) {
										console.log(
											"WebRTC Host: Stream is loaded and ready, broadcasting webrtc-stream-ready",
										);
										socket.emit("webrtc-stream-ready", {
											pasteId: paste.id,
										});
									}
								}}
								onDurationChange={() =>
									setDuration(videoRef.current?.duration || 0)
								}
								onError={() => {
									if (videoRef.current?.error) {
										const errCode =
											videoRef.current.error.code;
										console.error(
											"Video element error code:",
											errCode,
										);
										if (errCode === 4) {
											setVideoError(
												"The media format is unsupported, or direct stream access is blocked by CORS/Hotlinking restrictions.",
											);
										} else {
											setVideoError(
												"Failed to fetch stream. Make sure the link is directly streamable video data.",
											);
										}
									} else {
										setVideoError(
											"An error occurred loading the media. Ensure the URL is valid and streamable.",
										);
									}
								}}
							/>
						) : (
							<div className="flex flex-col items-center gap-4 text-white/50">
								<Tv className="w-12 h-12 animate-pulse" />
								<span className="text-sm font-semibold">
									Waiting for video stream URL...
								</span>
							</div>
						);
					})()}
				</div>
				<CinemaControls
					isPlaying={isPlaying}
					currentTime={currentTime}
					duration={duration}
					volume={volume}
					isFullscreen={isFullscreen}
					isControlsHovered={isControlsHovered}
					emojis={emojis}
					formatDuration={formatDuration}
					handlePlayPause={handlePlayPause}
					handleToggleMute={handleToggleMute}
					handleFullscreen={handleFullscreen}
					sendReaction={sendReaction}
					setVolume={setVolume}
					setCurrentTime={setCurrentTime}
					emitVideoState={emitVideoState}
					videoRef={videoRef}
				/>
			</div>

			{/* Watch Party Collaboration Sidebar */}
			<CinemaChat
				activeUsers={activeUsers}
				commentsList={commentsList}
				chatInput={chatInput}
				setChatInput={setChatInput}
				sendChatMessage={sendChatMessage}
			/>
		</div>
	);
};
