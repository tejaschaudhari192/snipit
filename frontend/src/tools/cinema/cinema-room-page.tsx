import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import io, { type Socket } from "socket.io-client";
import { CONFIG } from "@/configurations";
import { VideoDisplay } from "./components/video-display";
import type { ActiveUser } from "@/types";
import { Loader2 } from "lucide-react";

export default function CinemaRoomPage() {
	const { roomId } = useParams<{ roomId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();

	const state = location.state as {
		videoUrl?: string;
		isP2p?: boolean;
		isHost?: boolean;
		localVideoFile?: File | null;
	} | null;
	const isHost = state?.isHost || false;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
	const [videoSrc, setVideoSrc] = useState<string>(state?.videoUrl || "");
	const [isP2pMode, setIsP2pMode] = useState<boolean>(state?.isP2p || false);
	const [localFile, setLocalFile] = useState<File | null>(
		state?.localVideoFile || null,
	);

	const socketRef = useRef<Socket | null>(null);
	const contentRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!roomId) return;

		const socketUrl = CONFIG.apiBaseUrl
			? CONFIG.apiBaseUrl.replace(/\/api(\/v\d+)?\/?$/, "")
			: "";

		const socket = io(socketUrl, {
			transports: ["websocket", "polling"],
			path: "/socket.io",
			query: {
				userId: user?._id || "",
				username: user?.username || "Guest",
			},
		});

		socketRef.current = socket;

		socket.on("connect", () => {
			if (isHost && state?.videoUrl) {
				socket.emit("create-cinema-room", {
					roomId,
					videoUrl: state.videoUrl,
					isP2pMode: state.isP2p || false,
				});
				setLoading(false);
			} else {
				socket.emit("join-cinema-room", {
					roomId,
					userName: user?.username || "Guest",
				});
			}
		});

		socket.on(
			"cinema-room-state",
			(data: {
				videoUrl: string;
				isP2pMode: boolean;
				hostSocketId: string;
			}) => {
				setVideoSrc(data.videoUrl);
				setIsP2pMode(data.isP2pMode);
				setLoading(false);
			},
		);

		socket.on("cinema-host-disconnected", () => {
			// Handle host disconnect logic natively in player overlay
		});

		socket.on("cinema-room-users", (users: ActiveUser[]) => {
			setActiveUsers(users);
		});

		socket.on("connect_error", (err) => {
			console.error("Socket connection error:", err);
			setError("Failed to connect to watch party servers.");
			setLoading(false);
		});

		return () => {
			socket.emit("leave-cinema-room", roomId);
			socket.disconnect();
			socketRef.current = null;
		};
	}, [roomId, user, isHost, state]);

	if (loading) {
		return (
			<div className="w-full h-dvh flex flex-col items-center justify-center bg-background text-foreground">
				<Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
				<p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
					Loading Watch Party...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full h-dvh flex flex-col items-center justify-center bg-background text-foreground space-y-4">
				<p className="text-xl font-bold text-destructive">{error}</p>
				<button
					onClick={() => navigate("/tools/cinema")}
					className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90"
				>
					Return to Cinema
				</button>
			</div>
		);
	}

	return (
		<div className="w-full h-dvh bg-background overflow-hidden relative">
			<VideoDisplay
				roomId={roomId!}
				videoSrc={videoSrc}
				isP2pMode={isP2pMode}
				isHost={isHost}
				localFile={localFile}
				setLocalFile={setLocalFile}
				contentRef={(node) => (contentRef.current = node)}
				socketRef={socketRef}
				activeUsers={activeUsers}
			/>
		</div>
	);
}
