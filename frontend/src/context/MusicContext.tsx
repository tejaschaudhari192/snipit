import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	useCallback,
} from "react";
import type {
	MusicTrack,
	SharedMusicState,
	MusicSyncUpdate,
	MusicPlayPauseUpdate,
	MusicSeekUpdate,
	MusicTrackUpdate,
} from "@/types";
import type { Socket } from "socket.io-client";
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
	isShared: boolean;
	isInitiator: boolean;
	sharedByUser: string | null;
	toggleShare: () => void;
	setPasteSocket: (socket: Socket | null, pasteId: string | null) => void;
	pasteId: string | null;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { region: detectedRegion } = useLocation();

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);

	const [socket, setSocket] = useState<Socket | null>(null);
	const [pasteId, setPasteId] = useState<string | null>(null);
	const [isShared, setIsShared] = useState(false);
	const [isInitiator, setIsInitiator] = useState(false);
	const [sharedByUser, setSharedByUser] = useState<string | null>(null);

	const isRemoteActionRef = useRef(false);
	const currentTrackRef = useRef<MusicTrack | null>(null);
	const isPlayingRef = useRef(false);

	useEffect(() => {
		currentTrackRef.current = currentTrack;
	}, [currentTrack]);

	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);
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

					if (
						isShared &&
						!isRemoteActionRef.current &&
						socket &&
						pasteId
					) {
						socket.emit("music:track-change", { pasteId, track });
					}
				} catch (error) {
					console.error("Playback error:", error);
					handleNextRef.current();
				}
			}
		},
		[isReady, isShared, socket, pasteId],
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
						setIsPlaying(true);
						if (
							isShared &&
							!isRemoteActionRef.current &&
							socket &&
							pasteId
						) {
							socket.emit("music:play", { pasteId, currentTime });
						}
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
		isShared,
		socket,
		pasteId,
		currentTime,
	]);

	const handlePause = useCallback(() => {
		if (playerRef.current && playerRef.current.pauseVideo) {
			playerRef.current.pauseVideo();
			setIsPlaying(false);
			if (isShared && !isRemoteActionRef.current && socket && pasteId) {
				socket.emit("music:pause", { pasteId, currentTime });
			}
		}
	}, [isShared, socket, pasteId, currentTime]);

	const handleSeek = useCallback(
		(seconds: number) => {
			if (playerRef.current && playerRef.current.seekTo) {
				playerRef.current.seekTo(seconds, true);
				setCurrentTime(seconds);
				if (duration > 0) {
					setProgress((seconds / duration) * 100);
				}
				if (
					isShared &&
					!isRemoteActionRef.current &&
					socket &&
					pasteId
				) {
					socket.emit("music:seek", {
						pasteId,
						currentTime: seconds,
					});
				}
			}
		},
		[duration, isShared, socket, pasteId],
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

	const toggleShare = useCallback(() => {
		if (!socket || !pasteId) return;
		const nextShared = !isShared;
		socket.emit("music:share-toggle", {
			pasteId,
			enabled: nextShared,
			track: currentTrack,
			isPlaying,
			currentTime,
			playlist,
			region,
			shuffle,
			repeat,
		});
	}, [
		socket,
		pasteId,
		isShared,
		currentTrack,
		isPlaying,
		currentTime,
		playlist,
		region,
		shuffle,
		repeat,
	]);

	const setPasteSocket = useCallback(
		(newSocket: Socket | null, newPasteId: string | null) => {
			setSocket(newSocket);
			setPasteId(newPasteId);
		},
		[],
	);

	// Periodic sync from initiator/DJ to listeners
	useEffect(() => {
		if (isShared && isInitiator && socket && pasteId && isPlaying) {
			const syncInterval = setInterval(() => {
				if (isRemoteActionRef.current) return;
				socket.emit("music:sync", {
					pasteId,
					track: currentTrack,
					isPlaying,
					currentTime,
					playlist,
					region,
					shuffle,
					repeat,
				});
			}, 3000);
			return () => clearInterval(syncInterval);
		}
	}, [
		isShared,
		isInitiator,
		socket,
		pasteId,
		isPlaying,
		currentTrack,
		currentTime,
		playlist,
		region,
		shuffle,
		repeat,
	]);

	// Socket listener subscriptions
	useEffect(() => {
		if (!socket || !pasteId) {
			setIsShared(false);
			setIsInitiator(false);
			setSharedByUser(null);
			return;
		}

		const handleShareState = (data: SharedMusicState) => {
			isRemoteActionRef.current = true;
			if (data.enabled) {
				setIsShared(true);
				const initiator = data.initiatorSocketId === socket.id;
				setIsInitiator(initiator);

				setSharedByUser(initiator ? "You" : "DJ");

				if (!initiator) {
					if (data.track) {
						if (
							currentTrackRef.current?.videoId !==
							data.track.videoId
						) {
							playTrack(data.track);
						}
						setTimeout(() => {
							if (data.isPlaying) {
								playerRef.current?.playVideo();
								setIsPlaying(true);
							} else {
								playerRef.current?.pauseVideo();
								setIsPlaying(false);
							}
							const latency =
								(Date.now() - data.lastSyncedAt) / 1000;
							const targetTime =
								data.currentTime +
								(data.isPlaying ? latency : 0);
							if (targetTime > 0) {
								handleSeek(targetTime);
							}
						}, 300);
					}
					if (data.playlist) setPlaylist(data.playlist);
					if (data.region) setRegion(data.region);
					if (data.shuffle !== undefined) setShuffle(data.shuffle);
					if (data.repeat) setRepeat(data.repeat);
				}
			} else {
				setIsShared(false);
				setIsInitiator(false);
				setSharedByUser(null);
			}
			isRemoteActionRef.current = false;
		};

		const handleSyncUpdate = (data: MusicSyncUpdate) => {
			isRemoteActionRef.current = true;
			if (data.playlist) setPlaylist(data.playlist);
			if (data.region) setRegion(data.region);
			if (data.shuffle !== undefined) setShuffle(data.shuffle);
			if (data.repeat) setRepeat(data.repeat);

			if (
				data.track &&
				currentTrackRef.current?.videoId !== data.track.videoId
			) {
				playTrack(data.track);
			}

			setTimeout(() => {
				if (data.isPlaying && !isPlayingRef.current) {
					playerRef.current?.playVideo();
					setIsPlaying(true);
				} else if (!data.isPlaying && isPlayingRef.current) {
					playerRef.current?.pauseVideo();
					setIsPlaying(false);
				}

				const networkLatency = (Date.now() - data.timestamp) / 1000;
				const targetTime =
					data.currentTime + (data.isPlaying ? networkLatency : 0);
				if (Math.abs(currentTimeRef.current - targetTime) > 2.5) {
					handleSeek(targetTime);
				}
			}, 300);

			isRemoteActionRef.current = false;
		};

		const handlePlayUpdate = (data: MusicPlayPauseUpdate) => {
			isRemoteActionRef.current = true;
			playerRef.current?.playVideo();
			setIsPlaying(true);
			if (
				data.currentTime !== undefined &&
				Math.abs(currentTimeRef.current - data.currentTime) > 2.5
			) {
				handleSeek(data.currentTime);
			}
			isRemoteActionRef.current = false;
		};

		const handlePauseUpdate = (data: MusicPlayPauseUpdate) => {
			isRemoteActionRef.current = true;
			playerRef.current?.pauseVideo();
			setIsPlaying(false);
			if (
				data.currentTime !== undefined &&
				Math.abs(currentTimeRef.current - data.currentTime) > 2.5
			) {
				handleSeek(data.currentTime);
			}
			isRemoteActionRef.current = false;
		};

		const handleSeekUpdate = (data: MusicSeekUpdate) => {
			isRemoteActionRef.current = true;
			if (Math.abs(currentTimeRef.current - data.currentTime) > 2.5) {
				handleSeek(data.currentTime);
			}
			isRemoteActionRef.current = false;
		};

		const handleTrackUpdate = (data: MusicTrackUpdate) => {
			isRemoteActionRef.current = true;
			if (data.track) {
				playTrack(data.track);
			}
			isRemoteActionRef.current = false;
		};

		socket.on("music:share-state", handleShareState);
		socket.on("music:sync-update", handleSyncUpdate);
		socket.on("music:play-update", handlePlayUpdate);
		socket.on("music:pause-update", handlePauseUpdate);
		socket.on("music:seek-update", handleSeekUpdate);
		socket.on("music:track-update", handleTrackUpdate);

		// Request state when joining
		socket.emit("music:request-state", { pasteId });

		return () => {
			socket.off("music:share-state", handleShareState);
			socket.off("music:sync-update", handleSyncUpdate);
			socket.off("music:play-update", handlePlayUpdate);
			socket.off("music:pause-update", handlePauseUpdate);
			socket.off("music:seek-update", handleSeekUpdate);
			socket.off("music:track-update", handleTrackUpdate);
		};
	}, [socket, pasteId, playTrack, handleSeek]);

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
				isShared,
				isInitiator,
				sharedByUser,
				toggleShare,
				setPasteSocket,
				pasteId,
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
