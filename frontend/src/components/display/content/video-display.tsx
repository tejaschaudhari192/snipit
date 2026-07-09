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
import { useLiveKit } from "@/hooks/use-livekit";
import { calculateBufferPercent } from "@/utils/video-utils";
import { useFloatingReactions } from "@/hooks/use-floating-reactions";
import { useCinemaSync } from "@/hooks/use-cinema-sync";
import {
	CinemaBufferOverlay,
	CinemaErrorOverlay,
	CinemaP2pConnectingOverlay,
	CinemaHostBroadcastOverlay,
	CinemaUnmuteOverlay,
	CinemaHostDisconnectedOverlay,
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

	const [viewerIdentity] = useState(() => {
		return `viewer-${user?._id || Math.random().toString(36).substring(2, 11)}`;
	});

	const {
		remoteVideoStream,
		isConnecting: isLiveKitConnecting,
		isHostDisconnected: isLiveKitHostDisconnected,
		replaceHostTracks,
	} = useLiveKit({
		roomName: paste.id || "",
		identity: isHost ? "host" : viewerIdentity,
		isHost: !!(isP2pMode && isHost),
		videoRef: isHost ? videoRef : undefined,
	});

	const remoteStream = remoteVideoStream;
	const isConnectingActual = isLiveKitConnecting;
	const isHostDisconnectedActual = isLiveKitHostDisconnected;

	// Bind remote video stream to watcher's video element (Only in P2P mode)
	useEffect(() => {
		const video = videoRef.current;
		if (isP2pMode && !isHost && remoteStream && video) {
			console.log(
				"Cinema: Binding remote LiveKit stream to watcher video element",
			);
			video.srcObject = remoteStream;
			video
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
		}

		return () => {
			if (video) {
				console.log(
					"Cinema: Cleanup - Resetting watcher video srcObject and pausing player",
				);
				video.pause();
				video.srcObject = null;
			}
		};
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

	const handleVideoPlay = () => {
		setIsPlaying(true);
		setIsBuffering(false);
		setVideoError(null);
	};

	const handleVideoPause = () => {
		setIsPlaying(false);
		setIsBuffering(false);
	};

	const handleVideoSeeked = () => {
		setIsBuffering(false);
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

	// Custom hook for flying emojis
	const { reactions, handleSendReaction } = useFloatingReactions(
		socket,
		paste.id,
		user?.username,
	);

	// Custom hook for all video sync events and timeline pings
	const { emitVideoState } = useCinemaSync({
		socket,
		pasteId: paste.id,
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
	});

	// Floating Emoji tray
	const emojis = ["🎉", "😂", "😮", "❤️", "🍿", "🔥", "👏"];

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
		if (!isP2pMode || isHost) {
			setCurrentTime(videoRef.current.currentTime);
		}
	};

	const handleProgress = () => {
		if (videoRef.current) {
			const percent = calculateBufferPercent(videoRef.current);
			setBufferPercent(percent);
		}
	};

	const sendChatMessage = () => {
		if (!socket || !chatInput.trim()) return;
		socket.emit("video-chat-message", {
			pasteId: paste.id,
			text: chatInput.trim(),
		});
		setChatInput("");
	};

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
							value={content}
							onChange={(e) => {
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
			className="w-full h-full flex flex-col md:flex-row relative bg-black/95 rounded-2xl overflow-hidden shadow-2xl min-h-125 md:min-h-0 select-none"
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
						(!remoteStream || isConnectingActual)
					}
				/>

				<CinemaHostBroadcastOverlay
					isActive={!!(isP2pMode && isHost && !localFile)}
					onSelectFile={setLocalFile}
				/>

				<CinemaHostDisconnectedOverlay
					isVisible={
						!!(isP2pMode && !isHost && isHostDisconnectedActual)
					}
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
								onPlay={handleVideoPlay}
								onPause={handleVideoPause}
								onSeeked={handleVideoSeeked}
								onCanPlay={() => {
									setIsBuffering(false);
									setVideoError(null);
								}}
								onWaiting={() => setIsBuffering(true)}
								onPlaying={() => {
									setIsBuffering(false);
									setVideoError(null);
								}}
								onLoadedMetadata={() => {
									const dur = videoRef.current?.duration || 0;
									if (!isP2pMode || isHost) {
										setDuration(dur);
									}
									if (isP2pMode && isHost) {
										replaceHostTracks();
										// Broadcast actual video duration to peers instantly
										if (socket) {
											socket.emit("video-sync-action", {
												pasteId: paste.id,
												action: "seek",
												timestamp:
													videoRef.current
														?.currentTime || 0,
												duration: dur,
											});
										}
									}
								}}
								onDurationChange={() => {
									if (!isP2pMode || isHost) {
										setDuration(
											videoRef.current?.duration || 0,
										);
									}
								}}
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
					sendReaction={handleSendReaction}
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
