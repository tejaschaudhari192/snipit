import React from "react";

interface VoiceWaveformProps {
	waveform: number[];
}

/**
 * Renders a rolling waveform history as a series of bars.
 */
export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ waveform }) => {
	return (
		<div className="flex-1 w-37.5 min-w-10 max-w-60 h-8 overflow-hidden">
			<div className="flex items-center justify-end gap-px h-full">
				{waveform.map((val, i) => (
					<div
						key={i}
						className="w-0.5 bg-primary rounded-full transition-opacity shrink-0"
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
