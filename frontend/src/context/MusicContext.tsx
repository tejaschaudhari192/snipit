import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	useCallback,
} from "react";
import type { MusicTrack } from "@/types";
import { CONFIG } from "@/configurations";
import { useLocation } from "@/hooks/use-location";
import { toast } from "sonner";
import { decodeHtml } from "@/utils";

interface YTPlayer {
	loadVideoById: (id: string) => void;
	playVideo: () => void;
	pauseVideo: () => void;
	getPlayerState: () => number;
	seekTo: (seconds: number, allowSeekAhead: boolean) => void;
	setVolume: (volume: number) => void;
	getCurrentTime: () => number;
	getDuration: () => number;
}

interface YTPlayerOptions {
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

interface MusicContextType {
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
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { region: detectedRegion } = useLocation();

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
	const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
	const [region, setRegion] = useState("default");
	const [regionDisplayName, setRegionDisplayName] = useState("Hindi");
	const [isPlayerOpen, setIsPlayerOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isReady, setIsReady] = useState(false);
	const [volume, setVolumeState] = useState(50);
	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [shuffle, setShuffle] = useState(false);
	const [repeat, setRepeat] = useState<"off" | "one" | "all">("all");
	const [isMounted, setIsMounted] = useState(false);

	const playerRef = useRef<YTPlayer | null>(null);
	const progressInterval = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);

	const handleNextRef = useRef<() => void>(() => {});
	const handleTrackEndRef = useRef<() => void>(() => {});

	useEffect(() => {
		setIsMounted(true);
		const savedRegion = localStorage.getItem(
			CONFIG.storageKeys.musicRegion,
		);
		if (savedRegion) setRegion(savedRegion);
	}, []);

	const fetchPlaylist = useCallback(
		async (targetRegion: string): Promise<MusicTrack[]> => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`${CONFIG.apiBaseUrl}/music/playlist?region=${targetRegion}`,
				);
				if (!response.ok) throw new Error("Failed to fetch playlist");
				const data = await response.json();

				const decodedTracks = data.tracks.map((track: MusicTrack) => ({
					...track,
					title: decodeHtml(track.title),
					channel: decodeHtml(track.channel),
				}));

