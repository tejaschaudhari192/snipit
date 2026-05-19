import React, { useEffect, useState } from "react";
import { useMusic } from "@/context/use-music";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MusicProgress from "./music-progress";
import MusicControls from "./music-controls";
import MusicVolume from "./music-volume";
import SearchBar from "./search-bar";
import NowPlayingCard from "./now-playing-card";
import MusicQueueList from "./music-queue-list";
import MusicSearchResults from "./music-search-results";
import SharedSyncBanner from "./shared-sync-banner";
import MusicPlayerHeader from "./music-player-header";

const MusicPlayerModal: React.FC = () => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const {
		isPlayerOpen,
		closePlayer,
		isPlaying,
		currentTrack,
		volume,
		duration,
		currentTime,
		shuffle,
		repeat,
		quality,
		play,
		pause,
		next,
		previous,
		seekTo,
		setVolume,
		changeQuality,
		toggleShuffle,
		toggleRepeat,
		isLoading,
		searchTracks,
	} = useMusic();

	if (!mounted) return null;

	return (
		<Dialog
			open={isPlayerOpen}
			onOpenChange={(open) => !open && closePlayer()}
		>
			<DialogContent className="p-5 gap-4 border border-border bg-background shadow-lg rounded-lg outline-none text-foreground z-100 font-sans">
				{/* Componentized Header Controls */}
				<MusicPlayerHeader />

				{/* Componentized Search input */}
				<SearchBar onSearch={searchTracks} isLoading={isLoading} />

				{/* Componentized Search Results */}
				<MusicSearchResults />

				<div className="w-full min-w-0 flex flex-col gap-4">
					{/* Isolated Now Playing Track Panel */}
					<NowPlayingCard track={currentTrack} />

					{/* Componentized Sync Room broadcasting status banner */}
					<SharedSyncBanner />

					{/* Playback Controls & Progress bar Deck */}
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
							quality={quality}
							onQualityChange={changeQuality}
						/>
					</div>

					{/* Componentized Reorderable Queue List */}
					<MusicQueueList />
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default MusicPlayerModal;
