import { localStore } from "@/utils/storage";
import React, { useEffect, useState } from "react";
import { Music, Music2, Share2, X } from "lucide-react";
import { useMusic } from "@/context/use-music";
import { cn, decodeHtml } from "@/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

const MusicBubble: React.FC = () => {
	const {
		isPlaying,
		currentTrack,
		openPlayer,
		isLoading,
		isShared,
		isPlayerOpen,
	} = useMusic();
	const { t } = useTranslation();
	const [mounted, setMounted] = useState(false);
	const [isVisible, setIsVisible] = useState(() => {
		if (typeof window !== "undefined") {
			return localStore.getItem("music-bubble-visible") !== "false";
		}
		return true;
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if ((isPlaying && currentTrack) || isPlayerOpen) {
			setIsVisible(true);
			localStore.setItem("music-bubble-visible", "true");
		}
	}, [isPlaying, currentTrack, isPlayerOpen]);

	if (!mounted || !isVisible) return null;

	if (isLoading && !currentTrack) {
		return (
			<div className="fixed bottom-6 right-6 z-50">
				<div className="w-12 h-12 rounded-full bg-muted animate-pulse border border-border" />
			</div>
		);
	}

	if (currentTrack) {
		const displayTitle = decodeHtml(currentTrack.title || "");
		const displayChannel = decodeHtml(currentTrack.channel || "");

		return (
			<div className="fixed bottom-6 right-6 z-50 w-62 h-14 p-2 pr-3 flex items-center gap-2 rounded-2xl bg-popover border border-border shadow-2xl transition-all duration-300 hover:scale-[1.02] group select-none text-popover-foreground">
				<div
					onClick={openPlayer}
					className="flex-1 flex items-center gap-2.5 min-w-0 cursor-pointer"
				>
					<div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border relative bg-muted flex items-center justify-center shadow-inner">
						{currentTrack.thumbnail ? (
							<img
								src={currentTrack.thumbnail}
								className="w-full h-full object-cover"
								alt=""
							/>
						) : (
							<Music2 className="w-4 h-4 text-muted-foreground" />
						)}
						{isShared && (
							<div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center border border-background shadow animate-pulse">
								<Share2 className="w-2.5 h-2.5 text-primary-foreground" />
							</div>
						)}
						<div className="absolute inset-0 bg-foreground/5 pointer-events-none" />
					</div>

					<div className="flex-1 min-w-0 flex flex-col text-left justify-center">
						<p className="text-[10px] font-bold text-foreground truncate leading-tight">
							{displayTitle || t("music.now_playing")}
						</p>
						<p className="text-[8.5px] text-muted-foreground truncate mt-0.5 leading-none">
							{displayChannel || "Unknown Artist"}
						</p>
					</div>

					<div className="flex flex-col items-end gap-1.5 shrink-0 pl-0.5">
						<span className="text-[7.5px] font-black bg-muted text-muted-foreground px-1 py-0.5 rounded leading-none uppercase tracking-wider scale-90 origin-right border border-border">
							IN
						</span>

						<div className="flex gap-0.5 h-2.5 items-end">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className={cn(
										"w-[1.5px] bg-primary rounded-full transition-all duration-300",
										isPlaying
											? "animate-[equalizer-bar_1.2s_ease-in-out_infinite]"
											: "",
									)}
									style={{
										animationDelay: `${i * 0.2}s`,
										height: isPlaying
											? `${30 + i * 20}%`
											: "30%",
									}}
								/>
							))}
						</div>
					</div>
				</div>

				<button
					onClick={(e) => {
						e.stopPropagation();
						setIsVisible(false);
						localStore.setItem("music-bubble-visible", "false");
					}}
					className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
					aria-label="Hide Music Player"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			</div>
		);
	}

	return (
		<div className="fixed bottom-6 right-6 z-50 group/bubble">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							onClick={openPlayer}
							className={cn(
								"w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group shadow-2xl",
								isPlaying
									? "bg-primary text-primary-foreground shadow-primary/30"
									: "bg-popover text-muted-foreground border border-border hover:border-primary/50 hover:text-primary",
							)}
							aria-label="Open Music Player"
						>
							<div className="relative flex items-center justify-center">
								<Music className="w-6 h-6 transition-transform group-hover:rotate-12" />
							</div>

							<div className="absolute -top-1 -right-1 bg-popover text-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full border border-border shadow-lg truncate max-w-[40px]">
								IN
							</div>
						</button>
					</TooltipTrigger>
					<TooltipContent
						side="left"
						className="bg-popover border-border text-foreground text-[10px] font-bold uppercase tracking-widest"
					>
						<p>{t("music.open_player")}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsVisible(false);
					localStore.setItem("music-bubble-visible", "false");
				}}
				className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-popover border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow cursor-pointer z-60"
				aria-label="Hide Music Player"
			>
				<X className="h-3 w-3" />
			</button>
		</div>
	);
};

export default MusicBubble;
