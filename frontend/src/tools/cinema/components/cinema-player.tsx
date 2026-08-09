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
import { type RefObject } from "react";
import { type Socket } from "socket.io-client";
import { Tv } from "lucide-react";
import {
	CinemaP2pConnectingOverlay,
	CinemaHostBroadcastOverlay,
	CinemaHostDisconnectedOverlay,
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
	replaceHostTracks: () => void;
	handleSendReaction: (emoji: string) => void;
	socket: Socket | null | undefined;
}

export const CinemaPlayer = (props: CinemaPlayerProps) => {
	const finalSrc = props.isP2pMode
		? props.isHost
			? props.localUrl
				? { src: props.localUrl, type: "video/mp4" as const }
				: ""
			: props.remoteMediaStream
				? {
						src: props.remoteMediaStream,
						type: "video/object" as const,
					}
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
				isVisible={
					!!(
						props.isP2pMode &&
						!props.isHost &&
						props.isHostDisconnectedActual
					)
				}
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

			{/* Main synchronized video player */}
			<div className="flex-1 flex items-center justify-center min-h-0 w-full relative z-10">
				{finalSrc || !props.isHost ? (
					<MediaPlayer
						ref={props.videoRef}
						src={finalSrc || undefined}
						crossOrigin="anonymous"
						playsInline
						autoPlay
						onTimeUpdate={handleTimeUpdate}
						onPlay={handleVideoPlay}
						onPause={handleVideoPause}
						onSeeked={handleVideoSeeked}
						onLoadedMetadata={handleLoadedMetadata}
						onError={() =>
							props.setVideoError(
								"An error occurred loading the media.",
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
