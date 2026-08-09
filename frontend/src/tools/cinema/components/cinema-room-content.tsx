import { useEffect, useRef, useState } from "react";
import { type Socket } from "socket.io-client";
import { type ActiveUser } from "@/types";
import type { MediaPlayerInstance } from "@vidstack/react";

import { CinemaChat } from "./cinema-chat";
import { useAuth } from "@/context/AuthContext";
import { useLiveKitHost } from "../hooks/use-livekit";
import { useFloatingReactions } from "@/hooks/use-floating-reactions";
import { useCinemaSync } from "../hooks/use-cinema-sync";
import { useTracks, useParticipants } from "@livekit/components-react";
import { Track } from "livekit-client";
import { CinemaPlayer } from "./cinema-player";

export interface VideoDisplayProps {
	roomId: string;
	videoSrc: string;
	isP2pMode: boolean;
	isHost: boolean;
	localFile: File | null;
	setLocalFile: (file: File | null) => void;
	contentRef: (node: HTMLElement | null) => void;
	socketRef?: React.MutableRefObject<Socket | null>;
	activeUsers?: ActiveUser[];
}

export const CinemaRoomContent = ({
	roomId,
	videoSrc,
	isP2pMode,
	isHost,
	localFile,
	setLocalFile,
	contentRef,
	socketRef,
	activeUsers = [],
	localUrl,
}: VideoDisplayProps & { localUrl: string }) => {
	const videoRef = useRef<MediaPlayerInstance>(null);
	const theaterRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth();

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [commentsList, setCommentsList] = useState<
		Array<{ sender: string; text: string; color: string }>
	>([]);
	const [chatInput, setChatInput] = useState("");
	const [videoError, setVideoError] = useState<string | null>(null);

	// Reset error when source URL changes
	useEffect(() => {
		setVideoError(null);
	}, [videoSrc, localUrl]);

	const socket = socketRef?.current;

	const { replaceHostTracks, isHostBroadcasting } = useLiveKitHost({
		isHost: !!(isP2pMode && isHost),
		videoRef: isHost ? videoRef : undefined,
	});

	// Use React components for receiving tracks
	const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
	const participants = useParticipants();
	const hostParticipant = participants.find((p) => p.identity === "host");

	const remoteVideoStream =
		tracks.length > 0
			? tracks[0].publication.track?.mediaStreamTrack
			: null;

	const isConnectingActual =
		isP2pMode && !isHost && (!remoteVideoStream || !hostParticipant);
	const isHostDisconnectedActual = isP2pMode && !isHost && !hostParticipant;

	// Custom hook for flying emojis
	const { reactions, handleSendReaction } = useFloatingReactions(
		socket,
		roomId,
		user?.username,
	);

	// Custom hook for all video sync events and timeline pings
	const { emitVideoState } = useCinemaSync({
		socket,
		roomId,
		isHost,
		isP2pMode,
		videoRef,
		isPlaying,
		duration,
		setCurrentTime,
		setDuration,
		setIsPlaying,
		setCommentsList,
	});

	const sendChatMessage = () => {
		if (!socket || !chatInput.trim()) return;
		socket.emit("video-chat-message", {
			roomId,
			text: chatInput.trim(),
		});
		setChatInput("");
	};

	return (
		<div
			ref={contentRef as React.Ref<HTMLDivElement>}
			className="w-full h-full flex flex-col md:flex-row relative bg-background rounded-2xl overflow-hidden shadow-2xl min-h-125 md:min-h-0 select-none"
		>
			<CinemaPlayer
				roomId={roomId}
				theaterRef={theaterRef}
				videoRef={videoRef}
				isP2pMode={isP2pMode}
				isHost={isHost}
				localFile={localFile}
				localUrl={localUrl}
				videoSrc={videoSrc}
				remoteVideoStream={remoteVideoStream}
				isPlaying={isPlaying}
				currentTime={currentTime}
				duration={duration}
				isConnectingActual={isConnectingActual}
				isHostDisconnectedActual={isHostDisconnectedActual}
				reactions={reactions}
				isHostBroadcasting={isHostBroadcasting}
				videoError={videoError}
				handleSendReaction={handleSendReaction}
				setIsPlaying={setIsPlaying}
				setCurrentTime={setCurrentTime}
				setDuration={setDuration}
				setVideoError={setVideoError}
				setLocalFile={setLocalFile}
				emitVideoState={emitVideoState}
				replaceHostTracks={replaceHostTracks}
				socket={socket}
			/>

			{/* Watch Party Collaboration Sidebar */}
			<CinemaChat
				activeUsers={activeUsers}
				commentsList={commentsList}
				chatInput={chatInput}
				setChatInput={setChatInput}
				sendChatMessage={sendChatMessage}
			/>
		</div>
	);
};
