import { RefreshCw, Tv, Loader2, AlertCircle, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CinemaUnmuteOverlayProps {
	isVisible: boolean;
	onUnmute: () => void;
}

export const CinemaUnmuteOverlay = ({
	isVisible,
	onUnmute,
}: CinemaUnmuteOverlayProps) => {
	if (!isVisible) return null;

	return (
		<div
			onClick={onUnmute}
			className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 z-30 cursor-pointer hover:bg-black/60 transition-all duration-300 animate-in fade-in duration-200"
		>
			<div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center animate-bounce shadow-lg shadow-primary/20">
				<VolumeX className="w-7 h-7 text-primary" />
			</div>
			<div className="text-center space-y-1 p-4 font-sans">
				<span className="text-sm font-bold text-white tracking-wide">
					Stream muted by browser autoplay restrictions
				</span>
				<p className="text-xs text-white/60">
					Click anywhere on screen to unmute audio and sync playback
				</p>
			</div>
		</div>
	);
};

interface CinemaBufferOverlayProps {
	isBuffering: boolean;
	bufferPercent: number;
}

export const CinemaBufferOverlay = ({
	isBuffering,
	bufferPercent,
}: CinemaBufferOverlayProps) => {
	if (!isBuffering) return null;

	return (
		<div className="absolute inset-0 z-30 flex flex-col gap-3 items-center justify-center bg-black/60 backdrop-blur-sm">
			<RefreshCw className="w-12 h-12 text-primary animate-spin" />
			<span className="text-sm font-bold text-white tracking-wider animate-pulse">
				Buffering... {bufferPercent}%
			</span>
		</div>
	);
};

interface CinemaErrorOverlayProps {
	videoError: string | null;
	videoSrc?: string;
}

export const CinemaErrorOverlay = ({
	videoError,
	videoSrc,
}: CinemaErrorOverlayProps) => {
	if (!videoError) return null;

	return (
		<div className="absolute inset-0 z-35 flex flex-col gap-4 items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center animate-in fade-in duration-200">
			<div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/15">
				<AlertCircle className="w-7 h-7 text-destructive" />
			</div>
			<div className="space-y-1.5 max-w-sm">
				<h3 className="text-md font-bold text-white tracking-wider">
					Stream Playback Failed
				</h3>
				<p className="text-xs text-muted-foreground leading-relaxed">
					{videoError}
				</p>
			</div>
			{videoSrc && videoSrc !== "p2p://local-stream" && (
				<Button
					onClick={() =>
						window.open(videoSrc, "_blank", "noopener,noreferrer")
					}
					variant="outline"
					size="sm"
					className="h-9 px-4 font-bold border-white/20 text-white hover:bg-white/10"
				>
					Play Directly in New Tab
				</Button>
			)}
			<span className="text-[10px] text-muted-foreground bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
				Tip: Ensure it is a direct raw .mp4/.m3u8 CDN link, not a web
				player wrapper.
			</span>
		</div>
	);
};

interface CinemaP2pConnectingOverlayProps {
	isConnecting: boolean;
}

export const CinemaP2pConnectingOverlay = ({
	isConnecting,
}: CinemaP2pConnectingOverlayProps) => {
	if (!isConnecting) return null;

	return (
		<div className="absolute inset-0 z-30 flex flex-col gap-4 items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
			<Loader2 className="w-12 h-12 text-primary animate-spin" />
			<div className="space-y-1 max-w-sm">
				<h3 className="text-sm font-bold text-white tracking-wider">
					Connecting to watch party stream...
				</h3>
				<p className="text-xs text-muted-foreground">
					Secure browser-to-browser direct connection optimizes
					streaming bandwidth and privacy.
				</p>
			</div>
		</div>
	);
};

interface CinemaHostBroadcastOverlayProps {
	isActive: boolean;
	onSelectFile: (file: File) => void;
}

export const CinemaHostBroadcastOverlay = ({
	isActive,
	onSelectFile,
}: CinemaHostBroadcastOverlayProps) => {
	if (!isActive) return null;

	return (
		<div className="absolute inset-0 z-30 flex flex-col gap-4 items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
			<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/20">
				<Tv className="w-8 h-8 text-primary animate-pulse" />
			</div>
			<div className="space-y-1.5 max-w-sm">
				<h3 className="text-lg font-bold text-white">
					Broadcast Watch Party
				</h3>
				<p className="text-xs text-muted-foreground">
					You are the host of this secure peer-to-peer watch party.
					Select the movie file to begin broadcasting.
				</p>
			</div>
			<Button
				onClick={() => {
					const input = document.createElement("input");
					input.type = "file";
					input.accept = "video/*";
					input.onchange = (e) => {
						const files = (e.target as HTMLInputElement).files;
						if (files && files.length > 0) {
							onSelectFile(files[0]);
						}
					};
					input.click();
				}}
				className="px-6 h-10 shadow-lg shadow-primary/25 font-bold"
			>
				Select Video File
			</Button>
		</div>
	);
};
