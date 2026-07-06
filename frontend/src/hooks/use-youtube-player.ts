import { useState, useEffect, useRef, useCallback } from "react";
import { type YTPlayer } from "@/context/use-music";

interface UseYouTubePlayerProps {
	volume: number;
	quality: string;
	onReady?: () => void;
	onStateChange?: (state: number) => void;
	onError?: (error: number) => void;
}

export function useYouTubePlayer({
	volume,
	quality,
	onReady,
	onStateChange,
	onError,
}: UseYouTubePlayerProps) {
	const playerRef = useRef<YTPlayer | null>(null);
	const [isReady, setIsReady] = useState(false);

	const onReadyRef = useRef(onReady);
	const onStateChangeRef = useRef(onStateChange);
	const onErrorRef = useRef(onError);

	useEffect(() => {
		onReadyRef.current = onReady;
		onStateChangeRef.current = onStateChange;
		onErrorRef.current = onError;
	}, [onReady, onStateChange, onError]);

	useEffect(() => {
		const initYTPlayer = () => {
			if (window.YT && window.YT.Player) {
				playerRef.current = new window.YT.Player("yt-music-player", {
					height: "1",
					width: "1",
					videoId: "",
					playerVars: {
						playsinline: 1,
						controls: 0,
						disablekb: 1,
						fs: 0,
						iv_load_policy: 3,
						rel: 0,
						origin: window.location.origin,
						widget_referrer: window.location.origin,
						host: "https://www.youtube.com",
					},
					events: {
						onReady: (event: { target: YTPlayer }) => {
							setIsReady(true);
							event.target.setVolume(volume);
							if (
								typeof event.target.setPlaybackQuality ===
								"function"
							) {
								event.target.setPlaybackQuality(quality);
							}
							onReadyRef.current?.();
						},
						onStateChange: (event: { data: number }) => {
							onStateChangeRef.current?.(event.data);
						},
						onError: (event: unknown) => {
							const e = event as { data: number };
							console.error("YouTube Player Error:", e?.data);
							onErrorRef.current?.(e?.data);
						},
					},
				});
			}
		};

		if (!window.YT) {
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			const firstScriptTag = document.getElementsByTagName("script")[0];
			if (firstScriptTag && firstScriptTag.parentNode) {
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			}

			window.onYouTubeIframeAPIReady = () => {
				initYTPlayer();
			};
		} else {
			initYTPlayer();
		}

		return () => {
			if (playerRef.current) {
				playerRef.current.destroy();
				playerRef.current = null;
			}
			setIsReady(false);
		};
	}, []); // Empty dependency array as we only want to init once

	// Synchronize volume and quality when they change
	useEffect(() => {
		if (isReady && playerRef.current) {
			playerRef.current.setVolume(volume);
		}
	}, [volume, isReady]);

	useEffect(() => {
		if (
			isReady &&
			playerRef.current &&
			typeof playerRef.current.setPlaybackQuality === "function"
		) {
			playerRef.current.setPlaybackQuality(quality);
		}
	}, [quality, isReady]);

	const play = useCallback(() => {
		if (isReady && playerRef.current) {
			playerRef.current.playVideo();
		}
	}, [isReady]);

	const pause = useCallback(() => {
		if (isReady && playerRef.current) {
			playerRef.current.pauseVideo();
		}
	}, [isReady]);

	const seekTo = useCallback(
		(time: number) => {
			if (isReady && playerRef.current) {
				playerRef.current.seekTo(time, true);
			}
		},
		[isReady],
	);

	const loadVideoById = useCallback(
		(videoId: string, startSeconds: number = 0) => {
			if (isReady && playerRef.current) {
				playerRef.current.loadVideoById({
					videoId,
					startSeconds,
				});
			}
		},
		[isReady],
	);

	const cueVideoById = useCallback(
		(videoId: string, startSeconds: number = 0) => {
			if (isReady && playerRef.current) {
				playerRef.current.cueVideoById({
					videoId,
					startSeconds,
				});
			}
		},
		[isReady],
	);

	return {
		playerRef,
		isReady,
		play,
		pause,
		seekTo,
		loadVideoById,
		cueVideoById,
	};
}
