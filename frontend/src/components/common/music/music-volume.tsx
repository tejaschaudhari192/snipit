import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MusicVolumeProps {
	volume: number;
	onVolumeChange: (vol: number) => void;
	quality: string;
	onQualityChange: (q: string) => void;
}

const MusicVolume: React.FC<MusicVolumeProps> = ({
	volume,
	onVolumeChange,
	quality,
	onQualityChange,
}) => {
	const handleToggleMute = () => {
		onVolumeChange(volume === 0 ? 50 : 0);
	};

	const handleSliderChange = (values: number[]) => {
		onVolumeChange(values[0]);
	};
	return (
		<div className="flex items-center gap-2.5 px-1 w-full text-muted-foreground">
			<button
				onClick={handleToggleMute}
				className="text-muted-foreground hover:text-foreground transition-colors shrink-0 outline-none"
			>
				{volume === 0 ? (
					<VolumeX className="h-4 w-4" />
				) : (
					<Volume2 className="h-4 w-4" />
				)}
			</button>

			<Slider
				value={[volume]}
				min={0}
				max={100}
				step={1}
				onValueChange={handleSliderChange}
				className="flex-1 py-1"
			/>

			<div className="flex items-center gap-2 shrink-0 select-none">
				<span className="text-[10px] font-medium text-muted-foreground tabular-nums w-8 text-right">
					{volume}%
				</span>

				<select
					value={quality}
					onChange={(e) => onQualityChange(e.target.value)}
					title="Streaming Audio Quality"
					className="bg-muted/40 hover:bg-muted border border-border/30 hover:border-border/60 rounded text-[9px] font-semibold py-0.5 px-1.5 outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-all shrink-0"
				>
					<option value="tiny" className="bg-background">
						Low
					</option>
					<option value="small" className="bg-background">
						Medium
					</option>
					<option value="medium" className="bg-background">
						High
					</option>
					<option value="default" className="bg-background">
						Auto
					</option>
				</select>
			</div>
		</div>
	);
};

export default MusicVolume;
