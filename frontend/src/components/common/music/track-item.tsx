import React from "react";
import { cn, decodeHtml } from "@/utils";
import type { MusicTrack } from "@/types";
import { Plus, Minus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic } from "@/context/use-music";
import DownloadDropdown from "./download-dropdown";
import EqualizerIcon from "./equalizer-icon";

interface TrackItemProps {
	track: MusicTrack;
	isActive: boolean;
	onClick: () => void;
	onPlayNext?: () => void;
	onRemove?: () => void;
	draggable?: boolean;
	onDragStart?: (e: React.DragEvent) => void;
	onDragEnd?: (e: React.DragEvent) => void;
	onDragOver?: (e: React.DragEvent) => void;
	onDrop?: (e: React.DragEvent) => void;
}

const TrackItem: React.FC<TrackItemProps> = ({
	track,
	isActive,
	onClick,
	onPlayNext,
	onRemove,
	draggable,
	onDragStart,
	onDragEnd,
	onDragOver,
	onDrop,
}) => {
	const { isPlaying } = useMusic();

	return (
		<div
			draggable={draggable}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
			onDrop={onDrop}
			className={cn(
				"flex items-center justify-between p-1.5 rounded-md transition-all w-full text-xs border outline-none min-w-0",
				isActive
					? "bg-muted font-medium border-border text-foreground shadow-sm"
					: "bg-transparent border-transparent hover:bg-muted/30 text-muted-foreground hover:text-foreground",
			)}
		>
			<div className="flex items-center gap-1.5 flex-1 min-w-0">
				{draggable && (
					<div
						className="cursor-grab active:cursor-grabbing text-muted-foreground/35 hover:text-foreground/70 p-0.5 transition-colors shrink-0"
						title="Drag to reorder"
					>
						<GripVertical className="w-3.5 h-3.5" />
					</div>
				)}

				<div
					onClick={onClick}
					className="flex-1 flex items-center gap-2.5 cursor-pointer min-w-0 select-none"
				>
					<div className="w-7 h-7 rounded overflow-hidden shrink-0 border border-border/50 bg-muted relative">
						<img
							src={track.thumbnail}
							className="w-full h-full object-cover select-none"
							alt=""
						/>
						{isActive && <EqualizerIcon isPlaying={isPlaying} />}
					</div>
					<div className="flex-1 min-w-0">
						<p className="truncate font-medium text-[11px] leading-snug">
							{decodeHtml(track.title)}
						</p>
						<p className="text-[9px] text-muted-foreground/70 truncate leading-none mt-0.5">
							{decodeHtml(track.channel)}
						</p>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-0.5 shrink-0 ml-1.5">
				{onPlayNext && (
					<Button
						variant="ghost"
						size="icon"
						onClick={(e) => {
							e.stopPropagation();
							onPlayNext();
						}}
						className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/30 transition-colors shrink-0"
						title="Play Next"
					>
						<Plus className="w-3.5 h-3.5" />
					</Button>
				)}

				{onRemove && (
					<Button
						variant="ghost"
						size="icon"
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						className="h-7 w-7 text-red-500/70 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors shrink-0"
						title="Remove from Queue"
					>
						<Minus className="w-3.5 h-3.5" />
					</Button>
				)}

				<DownloadDropdown
					videoId={track.videoId}
					title={track.title}
					size="sm"
				/>
			</div>
		</div>
	);
};

export default TrackItem;
