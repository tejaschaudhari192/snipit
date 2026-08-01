import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
	onQualityChange}) => {
	const handleToggleMute = () => {
		onVolumeChange(volume === 0 ? 50 : 0);
	};

	const handleSliderChange = (values: number[]) => {
		onVolumeChange(values[0]);
	};
	return (
		<div className="flex items-center gap-2.5 px-1 w-full text-muted-foreground">
			<Button
				variant="ghost"
				size="icon"
				onClick={handleToggleMute}
				className="text-muted-foreground hover:text-foreground transition-colors shrink-0 outline-none h-6 w-6 p-0 hover:bg-transparent"
			>
				{volume === 0 ? (
					<VolumeX className="h-4 w-4" />
				) : (
					<Volume2 className="h-4 w-4" />
				)}
			</Button>

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

				<Select value={quality} onValueChange={onQualityChange}>
					<SelectTrigger
						className="bg-muted/40 hover:bg-muted border border-border/30 hover:border-border/60 rounded text-[9px] font-semibold h-5 py-0 px-1.5 outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-all shrink-0 focus:ring-0 shadow-none w-auto gap-1 [&>svg]:h-3 [&>svg]:w-3"
						title="Streaming Audio Quality"
					>
						<SelectValue placeholder="Auto" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tiny" className="text-[10px] font-medium">Low</SelectItem>
						<SelectItem value="small" className="text-[10px] font-medium">Medium</SelectItem>
						<SelectItem value="medium" className="text-[10px] font-medium">High</SelectItem>
						<SelectItem value="default" className="text-[10px] font-medium">Auto</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};

export default MusicVolume;
