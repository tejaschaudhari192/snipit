import { useEffect, useRef, useState, useCallback } from "react";
import { LocalVideoTrack, LocalAudioTrack, Track } from "livekit-client";
import { useRoomContext, useLocalParticipant } from "@livekit/components-react";
import { CONFIG } from "@/configurations";

export const fetchLiveKitToken = async (
	roomName: string,
	identity: string,
	isHost: boolean,
) => {
	const apiBaseUrl = CONFIG.apiBaseUrl || "/api/v1";
	const tokenUrl = apiBaseUrl.endsWith("/api/v1")
		? `${apiBaseUrl}/livekit/token`
		: `${apiBaseUrl}/api/v1/livekit/token`;

	const res = await fetch(tokenUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ roomName, identity, isHost }),
	});
	if (!res.ok) {
		throw new Error("Failed to fetch LiveKit token");
	}
	const data = await res.json();
	return data.token;
};

import type { MediaPlayerInstance } from "@vidstack/react";

interface UseLiveKitHostProps {
	isHost: boolean;
	videoRef?: React.RefObject<MediaPlayerInstance | null>;
}

export const useLiveKitHost = ({ isHost, videoRef }: UseLiveKitHostProps) => {
	const room = useRoomContext();
	const { localParticipant } = useLocalParticipant();

	const publishedVideoTrackRef = useRef<LocalVideoTrack | null>(null);
	const publishedAudioTrackRef = useRef<LocalAudioTrack | null>(null);

	const [isHostBroadcasting, setIsHostBroadcasting] = useState(false);

	const publishLocalStream = useCallback(async () => {
		const player = videoRef?.current as unknown as {
			el?: HTMLElement | null;
			provider?: { video?: HTMLVideoElement | null };
		};
		const video =
			player?.el?.querySelector("video") ||
			player?.provider?.video ||
			document.querySelector("video");
		if (!video || !room || !localParticipant) return;

		try {
			let captureStream: MediaStream | null = null;
			if ("captureStream" in video) {
				captureStream = (
					video as unknown as { captureStream: () => MediaStream }
				).captureStream();
			} else if ("mozCaptureStream" in video) {
				captureStream = (
					video as unknown as {
						mozCaptureStream: () => MediaStream;
					}
				).mozCaptureStream();
			} else {
				console.error(
					"Browser does not support captureStream on video elements",
				);
				return;
			}

			if (!captureStream) return;

			const videoTrack = captureStream.getVideoTracks()[0];
			const audioTrack = captureStream.getAudioTracks()[0];

			if (videoTrack) {
				const lkVideoTrack = new LocalVideoTrack(videoTrack);
				await localParticipant.publishTrack(lkVideoTrack, {
					source: Track.Source.Camera,
				});
				publishedVideoTrackRef.current = lkVideoTrack;
				console.log("LiveKit Host: Published video track");
			}
			if (audioTrack) {
				const lkAudioTrack = new LocalAudioTrack(audioTrack);
				await localParticipant.publishTrack(lkAudioTrack, {
					source: Track.Source.Microphone,
				});
				publishedAudioTrackRef.current = lkAudioTrack;
				console.log("LiveKit Host: Published audio track");
			}
			setIsHostBroadcasting(true);
		} catch (err) {
			console.error("Failed to capture and publish local stream:", err);
		}
	}, [videoRef, room, localParticipant]);

	const replaceHostTracks = useCallback(async () => {
		const player = videoRef?.current as unknown as {
			el?: HTMLElement | null;
			provider?: { video?: HTMLVideoElement | null };
		};
		const video =
			player?.el?.querySelector("video") ||
			player?.provider?.video ||
			document.querySelector("video");
		if (!video || !room || !localParticipant) return;

		try {
			let captureStream: MediaStream | null = null;
			if ("captureStream" in video) {
				captureStream = (
					video as unknown as { captureStream: () => MediaStream }
				).captureStream();
			} else if ("mozCaptureStream" in video) {
				captureStream = (
					video as unknown as { mozCaptureStream: () => MediaStream }
				).mozCaptureStream();
			} else {
				return;
			}

			if (!captureStream) return;

			const newVideoTrack = captureStream.getVideoTracks()[0];
			const newAudioTrack = captureStream.getAudioTracks()[0];

			// Unpublish old tracks if they exist
			if (publishedVideoTrackRef.current) {
				await localParticipant.unpublishTrack(
					publishedVideoTrackRef.current,
				);
				publishedVideoTrackRef.current.mediaStreamTrack.stop();
				publishedVideoTrackRef.current = null;
			}
			if (publishedAudioTrackRef.current) {
				await localParticipant.unpublishTrack(
					publishedAudioTrackRef.current,
				);
				publishedAudioTrackRef.current.mediaStreamTrack.stop();
				publishedAudioTrackRef.current = null;
			}

			// Publish new tracks
			if (newVideoTrack) {
				const lkVideoTrack = new LocalVideoTrack(newVideoTrack);
				await localParticipant.publishTrack(lkVideoTrack, {
					source: Track.Source.Camera,
				});
				publishedVideoTrackRef.current = lkVideoTrack;
				console.log(
					"LiveKit Host: Hot-swapped and republished video track",
				);
			}
			if (newAudioTrack) {
				const lkAudioTrack = new LocalAudioTrack(newAudioTrack);
				await localParticipant.publishTrack(lkAudioTrack, {
					source: Track.Source.Microphone,
				});
				publishedAudioTrackRef.current = lkAudioTrack;
				console.log(
					"LiveKit Host: Hot-swapped and republished audio track",
				);
			}
			setIsHostBroadcasting(true);
		} catch (err) {
			console.error("Failed to hot-swap host tracks:", err);
		}
	}, [videoRef, room, localParticipant]);

	useEffect(() => {
		if (isHost && room && localParticipant) {
			publishLocalStream();
		}
	}, [isHost, room, localParticipant, publishLocalStream]);

	useEffect(() => {
		return () => {
			if (publishedVideoTrackRef.current) {
				publishedVideoTrackRef.current.mediaStreamTrack.stop();
			}
			if (publishedAudioTrackRef.current) {
				publishedAudioTrackRef.current.mediaStreamTrack.stop();
			}
		};
	}, []);

	return {
		replaceHostTracks,
		isHostBroadcasting,
	};
};
