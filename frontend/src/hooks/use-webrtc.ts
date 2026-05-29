import { useEffect, useRef, useState, useCallback } from "react";
import { type Socket } from "socket.io-client";
import { type ActiveUser } from "@/types";

interface UseWebRtcProps {
	socket: Socket | null | undefined;
	isHost: boolean;
	videoElement: HTMLVideoElement | null;
}

const ICE_SERVERS = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:stun1.l.google.com:19302" },
		{ urls: "stun:stun2.l.google.com:19302" },
	],
};

export const useWebRtc = ({ socket, isHost, videoElement }: UseWebRtcProps) => {
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);

	// Host peers collection: Map<watcherSocketId, RTCPeerConnection>
	const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());

	// Watcher peer connection
	const watcherPeerRef = useRef<RTCPeerConnection | null>(null);
	const localStreamRef = useRef<MediaStream | null>(null);

	// Get local stream from host video element
	const getLocalStream = useCallback((): MediaStream | null => {
		if (!videoElement) return null;
		if (localStreamRef.current) return localStreamRef.current;

		try {
			let stream: MediaStream;
			if ("captureStream" in videoElement) {
				stream = (
					videoElement as HTMLVideoElement & {
						captureStream: () => MediaStream;
					}
				).captureStream();
			} else if ("mozCaptureStream" in videoElement) {
				stream = (
					videoElement as HTMLVideoElement & {
						mozCaptureStream: () => MediaStream;
					}
				).mozCaptureStream();
			} else {
				console.error(
					"Browser does not support captureStream on video elements",
				);
				return null;
			}
			localStreamRef.current = stream;
			return stream;
		} catch (error) {
			console.error("Error capturing local video stream:", error);
			return null;
		}
	}, [videoElement]);

	// Clean up a single peer connection
	const cleanupPeer = (socketId: string) => {
		const pc = peersRef.current.get(socketId);
		if (pc) {
			pc.close();
			peersRef.current.delete(socketId);
		}
	};

	useEffect(() => {
		if (!socket) return;

		// --- HOST LOGIC ---
		if (isHost) {
			// A watcher requests the host stream
			socket.on(
				"webrtc-request-stream",
				async ({ senderSocketId }: { senderSocketId: string }) => {
					console.log(
						"WebRTC Host: Received request from",
						senderSocketId,
					);
					const stream = getLocalStream();
					if (!stream) {
						console.error(
							"WebRTC Host: No stream available to share",
						);
						return;
					}

					// Cleanup existing connection to this peer if it exists
					cleanupPeer(senderSocketId);

					const pc = new RTCPeerConnection(ICE_SERVERS);
					peersRef.current.set(senderSocketId, pc);

					// Add local tracks to peer connection
					stream.getTracks().forEach((track) => {
						pc.addTrack(track, stream);
					});

					// Handle ICE candidates
					pc.onicecandidate = (event) => {
						if (event.candidate) {
							socket.emit("webrtc-ice-candidate", {
								targetSocketId: senderSocketId,
								candidate: event.candidate,
							});
						}
					};

					// Create SDP offer
					try {
						const offer = await pc.createOffer();
						await pc.setLocalDescription(offer);
						socket.emit("webrtc-offer", {
							targetSocketId: senderSocketId,
							offer,
						});
					} catch (error) {
						console.error(
							"WebRTC Host: Error creating offer",
							error,
						);
					}
				},
			);

			// Receive answer from a watcher
			socket.on(
				"webrtc-answer",
				async ({
					senderSocketId,
					answer,
				}: {
					senderSocketId: string;
					answer: RTCSessionDescriptionInit;
				}) => {
					console.log(
						"WebRTC Host: Received answer from",
						senderSocketId,
					);
					const pc = peersRef.current.get(senderSocketId);
					if (pc) {
						try {
							await pc.setRemoteDescription(
								new RTCSessionDescription(answer),
							);
						} catch (error) {
							console.error(
								"WebRTC Host: Error setting remote description",
								error,
							);
						}
					}
				},
			);

			// Receive ICE candidate from a watcher
			socket.on(
				"webrtc-ice-candidate",
				async ({
					senderSocketId,
					candidate,
				}: {
					senderSocketId: string;
					candidate: RTCIceCandidateInit;
				}) => {
					const pc = peersRef.current.get(senderSocketId);
					if (pc) {
						try {
							await pc.addIceCandidate(
								new RTCIceCandidate(candidate),
							);
						} catch (error) {
							console.error(
								"WebRTC Host: Error adding ICE candidate",
								error,
							);
						}
					}
				},
			);
		}

		// --- WATCHER LOGIC ---
		if (!isHost) {
			setIsConnecting(true);

			// Request the stream from the host/peers in the room when room-users update
			socket.on("room-users", (users: ActiveUser[]) => {
				// Find host (we assume the initiator is the one whose ID or status fits)
				// Or simply broadcast the request to everyone in the room (the host will respond)
				console.log(
					"WebRTC Watcher: Requesting stream from room peers",
				);
				users.forEach((u) => {
					if (u.socketId !== socket.id) {
						socket.emit("webrtc-request-stream", {
							targetSocketId: u.socketId,
						});
					}
				});
			});

			// Host sends an SDP offer
			socket.on(
				"webrtc-offer",
				async ({
					senderSocketId,
					offer,
				}: {
					senderSocketId: string;
					offer: RTCSessionDescriptionInit;
				}) => {
					console.log(
						"WebRTC Watcher: Received offer from host",
						senderSocketId,
					);
					if (watcherPeerRef.current) {
						watcherPeerRef.current.close();
					}

					const pc = new RTCPeerConnection(ICE_SERVERS);
					watcherPeerRef.current = pc;

					// Track event: host is sending us tracks!
					pc.ontrack = (event) => {
						console.log(
							"WebRTC Watcher: Received remote video track",
							event,
						);
						if (event.streams && event.streams[0]) {
							setRemoteStream(event.streams[0]);
							setIsConnecting(false);
						}
					};

					pc.oniceconnectionstatechange = () => {
						if (
							pc.iceConnectionState === "disconnected" ||
							pc.iceConnectionState === "failed"
						) {
							setIsConnecting(true);
							setRemoteStream(null);
						}
					};

					// Handle ICE candidates
					pc.onicecandidate = (event) => {
						if (event.candidate) {
							socket.emit("webrtc-ice-candidate", {
								targetSocketId: senderSocketId,
								candidate: event.candidate,
							});
						}
					};

					try {
						await pc.setRemoteDescription(
							new RTCSessionDescription(offer),
						);
						const answer = await pc.createAnswer();
						await pc.setLocalDescription(answer);
						socket.emit("webrtc-answer", {
							targetSocketId: senderSocketId,
							answer,
						});
					} catch (error) {
						console.error(
							"WebRTC Watcher: Error answering offer",
							error,
						);
						setIsConnecting(false);
					}
				},
			);

			// Receive ICE candidate from host
			socket.on(
				"webrtc-ice-candidate",
				async ({
					candidate,
				}: {
					senderSocketId: string;
					candidate: RTCIceCandidateInit;
				}) => {
					const pc = watcherPeerRef.current;
					if (pc) {
						try {
							await pc.addIceCandidate(
								new RTCIceCandidate(candidate),
							);
						} catch (error) {
							console.error(
								"WebRTC Watcher: Error adding ICE candidate",
								error,
							);
						}
					}
				},
			);
		}

		return () => {
			socket.off("webrtc-request-stream");
			socket.off("webrtc-offer");
			socket.off("webrtc-answer");
			socket.off("webrtc-ice-candidate");
			socket.off("room-users");
		};
	}, [socket, isHost, videoElement, getLocalStream]);

	// Cleanup all on unmount
	useEffect(() => {
		const currentPeers = peersRef.current;
		const currentWatcher = watcherPeerRef.current;
		const currentLocalStream = localStreamRef.current;

		return () => {
			if (currentWatcher) {
				currentWatcher.close();
			}
			currentPeers.forEach((pc) => pc.close());
			currentPeers.clear();
			if (currentLocalStream) {
				currentLocalStream.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	return { remoteStream, isConnecting };
};
