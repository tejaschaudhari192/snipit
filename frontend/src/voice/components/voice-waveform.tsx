import React from "react";

interface VoiceWaveformProps {
	active: boolean;
	type?: "listening" | "speaking" | "thinking";
	bars?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
	active,
	type = "listening",
	bars = 9,
}) => {
	if (!active) return null;

	// Different color ramps based on state
	const getBarColor = (index: number) => {
		if (type === "listening") {
			return index % 2 === 0
				? "bg-gradient-to-t from-rose-500 to-amber-400"
				: "bg-gradient-to-t from-pink-500 to-rose-400";
		}
		if (type === "thinking") {
			return index % 2 === 0
				? "bg-gradient-to-t from-amber-400 to-cyan-400"
				: "bg-gradient-to-t from-indigo-500 to-purple-400";
		}
		// speaking
		return index % 2 === 0
			? "bg-gradient-to-t from-cyan-500 to-blue-400"
			: "bg-gradient-to-t from-indigo-400 to-teal-300";
	};

	// Heights array to create an organic sound wave shape
	const heights = [35, 60, 90, 75, 100, 70, 85, 50, 30];
	const delays = [100, 240, 150, 320, 200, 280, 120, 360, 180];

	return (
		<div
			className="flex items-center justify-center gap-0.5 h-6 px-1.5"
			aria-hidden="true"
		>
			{Array.from({ length: Math.min(bars, heights.length) }).map(
				(_, i) => {
					const heightPercent = heights[i % heights.length];
					const delayMs = delays[i % delays.length];

					return (
						<span
							key={i}
							style={{
								height: `${Math.max(20, heightPercent * 0.22)}px`,
								animationDelay: `${delayMs}ms`,
								animationDuration:
									type === "thinking" ? "1.2s" : "0.75s",
							}}
							className={`w-1 rounded-full animate-[pulse_infinite_ease-in-out] shadow-[0_0_8px_rgba(255,255,255,0.2)] ${getBarColor(
								i,
							)} transition-all`}
						/>
					);
				},
			)}
		</div>
	);
};
