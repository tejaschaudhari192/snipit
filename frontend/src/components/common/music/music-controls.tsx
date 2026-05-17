import React from "react";
import {
	Play,
	Pause,
	SkipForward,
	SkipBack,
	Shuffle,
	Repeat,
	Repeat1,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface MusicControlsProps {
	isPlaying: boolean;
	onPlay: () => void;
	onPause: () => void;
	onNext: () => void;
	onPrevious: () => void;
	shuffle: boolean;
	onToggleShuffle: () => void;
	repeat: "off" | "one" | "all";
	onToggleRepeat: () => void;
}

const MusicControls: React.FC<MusicControlsProps> = ({
	isPlaying,
	onPlay,
	onPause,
	onNext,
	onPrevious,
	shuffle,
	onToggleShuffle,
	repeat,
	onToggleRepeat,
}) => {
	return (
		<div className="flex items-center justify-between w-full px-1">
			<Button
				variant="ghost"
				size="icon"
				onClick={onToggleShuffle}
				className={cn(
					"h-8 w-8 rounded-md hover:bg-muted text-muted-foreground",
					shuffle && "text-primary bg-muted font-semibold",
				)}
			>
				<Shuffle className="h-4 w-4" />
			</Button>

			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					onClick={onPrevious}
					className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
				>
					<SkipBack className="h-4 w-4" />
				</Button>

				<Button
					variant="default"
					size="icon"
					onClick={isPlaying ? onPause : onPlay}
					className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
				>
					{isPlaying ? (
						<Pause className="h-4 w-4" />
					) : (
						<Play className="h-4 w-4 fill-current translate-x-0.5" />
					)}
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onClick={onNext}
					className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
				>
					<SkipForward className="h-4 w-4" />
				</Button>
			</div>

			<Button
				variant="ghost"
				size="icon"
				onClick={onToggleRepeat}
				className={cn(
					"h-8 w-8 rounded-md hover:bg-muted text-muted-foreground",
					repeat !== "off" && "text-primary bg-muted font-semibold",
				)}
			>
				{repeat === "one" ? (
					<Repeat1 className="h-4 w-4" />
				) : (
					<Repeat className="h-4 w-4" />
				)}
			</Button>
		</div>
	);
};

export default MusicControls;
