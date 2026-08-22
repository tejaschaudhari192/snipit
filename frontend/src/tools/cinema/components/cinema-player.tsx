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
import { Tv, Check, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	CinemaP2pConnectingOverlay,
	CinemaHostBroadcastOverlay,
	CinemaHostDisconnectedOverlay,
	CinemaErrorOverlay,
	CinemaUnmuteOverlay,
} from "./cinema-overlays";
import {
	CinemaTopBar,
	CinemaFloatingReactions,
	CinemaReactionBar,
} from "./cinema-player-controls";

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

export const CinemaPlayer = (props: CinemaPlayerProps) => {
	const navigate = useNavigate();
	const [copied, setCopied] = useState(false);
	const [isChangeVideoOpen, setIsChangeVideoOpen] = useState(false);
	const [newVideoUrl, setNewVideoUrl] = useState("");

	const handleChangeVideoSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newVideoUrl.trim() || !props.socket) return;
		let formattedUrl = newVideoUrl.trim();
		if (!/^https?:\/\//i.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}
		props.socket.emit("cinema-change-video", {
			roomId: props.roomId,
			videoUrl: formattedUrl,
		});
		setIsChangeVideoOpen(false);
		setNewVideoUrl("");
		toast.add({
			title: "Video changed!",
			description: "Switched video stream for all watchers in the room.",
			type: "success",
		});
	};

	const finalSrc =
		props.isP2pMode && !props.isHost
			? null
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

	const handleCopyInvite = () => {
		const inviteLink = `${window.location.origin}/tools/cinema/${props.roomId}`;
		navigator.clipboard.writeText(inviteLink);
		setCopied(true);
		toast.add({
			title: "Room link copied!",
			description: "Share this link with your friends to watch together.",
			type: "success",
		});
		setTimeout(() => setCopied(false), 2000);
	};

	const nativeVideoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		if (
			props.isP2pMode &&
			!props.isHost &&
			nativeVideoRef.current &&
			props.remoteMediaStream
		) {
			nativeVideoRef.current.srcObject = props.remoteMediaStream;
			nativeVideoRef.current.play().catch((err) => {
				console.warn("Autoplay failed for remote stream:", err);
			});
		}
	}, [props.isP2pMode, props.isHost, props.remoteMediaStream]);

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
				<CinemaTopBar
					onLeave={() => navigate("/tools/cinema")}
					isHost={false}
					isP2pMode={true}
					copied={copied}
					onCopyInvite={handleCopyInvite}
				/>

				<CinemaP2pConnectingOverlay
					isConnecting={props.isConnectingActual}
				/>
				<CinemaHostDisconnectedOverlay
					isVisible={!!props.isHostDisconnectedActual}
				/>

				<CinemaFloatingReactions reactions={props.reactions} />
				<CinemaReactionBar
					onSendReaction={props.handleSendReaction}
					bottomClass="bottom-6"
				/>

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
			<CinemaTopBar
				onLeave={() => navigate("/tools/cinema")}
				isHost={props.isHost}
				isP2pMode={props.isP2pMode}
				copied={copied}
				onCopyInvite={handleCopyInvite}
				onChangeVideo={
					props.isHost && !props.isP2pMode
						? () => setIsChangeVideoOpen(true)
						: undefined
				}
			/>

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

			<CinemaFloatingReactions reactions={props.reactions} />
			<CinemaReactionBar
				onSendReaction={props.handleSendReaction}
				bottomClass="bottom-20"
			/>

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

			{/* Change Video Stream Dialog for Host */}
			<Dialog
				open={isChangeVideoOpen}
				onOpenChange={setIsChangeVideoOpen}
			>
				<DialogContent className="sm:max-w-md bg-card border border-border shadow-2xl p-6 rounded-2xl">
					<DialogHeader className="gap-1.5">
						<DialogTitle className="text-lg font-bold flex items-center gap-2">
							<Film className="w-5 h-5 text-primary" />
							Change Video Stream
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Enter a new YouTube URL or direct MP4/video link to
							switch the video for everyone in the room.
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={handleChangeVideoSubmit}
						className="space-y-4 pt-2"
					>
						<Input
							placeholder="https://www.youtube.com/watch?v=..."
							value={newVideoUrl}
							onChange={(e) => setNewVideoUrl(e.target.value)}
							className="bg-background text-foreground border-border text-xs h-10"
							autoFocus
						/>
						<DialogFooter className="gap-2 sm:justify-end">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setIsChangeVideoOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								size="sm"
								disabled={!newVideoUrl.trim()}
								className="gap-1.5 font-semibold bg-primary hover:bg-primary/95 text-primary-foreground"
							>
								<Check className="w-4 h-4" />
								Switch Video
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};
