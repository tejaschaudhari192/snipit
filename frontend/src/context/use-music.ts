import { createContext, useContext } from "react";
import type { MusicTrack } from "@/types";
import type { Socket } from "socket.io-client";

export interface YTPlayer {
	loadVideoById: (id: string) => void;
	playVideo: () => void;
	pauseVideo: () => void;
	getPlayerState: () => number;
	seekTo: (seconds: number, allowSeekAhead: boolean) => void;
	setVolume: (volume: number) => void;
	getCurrentTime: () => number;
	getDuration: () => number;
}

export interface YTPlayerOptions {
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
	region: string;
	regionDisplayName: string;
	isPlayerOpen: boolean;
	isLoading: boolean;
	isReady: boolean;
	volume: number;
	progress: number;
	duration: number;
	currentTime: number;
	shuffle: boolean;
	repeat: "off" | "one" | "all";
	play: () => void;
	pause: () => void;
	next: () => void;
	previous: () => void;
	seekTo: (seconds: number) => void;
	setVolume: (vol: number) => void;
	toggleShuffle: () => void;
	toggleRepeat: () => void;
	openPlayer: () => void;
	closePlayer: () => void;
	changeRegion: (region: string) => void;
	refreshPlaylist: () => void;
	playAtIndex: (index: number) => void;
	searchTracks: (query: string) => Promise<void>;
	playSearchTrack: (track: MusicTrack) => Promise<void>;
	clearSearch: () => void;
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
