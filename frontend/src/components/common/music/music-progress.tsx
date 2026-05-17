import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface MusicProgressProps {
	currentTime: number;
	duration: number;
	onSeek: (seconds: number) => void;
}

const MusicProgress: React.FC<MusicProgressProps> = ({
	currentTime,
	duration,
	onSeek,
}) => {
	const [isSeeking, setIsSeeking] = useState(false);
	const [seekValue, setSeekValue] = useState(0);

	// Synchronize local seek value with external currentTime when not seeking
	useEffect(() => {
		if (!isSeeking) {
			setSeekValue(currentTime);
		}
	}, [currentTime, isSeeking]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const handleValueChange = (values: number[]) => {
		setIsSeeking(true);
		setSeekValue(values[0]);
	};

	const handleValueCommit = (values: number[]) => {
		onSeek(values[0]);
		setIsSeeking(false);
	};

	return (
		<div className="w-full space-y-1">
			<Slider
				value={[seekValue]}
				min={0}
				max={duration || 100}
				step={1}
				onValueChange={handleValueChange}
				onValueCommit={handleValueCommit}
				className="py-1"
			/>

			<div className="flex justify-between text-[10px] font-medium text-muted-foreground tabular-nums">
				<span>{formatTime(seekValue)}</span>
				<span>{formatTime(duration)}</span>
			</div>
		</div>
	);
};

export default MusicProgress;
