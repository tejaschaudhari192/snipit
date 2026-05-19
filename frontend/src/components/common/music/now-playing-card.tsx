import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Volume2 } from "lucide-react";
import { decodeHtml } from "@/utils";
import type { MusicTrack } from "@/types";
import DownloadDropdown from "./download-dropdown";

interface NowPlayingCardProps {
	track: MusicTrack | null;
}

const NowPlayingCard: React.FC<NowPlayingCardProps> = ({ track }) => {
	const { t } = useTranslation();

	const displayTitle = useMemo(
		() => decodeHtml(track?.title || ""),
		[track?.title],
	);
	const displayChannel = useMemo(
		() => decodeHtml(track?.channel || ""),
		[track?.channel],
	);

	return (
		<div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-lg border border-border/50 w-full min-w-0 justify-between">
			<div className="flex items-center gap-3 min-w-0 flex-1">
				<div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-border bg-muted flex items-center justify-center select-none">
					{track?.thumbnail ? (
						<img
							src={track.thumbnail}
							className="w-full h-full object-cover select-none"
							alt=""
						/>
					) : (
						<Volume2 className="h-5 w-5 text-muted-foreground/45" />
					)}
				</div>

				<div className="flex-1 min-w-0 space-y-0.5 text-left">
					<h2 className="text-xs font-semibold text-foreground truncate leading-snug">
						{displayTitle || t("music.no_tracks")}
					</h2>
					<p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
						{displayChannel || t("music.unknown_artist")}
					</p>
				</div>
			</div>

			{track && (
				<DownloadDropdown
					videoId={track.videoId}
					title={track.title}
					size="md"
				/>
			)}
		</div>
	);
};

export default NowPlayingCard;
