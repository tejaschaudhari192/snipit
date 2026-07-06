import { createContext, useContext } from "react";
import type { MusicTrack } from "@/types";
import type { Socket } from "socket.io-client";

export interface YTPlayer {
	loadVideoById: (
		options:
			| string
			| {
					videoId: string;
					startSeconds?: number;
					suggestedQuality?: string;
			  },
	) => void;
	cueVideoById: (
		options:
			| string
			| {
					videoId: string;
					startSeconds?: number;
					suggestedQuality?: string;
			  },
	) => void;
	playVideo: () => void;
	pauseVideo: () => void;
	getPlayerState: () => number;
	seekTo: (seconds: number, allowSeekAhead: boolean) => void;
	setVolume: (volume: number) => void;
	getCurrentTime: () => number;
	getDuration: () => number;
	setPlaybackQuality: (suggestedQuality: string) => void;
	setPlaybackRate: (suggestedRate: number) => void;
	destroy: () => void;
}

export interface YTPlayerOptions {
	videoId?: string;
	height: string;
	width: string;
	playerVars: Record<string, unknown>;
	events: {
		onReady: (event: { target: YTPlayer }) => void;
		onStateChange: (event: { data: number }) => void;
		onError: (error: unknown) => void;
	};
}

declare global {
	interface Window {
		YT: {
			Player: new (id: string, options: YTPlayerOptions) => YTPlayer;
			PlayerState: {
				PLAYING: number;
				PAUSED: number;
				ENDED: number;
				CUED: number;
			};
		};
		onYouTubeIframeAPIReady?: () => void;
	}
}

export interface MusicContextType {
	isPlaying: boolean;
	currentTrack: MusicTrack | null;
	currentIndex: number;
	playlist: MusicTrack[];
	searchResults: MusicTrack[];
	isPlayerOpen: boolean;
	isLoading: boolean;
	isReady: boolean;
	volume: number;
	progress: number;
	duration: number;
	currentTime: number;
	shuffle: boolean;
	repeat: "off" | "one" | "all";
	quality: string;
	play: () => void;
	pause: () => void;
	next: () => void;
	previous: () => void;
	seekTo: (seconds: number) => void;
	setVolume: (vol: number) => void;
	changeQuality: (q: string) => void;
	downloadTrack: (
		videoId: string,
		title: string,
		quality: "128" | "320",
	) => Promise<void>;
	toggleShuffle: () => void;
	toggleRepeat: () => void;
	openPlayer: () => void;
	closePlayer: () => void;
	refreshPlaylist: () => void;
	playAtIndex: (index: number) => void;
	searchTracks: (query: string) => Promise<void>;
	playSearchTrack: (track: MusicTrack) => Promise<void>;
	removeFromQueue: (videoId: string) => void;
	playNext: (track: MusicTrack) => void;
	reorderQueue: (startIndex: number, endIndex: number) => void;
	clearSearch: () => void;
	clearMusic: () => void;
	isShared: boolean;
	isInitiator: boolean;
	sharedByUser: string | null;
	toggleShare: () => void;
	setPasteSocket: (socket: Socket | null, pasteId: string | null) => void;
	pasteId: string | null;
}

export const MusicContext = createContext<MusicContextType | undefined>(
	undefined,
);

export const useMusic = () => {
	const context = useContext(MusicContext);
	if (context === undefined) {
		throw new Error("useMusic must be used within a MusicProvider");
	}
	return context;
};
