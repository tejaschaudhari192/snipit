import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import {
	MediaPlayer,
	MediaProvider,
	type MediaPlayerInstance,
} from "@vidstack/react";
import {
	defaultLayoutIcons,
	DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { type RefObject, useEffect, useRef, useState } from "react";
import { type Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Tv, ArrowLeft, Copy, Check, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
	CinemaP2pConnectingOverlay,
	CinemaHostBroadcastOverlay,
	CinemaHostDisconnectedOverlay,
	CinemaErrorOverlay,
	CinemaUnmuteOverlay,
} from "./cinema-overlays";

export interface CinemaPlayerProps {
	roomId: string;
	theaterRef: RefObject<HTMLDivElement | null>;
	videoRef: RefObject<MediaPlayerInstance | null>;
	isP2pMode: boolean;
	isHost: boolean;
	localFile: File | null;
	localUrl: string;
	videoSrc: string;
	remoteMediaStream?: MediaStream | null;

	isPlaying: boolean;
	currentTime: number;
	duration: number;

	reactions: Array<{ id: number; emoji: string; name: string; left: number }>;
	isHostBroadcasting: boolean;
	videoError: string | null;
	isConnectingActual: boolean;
	isHostDisconnectedActual: boolean;

	setIsPlaying: (val: boolean) => void;
	setCurrentTime: (val: number) => void;
	setDuration: (val: number) => void;
	setVideoError: (val: string | null) => void;
	setLocalFile: (file: File | null) => void;

	emitVideoState: (action: "play" | "pause" | "seek", time: number) => void;
	applyPendingSync?: () => void;
	needsUnmute?: boolean;
	handleUnmute?: () => void;
	replaceHostTracks: () => void;
	handleSendReaction: (emoji: string) => void;
	socket: Socket | null | undefined;
}

const EMOJI_LIST = ["🔥", "❤️", "🤣", "👏", "🍿", "😮", "🎉"];

export const CinemaPlayer = (props: CinemaPlayerProps) => {
	const navigate = useNavigate();
	const [copied, setCopied] = useState(false);

	// For non-guest-P2P: figure out what src to pass to Vidstack
	const finalSrc =
		props.isP2pMode && !props.isHost
			? null // Guest in P2P mode: use native video element, not Vidstack
			: props.isP2pMode && props.isHost
				? props.localUrl
					? { src: props.localUrl, type: "video/mp4" as const }
					: ""
				: props.videoSrc;

	const handleTimeUpdate = () => {
		if (!props.videoRef.current) return;
		if (!props.isP2pMode || props.isHost) {
			props.setCurrentTime(props.videoRef.current.currentTime);
		}
	};

	const handleVideoPlay = () => {
		props.setIsPlaying(true);
		props.setVideoError(null);
		if (!props.isP2pMode || props.isHost) {
			props.emitVideoState(
				"play",
				props.videoRef.current?.currentTime || 0,
			);
		}
	};

	const handleVideoPause = () => {
		props.setIsPlaying(false);
		if (!props.isP2pMode || props.isHost) {
			props.emitVideoState(
				"pause",
				props.videoRef.current?.currentTime || 0,
			);
		}
	};

	const handleVideoSeeked = () => {
		if (!props.isP2pMode || props.isHost) {
			props.emitVideoState(
				"seek",
				props.videoRef.current?.currentTime || 0,
			);
		}
	};

	const handleLoadedMetadata = () => {
		const dur = props.videoRef.current?.duration || 0;
		if (!props.isP2pMode || props.isHost) {
			props.setDuration(dur);
		}
		if (!props.isHost && props.applyPendingSync) {
			props.applyPendingSync();
		}
		if (props.isP2pMode && props.isHost) {
			props.replaceHostTracks();
			if (props.socket) {
				props.socket.emit("video-sync-action", {
					roomId: props.roomId,
					action: "seek",
					timestamp: props.videoRef.current?.currentTime || 0,
					duration: dur,
				});
			}
		}
	};

	const handleCanPlay = () => {
		if (!props.isHost && props.applyPendingSync) {
			props.applyPendingSync();
		}
	};

	const handleCopyInvite = async () => {
		const url = `${window.location.origin}/tools/cinema/${props.roomId}`;
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.add({
				title: "Invite Link Copied!",
				type: "success",
			});
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.add({
				title: "Failed to copy link",
				type: "error",
			});
		}
	};

	// Native video ref for guest P2P stream (srcObject-based)
	const nativeVideoRef = useRef<HTMLVideoElement | null>(null);
	useEffect(() => {
		const vid = nativeVideoRef.current;
		if (!vid) return;
		if (props.remoteMediaStream) {
			vid.srcObject = props.remoteMediaStream;
			vid.play().catch(() => {
				// Autoplay blocked — user must click play
			});
		} else {
			vid.srcObject = null;
		}
	}, [props.remoteMediaStream]);

	// Guest P2P: render native <video> with srcObject for WebRTC stream
	if (props.isP2pMode && !props.isHost) {
		return (
			<div
				ref={props.theaterRef}
				className="flex-1 flex flex-col justify-center relative bg-black min-h-0 min-w-0 group rounded-2xl overflow-hidden"
				style={
					{
						"--video-brand": "hsl(var(--primary))",
					} as React.CSSProperties
				}
			>
				{/* Top Control Bar */}
				<div className="absolute top-0 left-0 right-0 z-30 p-3 bg-linear-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate("/tools/cinema")}
							className="h-8 px-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg gap-1.5"
						>
							<ArrowLeft className="w-4 h-4" />
							<span className="text-xs font-semibold">Leave</span>
						</Button>
						<div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white/90 text-xs font-medium">
							<Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
							<span>P2P Stream</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="secondary"
							size="sm"
							onClick={handleCopyInvite}
							className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
						>
							{copied ? (
								<Check className="w-3.5 h-3.5 text-emerald-400" />
							) : (
								<Copy className="w-3.5 h-3.5" />
							)}
							{copied ? "Copied" : "Copy Invite"}
						</Button>
					</div>
				</div>

				<CinemaP2pConnectingOverlay
					isConnecting={props.isConnectingActual}
				/>
				<CinemaHostDisconnectedOverlay
					isVisible={!!props.isHostDisconnectedActual}
				/>

				{/* Floating reactions */}
				<div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
					{props.reactions.map((react) => (
						<div
							key={react.id}
							style={{ left: `${react.left}%` }}
							className="absolute bottom-24 animate-float-emoji flex flex-col items-center gap-1 bg-background/25 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/50 shadow-lg"
						>
							<span className="text-3xl filter drop-shadow-md">
								{react.emoji}
							</span>
							<span className="text-[10px] text-foreground/80 font-bold whitespace-nowrap drop-shadow-md">
								{react.name}
							</span>
						</div>
					))}
				</div>

				{/* Interactive Reaction Bar */}
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					{EMOJI_LIST.map((emoji) => (
						<button
							key={emoji}
							onClick={() => props.handleSendReaction(emoji)}
							className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 hover:scale-125 active:scale-95 transition-all text-lg cursor-pointer"
							title={`React ${emoji}`}
						>
							{emoji}
						</button>
					))}
				</div>

				{/* Native video element for WebRTC stream */}
				<div className="flex-1 flex items-center justify-center min-h-0 w-full relative z-10">
					{props.remoteMediaStream ? (
						<video
							ref={nativeVideoRef}
							className="w-full h-full object-contain bg-black"
							playsInline
							autoPlay
							controls
						/>
					) : (
						<div className="flex flex-col items-center gap-4 text-muted-foreground">
							<Tv className="w-12 h-12 animate-pulse" />
							<span className="text-sm font-semibold">
								Waiting for host stream...
							</span>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div
			ref={props.theaterRef}
			className="flex-1 flex flex-col justify-center relative bg-black min-h-0 min-w-0 group rounded-2xl overflow-hidden"
			style={
				{
					"--video-brand": "hsl(var(--primary))",
				} as React.CSSProperties
			}
		>
			{/* Top Control Bar */}
			<div className="absolute top-0 left-0 right-0 z-30 p-3 bg-linear-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate("/tools/cinema")}
						className="h-8 px-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg gap-1.5"
					>
						<ArrowLeft className="w-4 h-4" />
						<span className="text-xs font-semibold">Leave</span>
					</Button>
					<div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white/90 text-xs font-medium">
						<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
						<span>{props.isHost ? "Host" : "Synced"}</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={handleCopyInvite}
						className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
					>
						{copied ? (
							<Check className="w-3.5 h-3.5 text-emerald-400" />
						) : (
							<Copy className="w-3.5 h-3.5" />
						)}
						{copied ? "Copied" : "Copy Invite"}
					</Button>
				</div>
			</div>

			<CinemaP2pConnectingOverlay
				isConnecting={props.isConnectingActual}
			/>

			<CinemaHostBroadcastOverlay
				isActive={
					!!(
						props.isP2pMode &&
						props.isHost &&
						!props.localFile &&
						!props.isHostBroadcasting
					)
				}
				onSelectFile={props.setLocalFile}
			/>

			<CinemaHostDisconnectedOverlay
				isVisible={props.isHostDisconnectedActual}
			/>

			<CinemaErrorOverlay
				videoError={props.videoError}
				videoSrc={props.videoSrc}
			/>

			<CinemaUnmuteOverlay
				isVisible={!!props.needsUnmute}
				onUnmute={props.handleUnmute || (() => {})}
			/>

			{/* Floating reaction rendering */}
			<div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
				{props.reactions.map((react) => (
					<div
						key={react.id}
						style={{ left: `${react.left}%` }}
						className="absolute bottom-24 animate-float-emoji flex flex-col items-center gap-1 bg-background/25 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/50 shadow-lg"
					>
						<span className="text-3xl filter drop-shadow-md">
							{react.emoji}
						</span>
						<span className="text-[10px] text-foreground/80 font-bold whitespace-nowrap drop-shadow-md">
							{react.name}
						</span>
					</div>
				))}
			</div>

			{/* Interactive Reaction Bar */}
			<div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
				{EMOJI_LIST.map((emoji) => (
					<button
						key={emoji}
						onClick={() => props.handleSendReaction(emoji)}
						className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 hover:scale-125 active:scale-95 transition-all text-lg cursor-pointer"
						title={`React ${emoji}`}
					>
						{emoji}
					</button>
				))}
			</div>

			{/* Main synchronized video player */}
			<div className="flex-1 flex items-center justify-center min-h-0 w-full relative z-10">
				{finalSrc || !props.isHost ? (
					<MediaPlayer
						ref={props.videoRef}
						src={finalSrc || undefined}
						playsInline
						autoPlay
						onTimeUpdate={handleTimeUpdate}
						onPlay={handleVideoPlay}
						onPause={handleVideoPause}
						onSeeked={handleVideoSeeked}
						onLoadedMetadata={handleLoadedMetadata}
						onCanPlay={handleCanPlay}
						onError={() =>
							props.setVideoError(
								"An error occurred loading the media stream.",
							)
						}
						className="w-full h-full text-white bg-black"
					>
						<MediaProvider />
						<DefaultVideoLayout icons={defaultLayoutIcons} />
					</MediaPlayer>
				) : (
					<div className="flex flex-col items-center gap-4 text-muted-foreground">
						<Tv className="w-12 h-12 animate-pulse" />
						<span className="text-sm font-semibold">
							Waiting for video stream URL...
						</span>
					</div>
				)}
			</div>
		</div>
	);
};
