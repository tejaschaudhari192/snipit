import { localStore } from "@/utils/storage";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { toast } from "sonner";
import { decodeHtml } from "@/utils";
import { downloadTrack } from "@/utils/music";
import { MusicContext } from "./use-music";
import { GlobalClock, calculateTargetSeek } from "@/utils/latency-sync";
import { useYouTubePlayer } from "@/hooks/use-youtube-player";
import { usePlaylistManager } from "@/hooks/use-playlist-manager";

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);

	const [socket, setSocket] = useState<Socket | null>(null);
	const [pasteId, setPasteId] = useState<string | null>(null);
	const [isShared, setIsShared] = useState(false);
	const [isInitiator, setIsInitiator] = useState(false);
	const [sharedByUser, setSharedByUser] = useState<string | null>(null);

	const isRemoteActionRef = useRef(false);
	const currentTrackRef = useRef<MusicTrack | null>(null);
	const lastTrackIdRef = useRef<string | null>(null);
	const isPlayingRef = useRef(false);
	const lastRemoteStateRef = useRef<{
		timestamp: number;
		currentTime: number;
		isPlaying: boolean;
	} | null>(null);
	const globalClockRef = useRef<GlobalClock | null>(null);
	const currentTimeRef = useRef(0);
	const durationRef = useRef(240);
	const lastSavedTimeRef = useRef(-CONFIG.defaults.musicSaveInterval);

	const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);

	const [isPlayerOpen, setIsPlayerOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [volume, setVolumeState] = useState<number>(() => {
		if (typeof window !== "undefined") {
			const saved = localStore.getItem(CONFIG.storageKeys.musicVolume);
			return saved ? parseInt(saved, 10) : 50;
		}
		return 50;
	});
	const [quality, setQualityState] = useState<string>(() => {
		if (typeof window !== "undefined") {
			const saved = localStore.getItem(CONFIG.storageKeys.musicQuality);
			return saved ?? "tiny";
		}
		return "tiny";
	});
	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [isMounted, setIsMounted] = useState(false);

	const progressInterval = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);

	const handleNextRef = useRef<() => void>(() => {});
	const handleTrackEndRef = useRef<() => void>(() => {});

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const {
		playerRef,
		isReady,
		play: playYt,
		pause: pauseYt,
		seekTo: ytSeekTo,
		loadVideoById,
		cueVideoById,
	} = useYouTubePlayer({
		volume,
		quality,
		onReady: () => {
			if (currentTrackRef.current) {
				const savedTime = parseFloat(
					localStore.getItem(CONFIG.storageKeys.musicPlaytime) || "0",
				);
				cueVideoById(currentTrackRef.current.videoId, savedTime);
				setCurrentTime(savedTime);
			}
		},
		onStateChange: (state) => {
			const YT = window.YT;
			if (state === YT.PlayerState.PLAYING) {
				setIsPlaying(true);
				if (playerRef.current) {
					setDuration(playerRef.current.getDuration());
					if (
						isShared &&
						!isInitiator &&
						lastRemoteStateRef.current
					) {
						const globalTime = globalClockRef.current
							? globalClockRef.current.getGlobalTime()
							: Date.now();
						const targetTime = calculateTargetSeek(
							lastRemoteStateRef.current.timestamp,
							lastRemoteStateRef.current.currentTime,
							lastRemoteStateRef.current.isPlaying,
							globalTime,
						);
						const currentPos = playerRef.current.getCurrentTime();
						if (Math.abs(currentPos - targetTime) > 0.15) {
							ytSeekTo(targetTime);
						}
					}
				}
			} else if (state === YT.PlayerState.PAUSED) {
				setIsPlaying(false);
			} else if (state === YT.PlayerState.ENDED) {
				setIsPlaying(false);
				handleTrackEndRef.current();
			}
		},
		onError: () => {
			console.error("YouTube Player Error");
			handleNextRef.current();
		},
	});

	const {
		playlist,
		setPlaylist,
		currentIndex,
		setCurrentIndex,
		currentTrack,
		setCurrentTrack,
		shuffle,
		setShuffle,
		repeat,
		setRepeat,
		playTrack,
		handleNext,
		handlePrevious,
		clearQueue,
	} = usePlaylistManager({
		onTrackChange: (track) => {
			if (playerRef.current && isReady) {
				try {
					loadVideoById(track.videoId);
					playYt();
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
	});

	const region = "default";

	useEffect(() => {
		if (socket) {
			if (!globalClockRef.current) {
				globalClockRef.current = new GlobalClock(socket);
			} else {
				globalClockRef.current.initialize(socket);
			}
		}
		return () => {
			if (globalClockRef.current) {
				globalClockRef.current.destroy();
				globalClockRef.current = null;
			}
		};
	}, [socket]);

	useEffect(() => {
		currentTrackRef.current = currentTrack;
	}, [currentTrack]);

	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	const fetchTrackDetails = useCallback(
		async (videoIds: string[]): Promise<MusicTrack[]> => {
			if (videoIds.length === 0) return [];
			setIsLoading(true);
			try {
				const response = await fetch(
					`${CONFIG.apiBaseUrl}/music/details?ids=${encodeURIComponent(
						videoIds.join(","),
					)}`,
				);
				if (!response.ok)
					throw new Error("Failed to fetch track details");
				const data = await response.json();

				const decodedTracks = data.tracks.map((track: MusicTrack) => ({
					...track,
					title: decodeHtml(track.title),
					channel: decodeHtml(track.channel),
				}));

				return decodedTracks;
			} catch (error) {
				console.error("Music fetch details error:", error);
				return [];
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		if (isMounted) {
			const savedIdsStr = localStore.getItem(
				CONFIG.storageKeys.musicPlaylistIds,
			);
			let savedIds: string[] = [];
			try {
				savedIds = savedIdsStr ? JSON.parse(savedIdsStr) : [];
			} catch {
				savedIds = [];
			}

			if (savedIds.length > 0) {
				fetchTrackDetails(savedIds).then((tracks) => {
					if (tracks && tracks.length > 0) {
						setPlaylist(tracks);

						const savedTrackId = localStore.getItem(
							CONFIG.storageKeys.musicCurrentTrackId,
						);
						const savedIndex = parseInt(
							localStore.getItem(
								CONFIG.storageKeys.musicCurrentIndex,
							) || "0",
							10,
						);

						if (savedTrackId) {
							const foundIndex = tracks.findIndex(
								(t) => t.videoId === savedTrackId,
							);
							if (foundIndex !== -1) {
								setCurrentTrack(tracks[foundIndex]);
								setCurrentIndex(foundIndex);
								return;
							}
						}

						if (tracks[savedIndex]) {
							setCurrentTrack(tracks[savedIndex]);
							setCurrentIndex(savedIndex);
						} else {
							setCurrentTrack(tracks[0]);
							setCurrentIndex(0);
						}
					}
				});
			}
		}
	}, [isMounted, fetchTrackDetails]);

	useEffect(() => {
		if (isMounted) {
			if (currentTrack) {
				// Only reset playtime if it is a completely different track from the last one (and not the initial restoration on mount)
				if (
					lastTrackIdRef.current !== null &&
					lastTrackIdRef.current !== currentTrack.videoId
				) {
					localStore.setItem(CONFIG.storageKeys.musicPlaytime, "0");
					lastSavedTimeRef.current = 0;
				}
				lastTrackIdRef.current = currentTrack.videoId;
			} else {
				localStore.removeItem(CONFIG.storageKeys.musicPlaytime);
				lastTrackIdRef.current = null;
			}
		}
	}, [currentTrack, isMounted]);

	const handleTrackEnd = useCallback(() => {
		if (repeat === "one") {
			if (currentTrack) {
				playTrack(currentTrack);
			}
		} else {
			handleNextRef.current();
		}
	}, [repeat, currentTrack, playTrack]);

	useEffect(() => {
		handleTrackEndRef.current = handleTrackEnd;
	}, [handleTrackEnd]);

	useEffect(() => {
		handleNextRef.current = handleNext;
	}, [handleNext]);

	const handlePlay = useCallback(async () => {
		if (isReady && playerRef.current) {
			if (currentTrack && !isPlaying) {
				const state =
					typeof playerRef.current.getPlayerState === "function"
						? playerRef.current.getPlayerState()
						: -1;

				if (state === -1) {
					playTrack(currentTrack);
				} else {
					try {
						playYt();
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
			}
		}
	}, [
		isReady,
		playerRef,
		playYt,
		currentTrack,
		isPlaying,
		playlist,
		playTrack,
		isShared,
		socket,
		pasteId,
		currentTime,
	]);

	const handlePause = useCallback(() => {
		if (isReady && playerRef.current) {
			pauseYt();
			setIsPlaying(false);
			if (isShared && !isRemoteActionRef.current && socket && pasteId) {
				socket.emit("music:pause", { pasteId, currentTime });
			}
		}
	}, [isReady, playerRef, pauseYt, isShared, socket, pasteId, currentTime]);

	const handleSeek = useCallback(
		(seconds: number) => {
			if (isReady && playerRef.current) {
				ytSeekTo(seconds);
				setCurrentTime(seconds);
				localStore.setItem(
					CONFIG.storageKeys.musicPlaytime,
					seconds.toFixed(1),
				);
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
		[isReady, playerRef, ytSeekTo, duration, isShared, socket, pasteId],
	);

	const handleSetVolume = useCallback(
		(vol: number) => {
			setVolumeState(vol);
			if (playerRef.current && playerRef.current.setVolume) {
				playerRef.current.setVolume(vol);
			}
			localStore.setItem(CONFIG.storageKeys.musicVolume, vol.toString());

			if (isShared && !isRemoteActionRef.current && socket && pasteId) {
				socket.emit("music:volume", { pasteId, volume: vol });
			}
		},
		[isShared, socket, pasteId],
	);

	const handleChangeQuality = useCallback((newQuality: string) => {
		setQualityState(newQuality);
		localStore.setItem(CONFIG.storageKeys.musicQuality, newQuality);
		if (
			playerRef.current &&
			typeof playerRef.current.setPlaybackQuality === "function"
		) {
			playerRef.current.setPlaybackQuality(newQuality);
		}
		toast.success(
			`Audio quality set to ${newQuality === "tiny" ? "Low" : newQuality === "small" ? "Medium" : newQuality === "medium" ? "High" : "Auto"}`,
		);
	}, []);

	const handleDownloadTrack = useCallback(
		async (
			videoId: string,
			title: string,
			downloadQuality: "128" | "320",
		) => {
			await downloadTrack(videoId, title, downloadQuality);
		},
		[],
	);

	const handleToggleShuffle = useCallback(() => setShuffle((s) => !s), []);

	const handleToggleRepeat = useCallback(() => {
		setRepeat((r) => {
			const modes: ("off" | "one" | "all")[] = ["off", "one", "all"];
			return modes[(modes.indexOf(r) + 1) % modes.length];
		});
	}, []);

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
						const filteredTracks = decodedTracks
							.filter(
								(t: MusicTrack) => t.videoId !== track.videoId,
							)
							.slice(0, 5);
						setPlaylist([track, ...filteredTracks]);
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

	const handleClearMusic = useCallback(() => {
		if (isReady && playerRef.current) {
			try {
				pauseYt();
			} catch (e) {
				console.warn("Failed to pause video during clear:", e);
			}
		}
		setIsPlaying(false);
		clearQueue();
		setSearchResults([]);
		setCurrentTime(0);
		setProgress(0);
		setDuration(0);

		localStore.removeItem(CONFIG.storageKeys.musicPlaylistIds);
		localStore.removeItem(CONFIG.storageKeys.musicCurrentTrackId);
		localStore.removeItem(CONFIG.storageKeys.musicCurrentIndex);
		localStore.removeItem(CONFIG.storageKeys.musicPlaytime);

		if (isShared && socket && pasteId) {
			socket.emit("music:sync", {
				pasteId,
				track: null,
				isPlaying: false,
				currentTime: 0,
				playlist: [],
				shuffle,
				repeat,
			});
		}

		toast.success("Music queue and progress cleared");
	}, [
		isReady,
		playerRef,
		pauseYt,
		clearQueue,
		isShared,
		socket,
		pasteId,
		shuffle,
		repeat,
	]);

	const handleRemoveFromQueue = useCallback(
		(videoId: string) => {
			setPlaylist((prevPlaylist) => {
				const trackIndex = prevPlaylist.findIndex(
					(t) => t.videoId === videoId,
				);
				if (trackIndex === -1) return prevPlaylist;

				const nextPlaylist = prevPlaylist.filter(
					(t) => t.videoId !== videoId,
				);

				if (trackIndex === currentIndex) {
					if (nextPlaylist.length > 0) {
						const newIndex = trackIndex % nextPlaylist.length;
						setCurrentIndex(newIndex);
						setTimeout(() => playTrack(nextPlaylist[newIndex]), 0);
					} else {
						setCurrentTrack(null);
						setIsPlaying(false);
						setCurrentIndex(0);
					}
				} else if (trackIndex < currentIndex) {
					setCurrentIndex((prevIndex) => prevIndex - 1);
				}

				if (isShared && socket && pasteId) {
					socket.emit("music:sync", {
						pasteId,
						track: currentTrackRef.current,
						isPlaying: isPlayingRef.current,
						currentTime: currentTimeRef.current,
						playlist: nextPlaylist,
						shuffle,
						repeat,
					});
				}

				return nextPlaylist;
			});
			toast.success("Removed track from queue");
		},
		[
			currentIndex,
			isShared,
			socket,
			pasteId,
			region,
			shuffle,
			repeat,
			playTrack,
		],
	);

	const handlePlayNext = useCallback(
		(track: MusicTrack) => {
			setPlaylist((prevPlaylist) => {
				const filteredPlaylist = prevPlaylist.filter(
					(t) => t.videoId !== track.videoId,
				);

				let nextPlaylist = [...filteredPlaylist];
				if (filteredPlaylist.length === 0) {
					nextPlaylist = [track];
					setCurrentIndex(0);
					setTimeout(() => playTrack(track), 0);
				} else {
					const insertIndex = currentIndex + 1;
					nextPlaylist.splice(insertIndex, 0, track);
				}

				if (isShared && socket && pasteId) {
					socket.emit("music:sync", {
						pasteId,
						track: currentTrackRef.current,
						isPlaying: isPlayingRef.current,
						currentTime: currentTimeRef.current,
						playlist: nextPlaylist,
						shuffle,
						repeat,
					});
				}

				return nextPlaylist;
			});
			toast.success(`"${track.title}" will play next`);
		},
		[
			currentIndex,
			isShared,
			socket,
			pasteId,
			region,
			shuffle,
			repeat,
			playTrack,
		],
	);

	const handleReorderQueue = useCallback(
		(startIndex: number, endIndex: number) => {
			if (startIndex === endIndex) return;
			setPlaylist((prevPlaylist) => {
				const nextPlaylist = [...prevPlaylist];
				const [removed] = nextPlaylist.splice(startIndex, 1);
				nextPlaylist.splice(endIndex, 0, removed);

				const activeTrack = currentTrackRef.current;
				if (activeTrack) {
					const newIndex = nextPlaylist.findIndex(
						(t) => t.videoId === activeTrack.videoId,
					);
					if (newIndex !== -1) {
						setCurrentIndex(newIndex);
					}
				}

				if (isShared && socket && pasteId) {
					socket.emit("music:sync", {
						pasteId,
						track: currentTrackRef.current,
						isPlaying: isPlayingRef.current,
						currentTime: currentTimeRef.current,
						playlist: nextPlaylist,
						shuffle,
						repeat,
					});
				}

				return nextPlaylist;
			});
		},
		[isShared, socket, pasteId, shuffle, repeat],
	);

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

				if (
					Math.floor(nextTime) % CONFIG.defaults.musicSaveInterval ===
						0 &&
					Math.floor(nextTime) >=
						lastSavedTimeRef.current +
							CONFIG.defaults.musicSaveInterval
				) {
					lastSavedTimeRef.current = Math.floor(nextTime);
					localStore.setItem(
						CONFIG.storageKeys.musicPlaytime,
						nextTime.toFixed(1),
					);
				}
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
			volume,
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
		volume,
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
					// Cache remote state for late-loading players
					lastRemoteStateRef.current = {
						timestamp: data.lastSyncedAt,
						currentTime: data.currentTime,
						isPlaying: data.isPlaying,
					};

					if (data.track) {
						if (
							currentTrackRef.current?.videoId !==
							data.track.videoId
						) {
							playTrack(data.track);
						}

						const globalTime = globalClockRef.current
							? globalClockRef.current.getGlobalTime()
							: Date.now();
						const targetTime = calculateTargetSeek(
							data.lastSyncedAt,
							data.currentTime,
							data.isPlaying,
							globalTime,
						);

						if (data.isPlaying) {
							playYt();
							setIsPlaying(true);
						} else {
							pauseYt();
							setIsPlaying(false);
						}

						if (targetTime > 0) {
							handleSeek(targetTime);
						}
					}
					if (data.playlist) setPlaylist(data.playlist);
					if (data.shuffle !== undefined) setShuffle(data.shuffle);
					if (data.repeat) setRepeat(data.repeat);

					// Sync volume state from share session
					if (data.volume !== undefined) {
						handleSetVolume(data.volume);
					}
				}
			} else {
				setIsShared(false);
				setIsInitiator(false);
				setSharedByUser(null);
				lastRemoteStateRef.current = null;
			}
			isRemoteActionRef.current = false;
		};

		const handleSyncUpdate = (
			data: MusicSyncUpdate & { volume?: number },
		) => {
			isRemoteActionRef.current = true;
			if (data.playlist) setPlaylist(data.playlist);
			if (data.shuffle !== undefined) setShuffle(data.shuffle);
			if (data.repeat) setRepeat(data.repeat);

			// Cache remote state for late-loading players
			lastRemoteStateRef.current = {
				timestamp: data.timestamp,
				currentTime: data.currentTime,
				isPlaying: data.isPlaying,
			};

			if (
				data.track &&
				currentTrackRef.current?.videoId !== data.track.videoId
			) {
				playTrack(data.track);
			}

			if (data.isPlaying && !isPlayingRef.current) {
				playYt();
				setIsPlaying(true);
			} else if (!data.isPlaying && isPlayingRef.current) {
				pauseYt();
				setIsPlaying(false);
			}

			const globalTime = globalClockRef.current
				? globalClockRef.current.getGlobalTime()
				: Date.now();
			const targetTime = calculateTargetSeek(
				data.timestamp,
				data.currentTime,
				data.isPlaying,
				globalTime,
			);

			if (Math.abs(currentTimeRef.current - targetTime) > 0.15) {
				handleSeek(targetTime);
			}

			if (data.volume !== undefined) {
				handleSetVolume(data.volume);
			}

			isRemoteActionRef.current = false;
		};

		const handlePlayUpdate = (data: MusicPlayPauseUpdate) => {
			isRemoteActionRef.current = true;
			playYt();
			setIsPlaying(true);
			if (data.currentTime !== undefined) {
				lastRemoteStateRef.current = {
					timestamp: Date.now(),
					currentTime: data.currentTime,
					isPlaying: true,
				};

				const globalTime = globalClockRef.current
					? globalClockRef.current.getGlobalTime()
					: Date.now();
				const targetTime = calculateTargetSeek(
					Date.now(),
					data.currentTime,
					true,
					globalTime,
				);

				if (Math.abs(currentTimeRef.current - targetTime) > 0.15) {
					handleSeek(targetTime);
				}
			}
			isRemoteActionRef.current = false;
		};

		const handlePauseUpdate = (data: MusicPlayPauseUpdate) => {
			isRemoteActionRef.current = true;
			playerRef.current?.pauseVideo();
			setIsPlaying(false);
			if (data.currentTime !== undefined) {
				lastRemoteStateRef.current = {
					timestamp: Date.now(),
					currentTime: data.currentTime,
					isPlaying: false,
				};

				if (
					Math.abs(currentTimeRef.current - data.currentTime) > 0.15
				) {
					handleSeek(data.currentTime);
				}
			}
			isRemoteActionRef.current = false;
		};

		const handleSeekUpdate = (data: MusicSeekUpdate) => {
			isRemoteActionRef.current = true;
			lastRemoteStateRef.current = {
				timestamp: Date.now(),
				currentTime: data.currentTime,
				isPlaying: isPlayingRef.current,
			};

			if (Math.abs(currentTimeRef.current - data.currentTime) > 0.15) {
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

		const handleVolumeUpdate = (data: { volume: number }) => {
			isRemoteActionRef.current = true;
			handleSetVolume(data.volume);
			isRemoteActionRef.current = false;
		};

		socket.on("music:share-state", handleShareState);
		socket.on("music:sync-update", handleSyncUpdate);
		socket.on("music:play-update", handlePlayUpdate);
		socket.on("music:pause-update", handlePauseUpdate);
		socket.on("music:seek-update", handleSeekUpdate);
		socket.on("music:track-update", handleTrackUpdate);
		socket.on("music:volume-update", handleVolumeUpdate);

		// Request state when joining
		socket.emit("music:request-state", { pasteId });

		return () => {
			socket.off("music:share-state", handleShareState);
			socket.off("music:sync-update", handleSyncUpdate);
			socket.off("music:play-update", handlePlayUpdate);
			socket.off("music:pause-update", handlePauseUpdate);
			socket.off("music:seek-update", handleSeekUpdate);
			socket.off("music:track-update", handleTrackUpdate);
			socket.off("music:volume-update", handleVolumeUpdate);
		};
	}, [socket, pasteId, playTrack, handleSeek, handleSetVolume]);

	useEffect(() => {
		if (!isMounted || !isShared || isInitiator) return;

		const syncCheckInterval = setInterval(() => {
			if (
				!playerRef.current ||
				typeof playerRef.current.getPlayerState !== "function" ||
				typeof playerRef.current.getCurrentTime !== "function" ||
				typeof playerRef.current.setPlaybackRate !== "function"
			) {
				return;
			}

			const remoteState = lastRemoteStateRef.current;
			if (!remoteState || !remoteState.isPlaying) {
				// Reset speed to normal if not playing
				playerRef.current.setPlaybackRate(1.0);
				return;
			}

			const YT = window.YT;
			const localState = playerRef.current.getPlayerState();

			// Autoplay/Unstarted recovery: force play if DJ is playing but we are paused/cued
			if (localState !== YT.PlayerState.PLAYING) {
				playerRef.current.playVideo();

				// Show non-intrusive gesture prompt if cued
				if (localState === YT.PlayerState.CUED) {
					toast.info(
						"Shared DJ session active. Tap anywhere on the page to start listening!",
						{
							id: "autoplay-restore-toast",
							duration: 4000,
						},
					);
				}
				return;
			}

			// Dynamic rate scaling sync:
			const globalTime = globalClockRef.current
				? globalClockRef.current.getGlobalTime()
				: Date.now();
			const targetTime = calculateTargetSeek(
				remoteState.timestamp,
				remoteState.currentTime,
				remoteState.isPlaying,
				globalTime,
			);
			const currentPos = playerRef.current.getCurrentTime();
			const deviation = targetTime - currentPos;

			if (Math.abs(deviation) > 1.5) {
				// Large deviation: perform a hard seek to align instantly
				playerRef.current.seekTo(targetTime, true);
				playerRef.current.setPlaybackRate(1.0);
			} else if (deviation > 0.1) {
				// Slightly behind: play 25% faster to catch up seamlessly without buffering
				playerRef.current.setPlaybackRate(1.25);
			} else if (deviation < -0.1) {
				// Slightly ahead: play 25% slower to let the stream align seamlessly
				playerRef.current.setPlaybackRate(0.75);
			} else {
				// Perfectly aligned: maintain normal speed
				playerRef.current.setPlaybackRate(1.0);
			}
		}, 1000);

		return () => {
			clearInterval(syncCheckInterval);
			if (
				playerRef.current &&
				typeof playerRef.current.setPlaybackRate === "function"
			) {
				playerRef.current.setPlaybackRate(1.0);
			}
		};
	}, [isMounted, isShared, isInitiator]);

	return (
		<MusicContext.Provider
			value={{
				isPlaying,
				currentTrack,
				currentIndex,
				playlist,
				searchResults,
				isPlayerOpen,
				isLoading,
				isReady,
				volume,
				progress,
				duration,
				currentTime,
				shuffle,
				repeat,
				quality,
				play: handlePlay,
				pause: handlePause,
				next: handleNext,
				previous: handlePrevious,
				seekTo: handleSeek,
				setVolume: handleSetVolume,
				changeQuality: handleChangeQuality,
				downloadTrack: handleDownloadTrack,
				toggleShuffle: handleToggleShuffle,
				toggleRepeat: handleToggleRepeat,
				openPlayer: () => setIsPlayerOpen(true),
				closePlayer: () => setIsPlayerOpen(false),
				refreshPlaylist: () => {},
				playAtIndex: handlePlayAtIndex,
				searchTracks: handleSearchTracks,
				playSearchTrack: handlePlaySearchTrack,
				removeFromQueue: handleRemoveFromQueue,
				playNext: handlePlayNext,
				reorderQueue: handleReorderQueue,
				clearSearch: handleClearSearch,
				clearMusic: handleClearMusic,
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
