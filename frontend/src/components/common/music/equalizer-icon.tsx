import React from "react";

interface EqualizerIconProps {
	isPlaying: boolean;
}

export const EqualizerIcon: React.FC<EqualizerIconProps> = ({ isPlaying }) => (
	<div className="absolute inset-0 bg-black/60 flex items-end justify-center gap-[1.5px] pb-1.5 transition-all duration-300">
		<style
			dangerouslySetInnerHTML={{
				__html: `
			@keyframes eqBounce1 {
				0%, 100% { height: 3px; }
				50% { height: 12px; }
			}
			@keyframes eqBounce2 {
				0%, 100% { height: 5px; }
				50% { height: 15px; }
			}
			@keyframes eqBounce3 {
				0%, 100% { height: 4px; }
				50% { height: 11px; }
			}
			.eq-bar-1 { animation: eqBounce1 0.8s ease-in-out infinite; }
			.eq-bar-2 { animation: eqBounce2 0.7s ease-in-out infinite; }
			.eq-bar-3 { animation: eqBounce3 0.9s ease-in-out infinite; }
		`,
			}}
		/>
		<div
			className="w-[2px] bg-primary rounded-full eq-bar-1"
			style={{ animationPlayState: isPlaying ? "running" : "paused" }}
		/>
		<div
			className="w-[2px] bg-primary rounded-full eq-bar-2"
			style={{ animationPlayState: isPlaying ? "running" : "paused" }}
		/>
		<div
			className="w-[2px] bg-primary rounded-full eq-bar-3"
			style={{ animationPlayState: isPlaying ? "running" : "paused" }}
		/>
	</div>
);

export default EqualizerIcon;
