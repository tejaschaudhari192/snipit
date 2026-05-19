import React, { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Volume2, RefreshCw, X, Share2 } from "lucide-react";
import { cn, decodeHtml } from "@/utils";
import { useMusic } from "@/context/use-music";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RegionSelector from "./region-selector";
import MusicProgress from "./music-progress";
import MusicControls from "./music-controls";
import MusicVolume from "./music-volume";

const MusicPlayerModal: React.FC = () => {
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState("");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const {
		isPlayerOpen,
		closePlayer,
		isPlaying,
		currentTrack,
		playlist,
		searchResults,
		region,
		volume,
		duration,
		currentTime,
		shuffle,
		repeat,
		play,
		pause,
		next,
		previous,
		seekTo,
		setVolume,
		toggleShuffle,
		toggleRepeat,
		changeRegion,
		refreshPlaylist,
		isLoading,
		playAtIndex,
		searchTracks,
		playSearchTrack,
		clearSearch,
		isShared,
		isInitiator,
		sharedByUser,
		toggleShare,
		pasteId,
	} = useMusic();

	const displayTitle = useMemo(
		() => decodeHtml(currentTrack?.title || ""),
		[currentTrack?.title],
	);
	const displayChannel = useMemo(
		() => decodeHtml(currentTrack?.channel || ""),
		[currentTrack?.channel],
	);

	const handleSearch = () => {
		if (searchQuery.trim()) {
			searchTracks(searchQuery);
		}
	};

	if (!mounted) return null;

	return (
		<Dialog
			open={isPlayerOpen}
			onOpenChange={(open) => !open && closePlayer()}
		>
			<DialogContent className="p-5 gap-4 border border-border bg-background shadow-lg rounded-lg outline-none text-foreground">
				<DialogHeader className="flex flex-row items-center justify-between space-y-0 pr-8 w-full min-w-0">
					<div className="flex flex-col text-left min-w-0 flex-1 pr-2">
						<DialogTitle className="text-sm font-semibold tracking-tight truncate">
							{t("music.now_playing")}
						</DialogTitle>
						<DialogDescription className="text-[11px] text-muted-foreground truncate">
							{searchResults.length > 0
								? `${searchResults.length} search results found`
								: `${playlist.length} ${t("music.tracks_available")}`}
						</DialogDescription>
					</div>

					<div className="flex items-center gap-1.5 shrink-0">
						{pasteId && (
							<Button
								variant={isShared ? "default" : "outline"}
								size="sm"
								onClick={toggleShare}
								className={cn(
									"h-8 px-2.5 text-xs font-semibold gap-1.5 transition-all duration-300 border",
									isShared
										? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20 border-primary"
										: "text-muted-foreground border-border hover:text-foreground hover:bg-muted/30",
								)}
							>
								<Share2
									className={cn(
										"w-3.5 h-3.5",
										isShared && "animate-pulse",
									)}
								/>
								{isShared ? "Shared" : "Share"}
							</Button>
						)}
						<RegionSelector
							currentRegion={region}
							onRegionChange={changeRegion}
						/>
						<Button
							variant="ghost"
							size="icon"
							onClick={refreshPlaylist}
							disabled={isLoading}
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
						>
							<RefreshCw
								className={cn(
									"w-4 h-4",
									isLoading && "animate-spin",
								)}
							/>
						</Button>
					</div>
				</DialogHeader>

				<div className="flex items-center gap-2 w-full min-w-0">
					<Input
						type="text"
						placeholder={t("music.search_placeholder")}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSearch();
						}}
						className="h-8 text-xs flex-1 bg-background border-border min-w-0"
					/>
					<Button
						size="sm"
						disabled={isLoading}
						onClick={handleSearch}
						className="h-8 text-xs font-medium px-3 shrink-0"
					>
						{t("music.search")}
					</Button>
				</div>

				<div className="w-full min-w-0 flex flex-col gap-4">
					<div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-lg border border-border/50 w-full min-w-0">
						<div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-border bg-muted flex items-center justify-center">
							{currentTrack?.thumbnail ? (
								<img
									src={currentTrack.thumbnail}
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
							<p className="text-[10px] text-muted-foreground truncate">
								{displayChannel || "Unknown Artist"}
							</p>
							<span className="inline-block text-[9px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">
								{region.substring(0, 3)}
							</span>
						</div>
					</div>

					{isShared && (
						<div
							className={cn(
								"flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-semibold tracking-wide border transition-all duration-300",
								isInitiator
									? "bg-primary/10 border-primary/20 text-primary animate-pulse"
									: "bg-muted border-border text-muted-foreground",
							)}
						>
							<span className="w-1.5 h-1.5 rounded-full bg-current" />
							{isInitiator
								? "Broadcasting playback live to room members..."
								: `Synced to shared room stream (${sharedByUser || "DJ"})`}
						</div>
					)}

					<div className="space-y-3.5 w-full min-w-0">
						<MusicProgress
							currentTime={currentTime}
							duration={duration}
							onSeek={seekTo}
						/>

						<MusicControls
							isPlaying={isPlaying}
							onPlay={play}
							onPause={pause}
							onNext={next}
							onPrevious={previous}
							shuffle={shuffle}
							onToggleShuffle={toggleShuffle}
							repeat={repeat}
							onToggleRepeat={toggleRepeat}
						/>

						<MusicVolume
							volume={volume}
							onVolumeChange={setVolume}
						/>
					</div>

					{searchResults.length > 0 ? (
						<div className="space-y-2 pt-2.5 border-t border-border/50 w-full min-w-0">
							<div className="flex items-center justify-between w-full min-w-0">
								<h3 className="text-[11px] font-semibold text-primary text-left truncate uppercase tracking-wider">
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

							<div className="flex flex-col gap-1 w-full min-w-0">
								{searchResults.map((track) => {
									const isActive =
										currentTrack?.videoId === track.videoId;
									return (
										<button
											key={track.videoId}
											onClick={() =>
												playSearchTrack(track)
											}
											className={cn(
												"flex items-center gap-2.5 p-1.5 rounded-md transition-colors text-left w-full text-xs border outline-none min-w-0",
												isActive
													? "bg-muted font-medium border-border text-foreground"
													: "bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground",
											)}
										>
											<div className="w-7 h-7 rounded overflow-hidden shrink-0 border border-border/50 bg-muted">
												<img
													src={track.thumbnail}
													className="w-full h-full object-cover"
													alt=""
												/>
											</div>
											<div className="flex-1 min-w-0">
												<p className="truncate font-medium text-[11px]">
													{decodeHtml(track.title)}
												</p>
												<p className="text-[9px] text-muted-foreground/70 truncate">
													{decodeHtml(track.channel)}
												</p>
											</div>
										</button>
									);
								})}
							</div>
						</div>
					) : (
						<div className="space-y-2 pt-2.5 border-t border-border/50 w-full min-w-0">
							<h3 className="text-[11px] font-semibold text-muted-foreground text-left truncate">
								{t("music.up_next")}
							</h3>

							<div className="flex flex-col gap-1 w-full min-w-0">
								{playlist.map((track, index) => {
									const isActive =
										currentTrack?.videoId === track.videoId;
									return (
										<button
											key={track.videoId}
											onClick={() => playAtIndex(index)}
											className={cn(
												"flex items-center gap-2.5 p-1.5 rounded-md transition-colors text-left w-full text-xs border outline-none min-w-0",
												isActive
													? "bg-muted font-medium border-border text-foreground"
													: "bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground",
											)}
										>
											<div className="w-7 h-7 rounded overflow-hidden shrink-0 border border-border/50 bg-muted">
												<img
													src={track.thumbnail}
													className="w-full h-full object-cover"
													alt=""
												/>
											</div>
											<div className="flex-1 min-w-0">
												<p className="truncate font-medium text-[11px]">
													{decodeHtml(track.title)}
												</p>
												<p className="text-[9px] text-muted-foreground/70 truncate">
													{decodeHtml(track.channel)}
												</p>
											</div>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default MusicPlayerModal;
