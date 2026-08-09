import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchLiveKitToken } from "../hooks/use-livekit";
import { LiveKitRoom } from "@livekit/components-react";
import { CONFIG } from "@/configurations";
import {
	CinemaRoomContent,
	type VideoDisplayProps,
} from "./cinema-room-content";

export const VideoDisplay = (props: VideoDisplayProps) => {
	const { user } = useAuth();

	const [localUrl, setLocalUrl] = useState<string>("");

	useEffect(() => {
		if (props.localFile) {
			const url = URL.createObjectURL(props.localFile);
			setLocalUrl(url);
			return () => URL.revokeObjectURL(url);
		}
	}, [props.localFile]);

	const [token, setToken] = useState("");

	const viewerIdentity = useRef(
		`viewer-${user?._id || Math.random().toString(36).substring(2, 11)}`,
	);

	useEffect(() => {
		if (!props.isP2pMode || !props.roomId) return;

		let isMounted = true;
		fetchLiveKitToken(
			props.roomId,
			props.isHost ? "host" : viewerIdentity.current,
			props.isHost,
		)
			.then((t) => {
				if (isMounted) setToken(t);
			})
			.catch(console.error);

		return () => {
			isMounted = false;
		};
	}, [props.isP2pMode, props.roomId, props.isHost]);

	return (
		<LiveKitRoom
			serverUrl={CONFIG.livekit.wsUrl || ""}
			token={token || undefined}
			connect={!!(props.isP2pMode && token)}
		>
			<CinemaRoomContent {...props} localUrl={localUrl} />
		</LiveKitRoom>
	);
};
