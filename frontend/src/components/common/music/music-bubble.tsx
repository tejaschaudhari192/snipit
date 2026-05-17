import React, { useEffect, useState } from "react";
import { Music, Music2 } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
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
		regionDisplayName,
		isLoading,
	} = useMusic();
	const { t } = useTranslation();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

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
			<button
				onClick={openPlayer}
				className="fixed bottom-6 right-6 z-50 w-56 h-14 p-2 pr-3 flex items-center gap-2.5 rounded-2xl bg-popover hover:bg-muted/80 border border-border shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group text-left cursor-pointer outline-none select-none text-popover-foreground"
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
						{regionDisplayName?.substring(0, 2).toUpperCase() ||
							"IN"}
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
			</button>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						onClick={openPlayer}
						className={cn(
							"fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group shadow-2xl",
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
							{regionDisplayName?.substring(0, 2).toUpperCase() ||
								"IN"}
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
	);
};

export default MusicBubble;
