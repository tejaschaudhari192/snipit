import React from "react";

interface VoiceWaveformProps {
	waveform: number[];
}

/**
 * Renders a rolling waveform history as a series of bars.
 */
export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ waveform }) => {
	return (
		<div className="flex-1 w-[150px] min-w-[40px] max-w-[240px] h-8 overflow-hidden">
			<div className="flex items-center justify-end gap-px h-full">
				{waveform.map((val, i) => (
					<div
						key={i}
						className="w-[2px] bg-primary rounded-full transition-opacity shrink-0"
						style={{
							height: `${Math.max(10, val)}%`,
							opacity: 0.3 + (val / 100) * 0.7,
						}}
					/>
				))}
			</div>
		</div>
	);
};
