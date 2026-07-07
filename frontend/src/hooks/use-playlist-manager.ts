import { localStore } from "@/utils/storage";
import { useState, useCallback, useEffect } from "react";
import { type MusicTrack } from "@/types";
import { CONFIG } from "@/configurations";

interface UsePlaylistManagerProps {
	onTrackChange?: (track: MusicTrack) => void;
}

export function usePlaylistManager({
	onTrackChange,
}: UsePlaylistManagerProps = {}) {
	const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
	const [shuffle, setShuffle] = useState(false);
	const [repeat, setRepeat] = useState<"off" | "one" | "all">("all");
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Save playlist state changes (only save videoIds)
	useEffect(() => {
		if (isMounted) {
			const ids = playlist.map((t) => t.videoId);
			localStore.setItem(
				CONFIG.storageKeys.musicPlaylistIds,
				JSON.stringify(ids),
			);
		}
	}, [playlist, isMounted]);

	useEffect(() => {
		if (isMounted) {
			localStore.setItem(
				CONFIG.storageKeys.musicCurrentIndex,
				currentIndex.toString(),
			);
		}
	}, [currentIndex, isMounted]);

	useEffect(() => {
		if (isMounted) {
			if (currentTrack) {
				localStore.setItem(
					CONFIG.storageKeys.musicCurrentTrackId,
					currentTrack.videoId,
				);
			} else {
				localStore.removeItem(CONFIG.storageKeys.musicCurrentTrackId);
			}
		}
	}, [currentTrack, isMounted]);

	const playTrack = useCallback(
		(track: MusicTrack) => {
			setCurrentTrack(track);
			onTrackChange?.(track);

			// Find track in playlist to update index if exists
			const index = playlist.findIndex(
				(t) => t.videoId === track.videoId,
			);
			if (index !== -1) {
				setCurrentIndex(index);
			}
		},
		[playlist, onTrackChange],
	);

	const handleNext = useCallback(() => {
		if (playlist.length === 0) return;
		let nextIndex = currentIndex + 1;

		if (shuffle) {
			nextIndex = Math.floor(Math.random() * playlist.length);
			while (nextIndex === currentIndex && playlist.length > 1) {
				nextIndex = Math.floor(Math.random() * playlist.length);
			}
		} else if (nextIndex >= playlist.length) {
			if (repeat === "all") {
				nextIndex = 0;
			} else {
				return; // Stop playback at the end of queue if not repeating all
			}
		}

		setCurrentIndex(nextIndex);
		playTrack(playlist[nextIndex]);
	}, [currentIndex, playlist, shuffle, repeat, playTrack]);

	const handlePrevious = useCallback(() => {
		if (playlist.length === 0) return;
		let prevIndex = currentIndex - 1;
		if (prevIndex < 0) {
			if (repeat === "all") {
				prevIndex = playlist.length - 1;
			} else {
				prevIndex = 0;
			}
		}

		setCurrentIndex(prevIndex);
		playTrack(playlist[prevIndex]);
	}, [currentIndex, playlist, repeat, playTrack]);

	const removeFromQueue = useCallback(
		(videoId: string) => {
			setPlaylist((prev) => {
				const index = prev.findIndex((t) => t.videoId === videoId);
				if (index === -1) return prev;

				const newPlaylist = [...prev];
				newPlaylist.splice(index, 1);

				if (index < currentIndex) {
					setCurrentIndex((c) => c - 1);
				} else if (index === currentIndex) {
					// Handle removing currently playing track logic externally usually,
					// but here we just update state.
				}
				return newPlaylist;
			});
		},
		[currentIndex],
	);

	const playNextInQueue = useCallback(
		(track: MusicTrack) => {
			setPlaylist((prev) => {
				const newPlaylist = [...prev];
				// If already in queue, remove it first
				const existingIndex = newPlaylist.findIndex(
					(t) => t.videoId === track.videoId,
				);
				if (existingIndex !== -1) {
					newPlaylist.splice(existingIndex, 1);
					if (existingIndex < currentIndex) {
						setCurrentIndex((c) => c - 1);
					}
				}

				const insertIndex = prev.length === 0 ? 0 : currentIndex + 1;
				newPlaylist.splice(insertIndex, 0, track);
				return newPlaylist;
			});
		},
		[currentIndex],
	);

	const reorderQueue = useCallback(
		(startIndex: number, endIndex: number) => {
			setPlaylist((prev) => {
				const newPlaylist = Array.from(prev);
				const [removed] = newPlaylist.splice(startIndex, 1);
				newPlaylist.splice(endIndex, 0, removed);

				// Adjust currentIndex if necessary
				if (startIndex === currentIndex) {
					setCurrentIndex(endIndex);
				} else if (
					startIndex < currentIndex &&
					endIndex >= currentIndex
				) {
					setCurrentIndex(currentIndex - 1);
				} else if (
					startIndex > currentIndex &&
					endIndex <= currentIndex
				) {
					setCurrentIndex(currentIndex + 1);
				}

				return newPlaylist;
			});
		},
		[currentIndex],
	);

	const clearQueue = useCallback(() => {
		setPlaylist([]);
		setCurrentIndex(0);
		setCurrentTrack(null);
	}, []);

	return {
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
		removeFromQueue,
		playNextInQueue,
		reorderQueue,
		clearQueue,
	};
}
