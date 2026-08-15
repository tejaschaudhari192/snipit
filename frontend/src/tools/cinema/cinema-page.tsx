import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import {
	Film,
	Play,
	Link as LinkIcon,
	MonitorPlay,
	Users,
	Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
export default function CinemaPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useAuth();

	// Create Room State
	const [videoUrl, setVideoUrl] = useState("");
	const [isP2p, setIsP2p] = useState(false);
	const [localFile, setLocalFile] = useState<File | null>(null);
	const [isCreating, setIsCreating] = useState(false);

	// Join Room State
	const [joinUrl, setJoinUrl] = useState("");

	const isValidUrl = (url: string) => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};

	const handleCreateRoom = async () => {
		if (!user) {
			toast.add({
				title: t(
					"tools.cinema.auth_required",
					"Login required to host watch parties.",
				),
				type: "error",
			});
			return;
		}

		if (!isP2p && !isValidUrl(videoUrl)) {
			toast.add({
				title: t(
					"tools.cinema.invalid_url",
					"Please enter a valid video URL.",
				),
				type: "error",
			});
			return;
		}

		setIsCreating(true);
		try {
			const roomId = crypto.randomUUID();

			navigate(`/tools/cinema/${roomId}`, {
				state: {
					videoUrl: isP2p ? "p2p://local-stream" : videoUrl,
					isP2p,
					isHost: true,
					localVideoFile: isP2p ? localFile : null,
				},
			});
		} catch (error) {
			console.error("Error creating room:", error);
			toast.add({ title: "Failed to create watch party", type: "error" });
		} finally {
			setIsCreating(false);
		}
	};

	const handleJoinRoom = () => {
		if (!joinUrl.trim()) return;

		let roomId = joinUrl.trim();
		if (isValidUrl(roomId)) {
			const url = new URL(roomId);
			roomId = url.pathname.split("/").filter(Boolean).pop() || roomId;
		}

		navigate(`/tools/cinema/${roomId}`);
	};

	return (
		<div className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
			{/* Background gradients */}
			<div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
			<div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px] -z-10" />

			<div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
				<div className="text-center space-y-4">
					<div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-3xl mb-4 border border-primary/20 shadow-xl shadow-primary/10">
						<Film className="w-12 h-12 text-primary" />
					</div>
					<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
						{t("tools.cinema.hero_title")}
					</h1>
					<p className="text-lg text-muted-foreground max-w-lg mx-auto">
						{t(
							"tools.cinema.hero_subtitle",
							"Synchronized playback, live chat, and floating emojis. Enjoy videos in perfect sync with your friends.",
						)}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center gap-2">
						<Zap className="w-6 h-6 text-yellow-500" />
						<span className="text-sm font-bold">
							{t("tools.cinema.features_sync")}
						</span>
					</div>
					<div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center gap-2">
						<Users className="w-6 h-6 text-blue-500" />
						<span className="text-sm font-bold">
							{t(
								"tools.cinema.features_chat",
								"Live Chat & Emojis",
							)}
						</span>
					</div>
					<div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center gap-2">
						<MonitorPlay className="w-6 h-6 text-emerald-500" />
						<span className="text-sm font-bold">
							{t(
								"tools.cinema.features_p2p",
								"Direct P2P Streaming",
							)}
						</span>
					</div>
				</div>

				<Tabs defaultValue="create" className="w-full">
					<TabsList className="grid w-full grid-cols-2 bg-muted border border-border p-1 rounded-2xl mb-6">
						<TabsTrigger
							value="create"
							className="rounded-xl data-:bg-primary data-:text-primary-foreground"
						>
							{t("tools.cinema.create_tab")}
						</TabsTrigger>
						<TabsTrigger
							value="join"
							className="rounded-xl data-:bg-background data-:text-foreground"
						>
							{t("tools.cinema.join_tab")}
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="create"
						className="space-y-6 bg-card border border-border rounded-2xl p-6 backdrop-blur-md shadow-sm"
					>
						{!isP2p && (
							<div className="space-y-2">
								<Label className="text-foreground/80">
									{t("tools.cinema.url_label")}
								</Label>
								<Input
									placeholder={t(
										"tools.cinema.url_placeholder",
										"https://example.com/video.mp4",
									)}
									value={videoUrl}
									onChange={(e) =>
										setVideoUrl(e.target.value)
									}
									className="bg-background h-12 text-md"
								/>
							</div>
						)}

						<div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
							<div className="space-y-0.5">
								<Label>
									{t(
										"tools.cinema.local_file_toggle",
										"Local File Stream (P2P)",
									)}
								</Label>
								<p className="text-xs text-muted-foreground">
									Stream a video directly from your computer
									to viewers.
								</p>
							</div>
							<Switch
								checked={isP2p}
								onCheckedChange={setIsP2p}
							/>
						</div>

						{isP2p && (
							<div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
								<Label className="text-foreground/80">
									{t(
										"tools.cinema.select_file",
										"Select Video File",
									)}
								</Label>
								<Input
									type="file"
									accept="video/*"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) setLocalFile(file);
									}}
									className="bg-background h-12 pt-2.5 cursor-pointer"
								/>
							</div>
						)}

						<Button
							onClick={handleCreateRoom}
							disabled={
								isCreating ||
								(!isP2p && !videoUrl) ||
								(isP2p && !localFile)
							}
							className="w-full h-12 text-md font-bold rounded-xl"
						>
							<Play className="w-5 h-5 mr-2" />
							{isCreating
								? t("tools.cinema.creating")
								: t(
										"tools.cinema.start_btn",
										"Start Watch Party",
									)}
						</Button>
					</TabsContent>

					<TabsContent
						value="join"
						className="space-y-6 bg-card border border-border rounded-2xl p-6 backdrop-blur-md shadow-sm"
					>
						<div className="space-y-2">
							<Label className="text-foreground/80">
								{t(
									"tools.cinema.join_label",
									"Room Link or ID",
								)}
							</Label>
							<div className="relative">
								<LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
								<Input
									placeholder={t(
										"tools.cinema.join_placeholder",
										"Paste watch party link here",
									)}
									value={joinUrl}
									onChange={(e) => setJoinUrl(e.target.value)}
									className="bg-background h-12 text-md pl-10"
									onKeyDown={(e) => {
										if (e.key === "Enter") handleJoinRoom();
									}}
								/>
							</div>
						</div>

						<Button
							onClick={handleJoinRoom}
							disabled={!joinUrl}
							variant="secondary"
							className="w-full h-12 text-md font-bold rounded-xl"
						>
							{t("tools.cinema.join_btn")}
						</Button>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
