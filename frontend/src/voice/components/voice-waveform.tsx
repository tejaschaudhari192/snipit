import React from "react";

interface VoiceWaveformProps {
	active: boolean;
	type?: "listening" | "speaking";
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
	active,
	type = "listening",
}) => {
	if (!active) return null;

	const barColor = type === "listening" ? "bg-rose-500" : "bg-cyan-400";

	return (
		<div className="flex items-center justify-center gap-1 h-5 px-1">
			<span
				className={`w-1 rounded-full animate-[bounce_0.8s_infinite_100ms] ${barColor} h-3`}
			/>
			<span
				className={`w-1 rounded-full animate-[bounce_0.8s_infinite_200ms] ${barColor} h-5`}
			/>
			<span
				className={`w-1 rounded-full animate-[bounce_0.8s_infinite_300ms] ${barColor} h-4`}
			/>
			<span
				className={`w-1 rounded-full animate-[bounce_0.8s_infinite_400ms] ${barColor} h-2`}
			/>
		</div>
	);
};
