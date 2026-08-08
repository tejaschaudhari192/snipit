export interface MusicTrack {
	videoId: string;
	title: string;
	channel: string;
	thumbnail: string;
	duration?: string;
}

export interface SharedMusicState {
	enabled: boolean;
	initiatorSocketId: string;
	track: MusicTrack | null;
	isPlaying: boolean;
	currentTime: number;
	lastSyncedAt: number;
	playlist: MusicTrack[];
	region: string;
	shuffle: boolean;
	repeat: "off" | "one" | "all";
	volume?: number;
}

export type PlaybackAction =
	| { type: "play"; currentTime?: number }
	| { type: "pause"; currentTime?: number }
	| { type: "seek"; currentTime: number }
	| { type: "track-change"; track: MusicTrack; currentIndex: number }
	| { type: "next" }
	| { type: "previous" };

export interface MusicSyncUpdate {
	track: MusicTrack | null;
	isPlaying: boolean;
	currentTime: number;
	playlist: MusicTrack[];
	region: string;
	shuffle: boolean;
	repeat: "off" | "one" | "all";
	timestamp: number;
}

export interface MusicPlayPauseUpdate {
	currentTime?: number;
}

export interface MusicSeekUpdate {
	currentTime: number;
}

export interface MusicTrackUpdate {
	track: MusicTrack | null;
	currentIndex?: number;
}
