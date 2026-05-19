import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMusic } from "@/context/use-music";
import TrackItem from "./track-item";
import { cn } from "@/utils";

export const MusicQueueList: React.FC = () => {
	const { t } = useTranslation();
	const {
		playlist,
		currentTrack,
		playAtIndex,
		removeFromQueue,
		reorderQueue,
	} = useMusic();

	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === index) return;
		setDragOverIndex(index);
	};

	const handleDrop = (e: React.DragEvent, targetIndex: number) => {
		e.preventDefault();
		if (draggedIndex !== null && draggedIndex !== targetIndex) {
			reorderQueue(draggedIndex, targetIndex);
		}
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	if (playlist.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/40 rounded-md text-muted-foreground select-none w-full">
				<p className="text-xs">{t("music.no_tracks")}</p>
			</div>
		);
	}

	return (
		<div className="space-y-2 pt-2.5 border-t border-border/50 w-full min-w-0">
			<h3 className="text-[11px] font-semibold text-muted-foreground text-left truncate select-none">
				{t("music.up_next")}
			</h3>

			<div className="flex flex-col gap-1.5 w-full min-w-0 pr-1">
				{playlist.map((track, index) => {
					const isDragged = draggedIndex === index;
					const isDragOver = dragOverIndex === index;

					return (
						<div
							key={track.videoId}
							className={cn(
								"transition-all duration-200 rounded-md w-full",
								isDragged &&
									"opacity-30 scale-[0.98] border border-dashed border-primary/30 bg-muted/10",
								isDragOver &&
									"ring-1.5 ring-primary border-primary bg-primary/5 -translate-y-0.5 scale-[1.01] shadow-lg shadow-primary/5",
							)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDrop={(e) => handleDrop(e, index)}
						>
							<TrackItem
								track={track}
								isActive={
									currentTrack?.videoId === track.videoId
								}
								onClick={() => playAtIndex(index)}
								onRemove={() => removeFromQueue(track.videoId)}
								draggable={true}
								onDragStart={(e) => handleDragStart(e, index)}
								onDragEnd={handleDragEnd}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default MusicQueueList;
