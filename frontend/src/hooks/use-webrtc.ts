import { useEffect, useRef, useState, useCallback } from "react";
import { type Socket } from "socket.io-client";
import { type ActiveUser } from "@/types";

interface UseWebRtcProps {
	socket: Socket | null | undefined;
	isHost: boolean;
	videoRef?: React.RefObject<HTMLVideoElement | null>;
	pasteId?: string;
}

// Fallback STUN-only configuration used until dynamic config arrives
const FALLBACK_ICE_CONFIG: RTCConfiguration = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:stun1.l.google.com:19302" },
	],
};

const MAX_P2P_WATCHERS = 4;

export const useWebRtc = ({
	socket,
	isHost,
	videoRef,
	pasteId,
}: UseWebRtcProps) => {
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);

	// Dynamic ICE configuration (includes TURN when available)
	const iceConfigRef = useRef<RTCConfiguration>(FALLBACK_ICE_CONFIG);

	// Host peers collection: Map<watcherSocketId, RTCPeerConnection>
	const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());

	// Watcher peer connection
	const watcherPeerRef = useRef<RTCPeerConnection | null>(null);
	const localStreamRef = useRef<MediaStream | null>(null);

	// Fetch dynamic ICE/TURN configuration from backend on socket connect
	useEffect(() => {
		if (!socket) return;

		socket.emit("get-ice-servers", (config: RTCConfiguration) => {
			if (config && config.iceServers && config.iceServers.length > 0) {
				console.log(
					"WebRTC Traversal: Received dynamic ICE config with",
					config.iceServers.length,
					"server(s)",
				);
				iceConfigRef.current = config;
			} else {
				console.warn(
					"WebRTC Traversal: Backend returned empty config, using STUN fallback",
				);
			}
		});
	}, [socket]);

	// Get local stream from host video element
	const getLocalStream = useCallback((): MediaStream | null => {
		const video = videoRef?.current;
		if (!video) return null;
		if (localStreamRef.current) return localStreamRef.current;

		try {
			let stream: MediaStream;
			if ("captureStream" in video) {
				stream = (
					video as HTMLVideoElement & {
						captureStream: () => MediaStream;
					}
				).captureStream();
			} else if ("mozCaptureStream" in video) {
				stream = (
					video as HTMLVideoElement & {
						mozCaptureStream: () => MediaStream;
					}
				).mozCaptureStream();
			} else {
				console.error(
					"Browser does not support captureStream on video elements",
				);
				return null;
			}
			if (stream.getTracks().length === 0) {
				console.warn(
					"WebRTC Host: Captured stream has 0 tracks, retrying later when loaded",
				);
				return null;
			}
			localStreamRef.current = stream;
			return stream;
		} catch (error) {
			console.error("Error capturing local video stream:", error);
			return null;
		}
	}, [videoRef]);

	// Safe peer cleanup: close the connection only, never stop shared tracks
	const cleanupPeer = useCallback((socketId: string) => {
		const pc = peersRef.current.get(socketId);
		if (pc) {
			console.log(`WebRTC: Closing peer connection for ${socketId}`);
			pc.close();
			peersRef.current.delete(socketId);
		}
	}, []);

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

					// Enforce max watcher cap
					if (peersRef.current.size >= MAX_P2P_WATCHERS) {
						console.warn(
							`WebRTC Host: Rejecting watcher ${senderSocketId} — room is at capacity (${MAX_P2P_WATCHERS} max)`,
						);
						return;
					}

					const stream = getLocalStream();
					if (!stream) {
						console.error(
							"WebRTC Host: No stream available to share",
						);
						return;
					}

					// Cleanup existing connection to this peer if it exists
					cleanupPeer(senderSocketId);

					const pc = new RTCPeerConnection(iceConfigRef.current);
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

			// Clean up peer when a watcher disconnects
			socket.on(
				"user-disconnected",
				({ socketId }: { socketId: string }) => {
					console.log(
						`WebRTC Host: Watcher ${socketId} disconnected, cleaning up`,
					);
					cleanupPeer(socketId);
				},
			);
		}

		// --- WATCHER LOGIC ---
		if (!isHost) {
			setIsConnecting(true);

			// Request the stream from the host/peers in the room when room-users update
			socket.on("room-users", (users: ActiveUser[]) => {
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

					const pc = new RTCPeerConnection(iceConfigRef.current);
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

					// ICE restart on disconnection/failure
					pc.oniceconnectionstatechange = () => {
						const state = pc.iceConnectionState;
						console.log(
							`WebRTC Watcher: ICE connection state: ${state}`,
						);

						if (state === "disconnected") {
							// Brief network hiccup — wait briefly for auto-recovery
							console.warn(
								"WebRTC Watcher: ICE disconnected, waiting for recovery...",
							);
						} else if (state === "failed") {
							// Permanent failure — trigger ICE restart
							console.error(
								"WebRTC Watcher: ICE failed. Triggering ICE restart...",
							);
							pc.createOffer({ iceRestart: true })
								.then((restartOffer) =>
									pc.setLocalDescription(restartOffer),
								)
								.then(() => {
									socket.emit("webrtc-offer", {
										targetSocketId: senderSocketId,
										offer: pc.localDescription,
									});
								})
								.catch((err) =>
									console.error(
										"WebRTC Watcher: ICE restart failed:",
										err,
									),
								);
						} else if (state === "closed") {
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

			// Receive notification that host stream tracks are loaded and ready
			socket.on(
				"webrtc-stream-ready",
				({ senderSocketId }: { senderSocketId: string }) => {
					console.log(
						"WebRTC Watcher: Host stream is ready! Requesting...",
					);
					socket.emit("webrtc-request-stream", {
						targetSocketId: senderSocketId,
					});
				},
			);

			// Host disconnected — show recovery state
			socket.on(
				"user-disconnected",
				({ socketId }: { socketId: string }) => {
					// If the disconnected user was our host peer, clean up
					if (watcherPeerRef.current) {
						console.warn(
							`WebRTC Watcher: Peer ${socketId} disconnected`,
						);
						// The room-users event will re-trigger stream request if needed
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
			socket.off("webrtc-stream-ready");
			socket.off("user-disconnected");
		};
	}, [socket, isHost, videoRef, pasteId, getLocalStream, cleanupPeer]);

	// Cleanup all on unmount — only stop underlying tracks here
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
			// Only stop the underlying captured tracks on full unmount
			if (currentLocalStream) {
				currentLocalStream.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	return { remoteStream, isConnecting };
};
