import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic } from "@/context/use-music";
import TrackItem from "./track-item";

export const MusicSearchResults: React.FC = () => {
	const {
		searchResults,
		currentTrack,
		playSearchTrack,
		playNext,
		clearSearch,
	} = useMusic();

	if (searchResults.length === 0) return null;

	return (
		<div className="space-y-2 pt-1.5 w-full min-w-0 border-b border-border/50 pb-3">
			<div className="flex items-center justify-between w-full min-w-0">
				<h3 className="text-[11px] font-semibold text-primary text-left truncate uppercase tracking-wider select-none">
					Search Results
				</h3>
				<Button
					variant="ghost"
					size="sm"
					onClick={clearSearch}
					className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground flex items-center gap-1"
				>
					<X className="w-3 h-3" />
					Clear Results
				</Button>
			</div>

			<div className="flex flex-col gap-1 w-full min-w-0 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
				{searchResults.map((track) => (
					<TrackItem
						key={track.videoId}
						track={track}
						isActive={currentTrack?.videoId === track.videoId}
						onClick={() => playSearchTrack(track)}
						onPlayNext={() => playNext(track)}
					/>
				))}
			</div>
		</div>
	);
};

export default MusicSearchResults;
