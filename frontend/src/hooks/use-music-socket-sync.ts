import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import type {
	MusicTrack,
	SharedMusicState,
	MusicSyncUpdate,
	MusicPlayPauseUpdate,
	MusicSeekUpdate,
	MusicTrackUpdate,
} from "@/types";
import { GlobalClock, calculateTargetSeek } from "@/utils/latency-sync";
import { toast } from "@/components/ui/toast";

import type { YTPlayer } from "@/context/use-music";

interface UseMusicSocketSyncParams {
	socket: Socket | null;
	pasteId: string | null;
	isShared: boolean;
	setIsShared: (shared: boolean) => void;
	isInitiator: boolean;
	setIsInitiator: (initiator: boolean) => void;
	setSharedByUser: (user: string | null) => void;
	currentTrack: MusicTrack | null;
	playlist: MusicTrack[];
	isPlaying: boolean;
	currentTime: number;
	shuffle: boolean;
	repeat: "off" | "one" | "all";
	volume: number;
	playTrack: (track: MusicTrack) => void;
	playYt: () => void;
	pauseYt: () => void;
	handleSeek: (seconds: number) => void;
	handleSetVolume: (vol: number) => void;
	setPlaylist: (playlist: MusicTrack[]) => void;
	setShuffle: (shuffle: boolean) => void;
	setRepeat: (repeat: "off" | "one" | "all") => void;
	setIsPlaying: (playing: boolean) => void;
	playerRef: React.RefObject<YTPlayer | null>;
	isPlayerOpen: boolean;
	isMounted: boolean;
	isRemoteActionRef?: React.MutableRefObject<boolean>;
}

export function useMusicSocketSync({
	socket,
	pasteId,
	isShared,
	setIsShared,
	isInitiator,
	setIsInitiator,
	setSharedByUser,
	currentTrack,
	playlist,
	isPlaying,
	currentTime,
	shuffle,
	repeat,
	volume,
	playTrack,
	playYt,
	pauseYt,
	handleSeek,
	handleSetVolume,
	setPlaylist,
	setShuffle,
	setRepeat,
	setIsPlaying,
	playerRef,
	isPlayerOpen,
	isMounted,
	isRemoteActionRef: customRemoteActionRef,
}: UseMusicSocketSyncParams) {
	const defaultRemoteActionRef = useRef(false);
	const isRemoteActionRef = customRemoteActionRef || defaultRemoteActionRef;
	const lastRemoteStateRef = useRef<{
		timestamp: number;
		currentTime: number;
		isPlaying: boolean;
	} | null>(null);
	const globalClockRef = useRef<GlobalClock | null>(null);
	const currentTrackRef = useRef<MusicTrack | null>(currentTrack);
	const isPlayingRef = useRef(isPlaying);
	const currentTimeRef = useRef(currentTime);

	useEffect(() => {
		currentTrackRef.current = currentTrack;
	}, [currentTrack]);

	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	useEffect(() => {
		currentTimeRef.current = currentTime;
	}, [currentTime]);

	// Initialize global latency clock
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
	}, [isPlayerOpen, socket]);

	// DJ host periodic broadcast sync
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
					region: "default",
					shuffle,
					repeat,
					volume,
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
		shuffle,
		repeat,
		volume,
		isRemoteActionRef,
	]);

	// Socket event listeners
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
					if (data.volume !== undefined) handleSetVolume(data.volume);
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
	}, [
		socket,
		pasteId,
		playTrack,
		handleSeek,
		handleSetVolume,
		pauseYt,
		playYt,
		setPlaylist,
		setRepeat,
		setShuffle,
		setIsPlaying,
		setIsShared,
		setIsInitiator,
		setSharedByUser,
		playerRef,
		isRemoteActionRef,
	]);

	// Dynamic playback rate scaling listener
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
				playerRef.current.setPlaybackRate(1.0);
				return;
			}

			const YT = window.YT;
			const localState = playerRef.current.getPlayerState();

			if (localState !== YT.PlayerState.PLAYING) {
				playerRef.current.playVideo();
				if (localState === YT.PlayerState.CUED) {
					toast.add({
						title: "Shared DJ session active. Tap anywhere to listen!",
						timeout: 4000,
						type: "info",
					});
				}
				return;
			}

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
				playerRef.current.seekTo(targetTime, true);
				playerRef.current.setPlaybackRate(1.0);
			} else if (deviation > 0.1) {
				playerRef.current.setPlaybackRate(1.25);
			} else if (deviation < -0.1) {
				playerRef.current.setPlaybackRate(0.75);
			} else {
				playerRef.current.setPlaybackRate(1.0);
			}
		}, 1000);

		const playerSnapshot = playerRef.current;
		return () => {
			clearInterval(syncCheckInterval);
			if (
				playerSnapshot &&
				typeof playerSnapshot.setPlaybackRate === "function"
			) {
				playerSnapshot.setPlaybackRate(1.0);
			}
		};
	}, [isMounted, isShared, isInitiator, playerRef]);

	return {
		isRemoteActionRef,
		lastRemoteStateRef,
		globalClockRef,
	};
}
