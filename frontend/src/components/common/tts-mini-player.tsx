import React from "react";
import { useTts } from "@/hooks/use-tts";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TtsMiniPlayer: React.FC = () => {
	const {
		isPlaying,
		isPaused,
		isPreparing,
		spokenText,
		currentVoice,
		currentLanguage,
		pause,
		resume,
		stop,
	} = useTts();

	if (!isPlaying && !isPaused && !isPreparing) return null;

	const handlePlayPause = () => {
		if (isPlaying) {
			pause();
		} else {
			resume();
		}
	};

	const truncatedText = spokenText
		? spokenText.length > 50
			? `${spokenText.substring(0, 50)}...`
			: spokenText
		: "Text-to-Speech playback";

	return (
		<div className="fixed bottom-6 right-6 z-150 animate-in fade-in slide-in-from-bottom-6 duration-300">
			<div className="w-80 md:w-96 rounded-3xl border border-white/10 bg-background/70 backdrop-blur-2xl p-4 shadow-2xl ring-1 ring-black/20 flex flex-col gap-3">
				{/* Top section: Info and controls */}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
						{isPlaying && !isPaused ? (
							<div className="flex items-end gap-[2px] h-4">
								<div
									className="w-[3px] bg-primary animate-bounce rounded-full h-3"
									style={{ animationDelay: "0ms" }}
								></div>
								<div
									className="w-[3px] bg-primary animate-bounce rounded-full h-2"
									style={{ animationDelay: "150ms" }}
								></div>
								<div
									className="w-[3px] bg-primary animate-bounce rounded-full h-4"
									style={{ animationDelay: "300ms" }}
								></div>
							</div>
						) : (
							<Volume2 className="h-5 w-5" />
						)}
					</div>

					<div className="flex-1 min-w-0">
						<p className="text-xs font-semibold text-primary truncate">
							{isPreparing ? "Preparing voice..." : truncatedText}
						</p>
						<p className="text-[10px] text-muted-foreground truncate">
							{currentLanguage} | {currentVoice}
						</p>
					</div>

					{/* Play/Pause & Stop buttons */}
					<div className="flex items-center gap-2">
						{!isPreparing && (
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={handlePlayPause}
								className="h-8 w-8 rounded-xl bg-muted/40 hover:bg-muted/80 text-foreground transition-all"
							>
								{isPlaying ? (
									<Pause className="h-4 w-4 fill-current" />
								) : (
									<Play className="h-4 w-4 fill-current ml-0.5" />
								)}
							</Button>
						)}
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={stop}
							className="h-8 w-8 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all"
						>
							<Square className="h-3.5 w-3.5 fill-current" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
