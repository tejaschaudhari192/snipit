import React from "react";
import { useTts } from "@/hooks/use-tts";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TtsMiniPlayer: React.FC = () => {
	const {
		isPlaying,
		isPaused,
		isPreparing,
		isModelLoading,
		modelProgress,
		spokenText,
		currentVoice,
		currentLanguage,
		pause,
		resume,
		stop,
	} = useTts();

	if (!isPlaying && !isPaused && !isPreparing && !isModelLoading) return null;

	const handlePlayPause = () => {
		if (isPlaying) {
			pause();
		} else {
			resume();
		}
	};

	const truncatedText = isModelLoading
		? `Loading Speech Model: ${modelProgress}%`
		: spokenText
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
						{isModelLoading || isPreparing ? (
							<div className="flex items-center justify-center">
								<svg
									className="animate-spin h-5 w-5 text-primary"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							</div>
						) : isPlaying && !isPaused ? (
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
							{isPreparing && !isModelLoading
								? "Preparing voice..."
								: truncatedText}
						</p>
						<p className="text-[10px] text-muted-foreground truncate">
							{isModelLoading
								? "Downloading local engine (~82MB, cached once)"
								: `${currentLanguage} | ${currentVoice}`}
						</p>
					</div>

					{/* Play/Pause & Stop buttons */}
					<div className="flex items-center gap-2">
						{!isPreparing && !isModelLoading && (
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

				{/* Progress bar for model load progress */}
				{isModelLoading && (
					<div className="w-full bg-muted-foreground/10 rounded-full h-1.5 overflow-hidden">
						<div
							className="bg-primary h-full transition-all duration-300"
							style={{ width: `${modelProgress}%` }}
						></div>
					</div>
				)}
			</div>
		</div>
	);
};
