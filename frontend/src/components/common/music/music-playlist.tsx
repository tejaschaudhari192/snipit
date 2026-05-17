import React from "react";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import type { MusicTrack } from "@/types";

interface MusicPlaylistProps {
	playlist: MusicTrack[];
	currentTrack: MusicTrack | null;
	onTrackSelect: (index: number) => void;
}

const MusicPlaylist: React.FC<MusicPlaylistProps> = ({
	playlist,
	currentTrack,
	onTrackSelect,
}) => {
	const { t } = useTranslation();

	// Robust decoding for display
	const decode = (str: string) => {
		if (!str) return "";
		const txt = document.createElement("textarea");
		txt.innerHTML = str;
		return txt.value;
	};

	return (
		<div className="w-full space-y-4">
			<h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1">
				{t("music.up_next")}
			</h3>

			<div className="flex flex-col gap-2">
				{playlist.map((track, index) => {
					const isActive = currentTrack?.videoId === track.videoId;
					return (
						<button
							key={track.videoId}
							onClick={() => onTrackSelect(index)}
							className={cn(
								"flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 text-left border group",
								isActive
									? "bg-primary/10 border-primary/20 shadow-[0_8px_20px_rgba(var(--primary),0.05)]"
									: "bg-white/2 border-transparent hover:bg-white/5 hover:border-white/5",
							)}
						>
							<div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
								<img
									src={track.thumbnail}
									alt=""
									className={cn(
										"w-full h-full object-cover transition-transform duration-500",
										isActive
											? "scale-110"
											: "group-hover:scale-110",
									)}
								/>
								{isActive && (
									<div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
										<div className="flex gap-0.5 h-3 items-end">
											{[1, 2, 3].map((i) => (
												<div
													key={i}
													className="w-0.5 bg-white rounded-full animate-[equalizer-bar_0.8s_ease-in-out_infinite]"
													style={{
														animationDelay: `${i * 0.15}s`,
													}}
												/>
											))}
										</div>
									</div>
								)}
							</div>

							<div className="flex-1 min-w-0 space-y-0.5">
								<p
									className={cn(
										"text-sm font-bold truncate transition-colors",
										isActive
											? "text-primary"
											: "text-zinc-200 group-hover:text-white",
									)}
								>
									{decode(track.title)}
								</p>
								<p className="text-[10px] text-zinc-500 truncate uppercase font-medium tracking-wider">
									{decode(track.channel)}
								</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default MusicPlaylist;
