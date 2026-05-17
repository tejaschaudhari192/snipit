import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MusicVolumeProps {
	volume: number;
	onVolumeChange: (vol: number) => void;
}

const MusicVolume: React.FC<MusicVolumeProps> = ({
	volume,
	onVolumeChange,
}) => {
	const handleToggleMute = () => {
		onVolumeChange(volume === 0 ? 50 : 0);
	};

	const handleSliderChange = (values: number[]) => {
		onVolumeChange(values[0]);
	};
	return (
		<div className="flex items-center gap-2 px-1 w-full text-muted-foreground">
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

			<span className="text-[10px] font-medium text-muted-foreground tabular-nums w-7 text-right shrink-0 select-none">
				{volume}%
			</span>
		</div>
	);
};

export default MusicVolume;
