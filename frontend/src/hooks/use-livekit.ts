import { useEffect, useRef, useState, useCallback } from "react";
import {
	Room,
	RoomEvent,
	LocalVideoTrack,
	LocalAudioTrack,
	Track,
} from "livekit-client";

interface UseLiveKitProps {
	roomName: string;
	identity: string;
	isHost: boolean;
	videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export const useLiveKit = ({
	roomName,
	identity,
	isHost,
	videoRef,
}: UseLiveKitProps) => {
	const [remoteVideoStream, setRemoteVideoStream] =
		useState<MediaStream | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [isHostDisconnected, setIsHostDisconnected] = useState(false);

	const roomRef = useRef<Room | null>(null);
	const publishedVideoTrackRef = useRef<LocalVideoTrack | null>(null);
	const publishedAudioTrackRef = useRef<LocalAudioTrack | null>(null);

	const fetchToken = useCallback(async () => {
		const res = await fetch("/api/v1/livekit/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ roomName, identity, isHost }),
		});
		if (!res.ok) {
			throw new Error("Failed to fetch LiveKit token");
		}
		const data = await res.json();
		return data.token;
	}, [roomName, identity, isHost]);

	const publishLocalStream = useCallback(
		async (activeRoom: Room) => {
			const video = videoRef?.current;
			if (!video) return;

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
					await activeRoom.localParticipant.publishTrack(
						lkVideoTrack,
					);
					publishedVideoTrackRef.current = lkVideoTrack;
					console.log("LiveKit Host: Published video track");
				}
				if (audioTrack) {
					const lkAudioTrack = new LocalAudioTrack(audioTrack);
					await activeRoom.localParticipant.publishTrack(
						lkAudioTrack,
					);
					publishedAudioTrackRef.current = lkAudioTrack;
					console.log("LiveKit Host: Published audio track");
				}
			} catch (err) {
				console.error(
					"Failed to capture and publish local stream:",
					err,
				);
			}
		},
		[videoRef],
	);

	const replaceHostTracks = useCallback(async () => {
		const video = videoRef?.current;
		if (!video) return;

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

			const activeRoom = roomRef.current;
			if (!activeRoom) return;

			// Unpublish old tracks if they exist
			if (publishedVideoTrackRef.current) {
				await activeRoom.localParticipant.unpublishTrack(
					publishedVideoTrackRef.current,
				);
				publishedVideoTrackRef.current.mediaStreamTrack.stop();
				publishedVideoTrackRef.current = null;
			}
			if (publishedAudioTrackRef.current) {
				await activeRoom.localParticipant.unpublishTrack(
					publishedAudioTrackRef.current,
				);
				publishedAudioTrackRef.current.mediaStreamTrack.stop();
				publishedAudioTrackRef.current = null;
			}

			// Publish new tracks
			if (newVideoTrack) {
				const lkVideoTrack = new LocalVideoTrack(newVideoTrack);
				await activeRoom.localParticipant.publishTrack(lkVideoTrack);
				publishedVideoTrackRef.current = lkVideoTrack;
				console.log(
					"LiveKit Host: Hot-swapped and republished video track",
				);
			}
			if (newAudioTrack) {
				const lkAudioTrack = new LocalAudioTrack(newAudioTrack);
				await activeRoom.localParticipant.publishTrack(lkAudioTrack);
				publishedAudioTrackRef.current = lkAudioTrack;
				console.log(
					"LiveKit Host: Hot-swapped and republished audio track",
				);
			}
		} catch (err) {
			console.error("Failed to hot-swap host tracks:", err);
		}
	}, [videoRef]);

	useEffect(() => {
		if (!roomName || !identity) return;

		let activeRoom: Room;
		setIsConnecting(true);
		setIsHostDisconnected(false);

		const initRoom = async () => {
			try {
				const token = await fetchToken();
				activeRoom = new Room({
					publishDefaults: {
						videoCodec: "vp8",
					},
				});
				roomRef.current = activeRoom;

				activeRoom.on(RoomEvent.TrackSubscribed, (track) => {
					if (track.kind === Track.Kind.Video) {
						console.log(
							"LiveKit Viewer: Subscribed to remote video track",
						);
						const stream = new MediaStream([
							track.mediaStreamTrack,
						]);
						setRemoteVideoStream(stream);
						setIsConnecting(false);
						setIsHostDisconnected(false);
					}
				});

				activeRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
					if (track.kind === Track.Kind.Video) {
						console.log(
							"LiveKit Viewer: Unsubscribed from video track",
						);
						setRemoteVideoStream(null);
					}
				});

				activeRoom.on(
					RoomEvent.ParticipantDisconnected,
					(participant) => {
						// If the host disconnected
						if (participant.identity === "host") {
							console.warn(
								"LiveKit Viewer: Host disconnected from room",
							);
							setIsHostDisconnected(true);
							setRemoteVideoStream(null);
						}
					},
				);

				const wsUrl =
					import.meta.env.VITE_LIVEKIT_WS_URL ||
					"ws://localhost:7880";
				await activeRoom.connect(wsUrl, token);
				console.log("LiveKit: Connected to room", roomName);

				if (isHost) {
					await publishLocalStream(activeRoom);
				}
			} catch (e) {
				console.error("LiveKit connection failure:", e);
			} finally {
				setIsConnecting(false);
			}
		};

		initRoom();

		return () => {
			if (activeRoom) {
				if (publishedVideoTrackRef.current) {
					publishedVideoTrackRef.current.mediaStreamTrack.stop();
				}
				if (publishedAudioTrackRef.current) {
					publishedAudioTrackRef.current.mediaStreamTrack.stop();
				}
				activeRoom.disconnect();
				roomRef.current = null;
			}
		};
	}, [roomName, identity, isHost, publishLocalStream, fetchToken]);

	return {
		remoteVideoStream,
		isConnecting,
		isHostDisconnected,
		replaceHostTracks,
	};
};
