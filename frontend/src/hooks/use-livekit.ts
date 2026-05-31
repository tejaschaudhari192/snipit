import { useEffect, useRef, useState, useCallback } from "react";
import {
	Room,
	RoomEvent,
	LocalVideoTrack,
	LocalAudioTrack,
	Track,
} from "livekit-client";
import { CONFIG } from "@/configurations";

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
					console.log(
						`LiveKit Viewer: Subscribed to remote track of kind ${track.kind}`,
					);
					setRemoteVideoStream((prevStream) => {
						let currentStream = prevStream;
						if (!currentStream) {
							currentStream = new MediaStream();
						} else {
							// Filter out any ended or dead tracks during the cloning process
							const activeTracks = currentStream
								.getTracks()
								.filter(
									(t) =>
										t.readyState !== "ended" &&
										t.id !== track.mediaStreamTrack.id,
								);
							currentStream = new MediaStream(activeTracks);
						}
						currentStream.addTrack(track.mediaStreamTrack);
						return currentStream;
					});
					if (track.kind === Track.Kind.Video) {
						setIsConnecting(false);
						setIsHostDisconnected(false);
					}
				});

				activeRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
					console.log(
						`LiveKit Viewer: Unsubscribed from track of kind ${track.kind}`,
					);
					// Explicitly stop the unsubscribed track to release browser resources
					track.mediaStreamTrack.stop();

					setRemoteVideoStream((prevStream) => {
						if (!prevStream) return null;

						// Create a new stream omitting the specific unsubscribed track
						const activeTracks = prevStream
							.getTracks()
							.filter(
								(t) =>
									t.id !== track.mediaStreamTrack.id &&
									t.readyState !== "ended",
							);

						// If the video track is unsubscribed or no tracks remain, clear and stop the whole stream
						if (
							track.kind === Track.Kind.Video ||
							activeTracks.length === 0
						) {
							prevStream.getTracks().forEach((t) => t.stop());
							return null;
						}

						return new MediaStream(activeTracks);
					});
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
							setRemoteVideoStream((prevStream) => {
								if (prevStream) {
									prevStream
										.getTracks()
										.forEach((t) => t.stop());
								}
								return null;
							});
						}
					},
				);

				const wsUrl = CONFIG.livekit.wsUrl;
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
			setRemoteVideoStream((prevStream) => {
				if (prevStream) {
					prevStream.getTracks().forEach((t) => t.stop());
				}
				return null;
			});
		};
	}, [roomName, identity, isHost, publishLocalStream, fetchToken]);

	return {
		remoteVideoStream,
		isConnecting,
		isHostDisconnected,
		replaceHostTracks,
	};
};
