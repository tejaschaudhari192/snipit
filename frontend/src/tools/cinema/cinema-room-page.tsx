import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import io, { type Socket } from "socket.io-client";
import { CONFIG } from "@/configurations";
import { VideoDisplay } from "./components/video-display";
import type { ActiveUser } from "@/types";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
	const [isHostDisconnected, setIsHostDisconnected] = useState(false);
	const [localFile, setLocalFile] = useState<File | null>(
		state?.localVideoFile || null,
	);

	const loadingRef = useRef(loading);
	loadingRef.current = loading;
	const socketRef = useRef<Socket | null>(null);
	const contentRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!roomId) return;

		const socketUrl = CONFIG.apiBaseUrl
			? CONFIG.apiBaseUrl.replace(/\/api(\/v\d+)?\/?$/, "")
			: "";

		const socket = io(socketUrl, {
			transports: ["websocket", "polling"],
			withCredentials: true,
			path: "/socket.io",
			query: {
				userId: user?._id || "",
				username: user?.username || "Guest",
			},
		});

		socketRef.current = socket;

		// Connection timeout to avoid hanging indefinitely
		const timeoutId = setTimeout(() => {
			if (loadingRef.current && !state?.videoUrl) {
				setError("Watch party room not found or host has left.");
				setLoading(false);
			}
		}, 8000);

		socket.on("connect", () => {
			if (isHost && state?.videoUrl) {
				socket.emit("create-cinema-room", {
					roomId,
					videoUrl: state.videoUrl,
					isP2pMode: state.isP2p || false,
					userName: user?.username || "Host",
				});
				clearTimeout(timeoutId);
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
				clearTimeout(timeoutId);
				setVideoSrc(data.videoUrl);
				setIsP2pMode(data.isP2pMode);
				setIsHostDisconnected(false);
				setLoading(false);
			},
		);

		socket.on("cinema-video-changed", (data: { videoUrl: string }) => {
			setVideoSrc(data.videoUrl);
		});

		socket.on("cinema-room-error", (data: { message?: string }) => {
			clearTimeout(timeoutId);
			setError(
				data.message ||
					"Watch party room not found or host has ended the session.",
			);
			setLoading(false);
		});

		socket.on("cinema-host-disconnected", () => {
			setIsHostDisconnected(true);
		});

		socket.on("cinema-room-users", (users: ActiveUser[]) => {
			setActiveUsers(users);
		});

		socket.on("connect_error", (err) => {
			console.error("Socket connection error:", err);
			clearTimeout(timeoutId);
			setError("Failed to connect to watch party servers.");
			setLoading(false);
		});

		return () => {
			clearTimeout(timeoutId);
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
			<div className="w-full h-dvh flex flex-col items-center justify-center bg-background text-foreground space-y-4 p-6 text-center">
				<div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-2 shadow-lg shadow-destructive/10">
					<AlertCircle className="w-8 h-8" />
				</div>
				<h2 className="text-2xl font-bold text-foreground">
					Watch Party Unavailable
				</h2>
				<p className="text-sm text-muted-foreground max-w-md">
					{error}
				</p>
				<Button
					onClick={() => navigate("/tools/cinema")}
					className="mt-4 gap-2 font-bold"
				>
					<ArrowLeft className="w-4 h-4" />
					Return to Cinema
				</Button>
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
				isHostDisconnected={isHostDisconnected}
				localFile={localFile}
				setLocalFile={setLocalFile}
				contentRef={(node) => (contentRef.current = node)}
				socketRef={socketRef}
				activeUsers={activeUsers}
			/>
		</div>
	);
}
