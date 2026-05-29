import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
	Play,
	Pause,
	Volume2,
	VolumeX,
	Volume,
	Volume1,
	Maximize,
	Minimize,
} from "lucide-react";

interface CinemaControlsProps {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isFullscreen: boolean;
	isControlsHovered: boolean;
	emojis: string[];
	formatDuration: (seconds: number) => string;
	handlePlayPause: () => void;
	handleToggleMute: () => void;
	handleFullscreen: () => void;
	sendReaction: (emoji: string) => void;
	setVolume: (v: number) => void;
	setCurrentTime: (t: number) => void;
	emitVideoState: (action: "play" | "pause" | "seek", time: number) => void;
	videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const CinemaControls = ({
	isPlaying,
	currentTime,
	duration,
	volume,
	isFullscreen,
	isControlsHovered,
	emojis,
	formatDuration,
	handlePlayPause,
	handleToggleMute,
	handleFullscreen,
	sendReaction,
	setVolume,
	setCurrentTime,
	emitVideoState,
	videoRef,
}: CinemaControlsProps) => {
	return (
		<div
			className={`absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent z-30 flex flex-col gap-3 transition-opacity duration-300 ${
				!isPlaying || isControlsHovered
					? "opacity-100 pointer-events-auto"
					: "opacity-0 pointer-events-none"
			}`}
		>
			{/* Shadcn progress Slider */}
			<div className="flex items-center gap-4">
				<span className="text-xs font-semibold text-white/80 select-none min-w-[40px] text-right">
					{formatDuration(currentTime)}
				</span>
				<Slider
					value={[currentTime]}
					max={duration || 100}
					step={0.1}
					onValueChange={(values) => {
						const val = values[0];
						if (val !== undefined && videoRef.current) {
							videoRef.current.currentTime = val;
							setCurrentTime(val);
							emitVideoState("seek", val);
						}
					}}
					className="flex-1 cursor-pointer"
				/>
				<span className="text-xs font-semibold text-white/80 select-none min-w-[40px]">
					{formatDuration(duration)}
				</span>
			</div>

			{/* Playback Buttons, Volume, & Reaction Tray */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={handlePlayPause}
						className="h-10 w-10 text-white hover:bg-white/10 rounded-xl"
					>
						{isPlaying ? (
							<Pause className="w-5 h-5 fill-white" />
						) : (
							<Play className="w-5 h-5 fill-white" />
						)}
					</Button>

					<div className="flex items-center gap-2 group/volume">
						{(() => {
							const iconClass =
								"w-4 h-4 text-white/80 shrink-0 cursor-pointer hover:text-white transition-colors";
							if (volume === 0) {
								return (
									<VolumeX
										className={iconClass}
										onClick={handleToggleMute}
									/>
								);
							}
							if (volume < 0.33) {
								return (
									<Volume
										className={iconClass}
										onClick={handleToggleMute}
									/>
								);
							}
							if (volume < 0.66) {
								return (
									<Volume1
										className={iconClass}
										onClick={handleToggleMute}
									/>
								);
							}
							return (
								<Volume2
									className={iconClass}
									onClick={handleToggleMute}
								/>
							);
						})()}
						<div className="w-0 group-hover/volume:w-20 transition-all duration-300 flex items-center overflow-hidden">
							<Slider
								value={[volume]}
								max={1}
								step={0.05}
								onValueChange={(values) => {
									const val = values[0];
									if (val !== undefined) {
										setVolume(val);
										if (videoRef.current)
											videoRef.current.volume = val;
									}
								}}
								className="w-16 ml-1.5 cursor-pointer"
							/>
						</div>
					</div>
				</div>

				{/* Quick Flying Reaction Tray & Fullscreen */}
				<div className="flex items-center gap-2">
					<div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
						{emojis.map((emoji) => (
							<button
								key={emoji}
								onClick={() => sendReaction(emoji)}
								className="hover:scale-125 hover:rotate-6 text-xl transition-transform px-1"
							>
								{emoji}
							</button>
						))}
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleFullscreen}
						className="h-10 w-10 text-white hover:bg-white/10 rounded-xl shrink-0"
					>
						{isFullscreen ? (
							<Minimize className="w-5 h-5" />
						) : (
							<Maximize className="w-5 h-5" />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};