				setPlaylist(decodedTracks);
				setRegion(data.region);
				setRegionDisplayName(data.displayName);
				if (decodedTracks.length > 0) {
					setCurrentTrack(decodedTracks[0]);
					setCurrentIndex(0);
				}
				return decodedTracks;
			} catch (error) {
				console.error("Music fetch error:", error);
				toast.error("Failed to load music playlist");
				return [];
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const playTrack = useCallback(
		(track: MusicTrack) => {
			if (playerRef.current && isReady) {
				try {
					playerRef.current.loadVideoById(track.videoId);
					playerRef.current.playVideo();
					setCurrentTrack(track);
					setIsPlaying(true);
				} catch (error) {
					console.error("Playback error:", error);
					handleNextRef.current();
				}
			}
		},
		[isReady],
	);

	const handleTrackEnd = useCallback(() => {
		if (repeat === "one") {
			playTrack(currentTrack!);
		} else {
			handleNextRef.current();
		}
	}, [repeat, currentTrack, playTrack]);

	useEffect(() => {
		handleTrackEndRef.current = handleTrackEnd;
	}, [handleTrackEnd]);

	const handleNext = useCallback(() => {
		if (playlist.length === 0) return;
		let nextIndex;
		if (shuffle) {
			nextIndex = Math.floor(Math.random() * playlist.length);
		} else {
			nextIndex = (currentIndex + 1) % playlist.length;
		}
		setCurrentIndex(nextIndex);
		playTrack(playlist[nextIndex]);
	}, [playlist, shuffle, currentIndex, playTrack]);

	useEffect(() => {
		handleNextRef.current = handleNext;
	}, [handleNext]);

	const handlePrevious = useCallback(() => {
		if (playlist.length === 0) return;
		const prevIndex =
			(currentIndex - 1 + playlist.length) % playlist.length;
		setCurrentIndex(prevIndex);
		playTrack(playlist[prevIndex]);
	}, [playlist, currentIndex, playTrack]);

	const initPlayer = useCallback(() => {
		if (playerRef.current) return;
		if (!document.getElementById("yt-music-player")) {
			console.warn(
				"YouTube player container not found, delaying init...",
			);
			return;
		}

		playerRef.current = new window.YT.Player("yt-music-player", {
			height: "0",
			width: "0",
			playerVars: {
				autoplay: 0,
				controls: 0,
				disablekb: 1,
				fs: 0,
				rel: 0,
				showinfo: 0,
				iv_load_policy: 3,
				origin: window.location.origin,
				enablejsapi: 1,
				widget_referrer: window.location.origin,
				host: "https://www.youtube.com",
			},
			events: {
				onReady: (event: { target: YTPlayer }) => {
					setIsReady(true);
					event.target.setVolume(volume);
				},
				onStateChange: (event: { data: number }) => {
					const YT = window.YT;
					if (event.data === YT.PlayerState.PLAYING) {
						setIsPlaying(true);
						if (playerRef.current) {
							setDuration(playerRef.current.getDuration());
						}
					} else if (event.data === YT.PlayerState.PAUSED) {
						setIsPlaying(false);
					} else if (event.data === YT.PlayerState.ENDED) {
						setIsPlaying(false);
						handleTrackEndRef.current();
					}
				},
				onError: () => {
					console.error("YouTube Player Error");
					handleNextRef.current();
				},
			},
		});
	}, [volume]);

	const handlePlay = useCallback(async () => {
		if (playerRef.current) {
			if (currentTrack && !isPlaying) {
				const state =
					typeof playerRef.current.getPlayerState === "function"
						? playerRef.current.getPlayerState()
						: -1;

				if (state === -1 || state === 5) {
					playTrack(currentTrack);
				} else {
					try {
						playerRef.current.playVideo();
					} catch {
						playTrack(currentTrack);
					}
				}
			} else if (!currentTrack && playlist.length > 0) {
				playTrack(playlist[0]);
			} else if (!currentTrack && playlist.length === 0) {
				const savedRegion =
					localStorage.getItem(CONFIG.storageKeys.musicRegion) ||
					detectedRegion;
				const tracks = await fetchPlaylist(savedRegion);
				if (tracks && tracks.length > 0) {
					playTrack(tracks[0]);
				}
			}
		} else {
			initPlayer();
		}
	}, [
		currentTrack,
		isPlaying,
		playlist,
		detectedRegion,
		fetchPlaylist,
		playTrack,
		initPlayer,
	]);

	const handlePause = useCallback(() => {
		if (playerRef.current && playerRef.current.pauseVideo) {
			playerRef.current.pauseVideo();
		}
	}, []);

	const handleSeek = useCallback(
		(seconds: number) => {
			if (playerRef.current && playerRef.current.seekTo) {
				playerRef.current.seekTo(seconds, true);
				setCurrentTime(seconds);
				if (duration > 0) {
					setProgress((seconds / duration) * 100);
				}
			}
		},
		[duration],
	);

	const handleSetVolume = useCallback((vol: number) => {
		setVolumeState(vol);
		if (playerRef.current && playerRef.current.setVolume) {
			playerRef.current.setVolume(vol);
		}
		localStorage.setItem(CONFIG.storageKeys.musicVolume, vol.toString());
	}, []);

	const handleToggleShuffle = useCallback(() => setShuffle((s) => !s), []);

	const handleToggleRepeat = useCallback(() => {
		setRepeat((r) => {
			const modes: ("off" | "one" | "all")[] = ["off", "one", "all"];
			return modes[(modes.indexOf(r) + 1) % modes.length];
		});
	}, []);

	const handleChangeRegion = useCallback(
		async (newRegion: string) => {
			localStorage.setItem(CONFIG.storageKeys.musicRegion, newRegion);
			const tracks = await fetchPlaylist(newRegion);
			if (tracks && tracks.length > 0) {
				playTrack(tracks[0]);
			}
			toast.success(`Playing ${newRegion} music`);
		},
		[fetchPlaylist, playTrack],
	);

	const handlePlayAtIndex = useCallback(
		(index: number) => {
			if (playlist[index]) {
				setCurrentIndex(index);
				playTrack(playlist[index]);
			}
		},
		[playlist, playTrack],
	);

	const handleSearchTracks = useCallback(async (query: string) => {
		if (!query.trim()) return;
		setIsLoading(true);
		try {
			const response = await fetch(
				`${CONFIG.apiBaseUrl}/music/search?q=${encodeURIComponent(query)}`,
			);
			if (!response.ok) throw new Error("Search failed");
			const data = await response.json();

			if (data.tracks && data.tracks.length > 0) {
				const decodedTracks = data.tracks.map((track: MusicTrack) => ({
					...track,
					title: decodeHtml(track.title),
					channel: decodeHtml(track.channel),
				}));
				setSearchResults(decodedTracks);
				toast.success(
					`Found ${decodedTracks.length} tracks for "${query}"`,
				);
			} else {
				toast.error("No tracks found on YouTube");
			}
		} catch (error) {
			console.error("Search error:", error);
			toast.error("Failed to search YouTube");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handlePlaySearchTrack = useCallback(
		async (track: MusicTrack) => {
			setCurrentTrack(track);
			playTrack(track);
			setSearchResults([]);

			setIsLoading(true);
			try {
				const response = await fetch(
					`${CONFIG.apiBaseUrl}/music/search?q=${encodeURIComponent(track.channel)}`,
				);
				if (response.ok) {
					const data = await response.json();
					if (data.tracks && data.tracks.length > 0) {
						const decodedTracks = data.tracks.map(
							(t: MusicTrack) => ({
								...t,
								title: decodeHtml(t.title),
								channel: decodeHtml(t.channel),
							}),
						);
						setPlaylist(decodedTracks);
						setCurrentIndex(0);
					}
				}
			} catch (error) {
				console.error(
					"Failed to fetch related recommendations:",
					error,
				);
			} finally {
				setIsLoading(false);
			}
		},
		[playTrack],
	);

	const handleClearSearch = useCallback(() => setSearchResults([]), []);

	const currentTimeRef = useRef(0);
	const durationRef = useRef(240);

	useEffect(() => {
		currentTimeRef.current = currentTime;
	}, [currentTime]);

	useEffect(() => {
		durationRef.current = duration;
	}, [duration]);

	useEffect(() => {
		if (isPlaying) {
			progressInterval.current = setInterval(() => {
				let ytTime = -1;
				let ytDur = -1;

				try {
					if (
						playerRef.current &&
						typeof playerRef.current.getCurrentTime === "function"
					) {
						ytTime = playerRef.current.getCurrentTime();
						ytDur = playerRef.current.getDuration();
					}
				} catch (e) {
					console.warn(
						"YouTube API getCurrentTime failed inside progress interval:",
						e,
					);
				}

				let nextTime = currentTimeRef.current;
				if (ytTime >= 0) {
					nextTime = ytTime;
				} else {
					nextTime = currentTimeRef.current + 0.2;
				}

				let nextDur =
					durationRef.current > 0 ? durationRef.current : 240;
				if (ytDur > 0) {
					nextDur = ytDur;
				}

				if (nextTime > nextDur) {
					nextTime = 0;
					setTimeout(() => handleNextRef.current(), 0);
				}

				setCurrentTime(nextTime);
				setDuration(nextDur);
				setProgress((nextTime / nextDur) * 100);
			}, 200);
		} else {
			if (progressInterval.current)
				clearInterval(progressInterval.current);
		}
		return () => {
			if (progressInterval.current)
				clearInterval(progressInterval.current);
		};
	}, [isPlaying]);

	useEffect(() => {
		if (!isMounted) return;

		const checkAndInit = () => {
			if (window.YT && window.YT.Player) {
				initPlayer();
			}
		};

		if (!window.YT || !window.YT.Player) {
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			const firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

			window.onYouTubeIframeAPIReady = checkAndInit;
		} else {
			checkAndInit();
		}

		return () => {
			if (progressInterval.current)
				clearInterval(progressInterval.current);
		};
	}, [isMounted, initPlayer]);

	return (
		<MusicContext.Provider
			value={{
				isPlaying,
				currentTrack,
				currentIndex,
				playlist,
				searchResults,
				region,
				regionDisplayName,
				isPlayerOpen,
				isLoading,
				isReady,
				volume,
				progress,
				duration,
				currentTime,
				shuffle,
				repeat,
				play: handlePlay,
				pause: handlePause,
				next: handleNext,
				previous: handlePrevious,
				seekTo: handleSeek,
				setVolume: handleSetVolume,
				toggleShuffle: handleToggleShuffle,
				toggleRepeat: handleToggleRepeat,
				openPlayer: () => setIsPlayerOpen(true),
				closePlayer: () => setIsPlayerOpen(false),
				changeRegion: handleChangeRegion,
				refreshPlaylist: () => fetchPlaylist(region),
				playAtIndex: handlePlayAtIndex,
				searchTracks: handleSearchTracks,
				playSearchTrack: handlePlaySearchTrack,
				clearSearch: handleClearSearch,
			}}
		>
			{children}
			{isMounted && (
				<div
					style={{
						position: "absolute",
						width: "1px",
						height: "1px",
						padding: "0",
						margin: "-1px",
						overflow: "hidden",
						clip: "rect(0, 0, 0, 0)",
						whiteSpace: "nowrap",
						borderWidth: "0",
						pointerEvents: "none",
					}}
					aria-hidden="true"
				>
					<div id="yt-music-player"></div>
				</div>
			)}
		</MusicContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMusic = () => {
	const context = useContext(MusicContext);
	if (context === undefined) {
		throw new Error("useMusic must be used within a MusicProvider");
	}
	return context;
};
