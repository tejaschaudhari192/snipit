import React from "react";
import { cn } from "@/utils";

interface MusicVisualizerProps {
	isPlaying: boolean;
	thumbnail?: string;
}

const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
	isPlaying,
	thumbnail,
}) => {
	return (
		<div className="relative w-full aspect-square max-w-[280px] mx-auto group">
			{/* Dynamic Glow Background */}
			<div
				className={cn(
					"absolute -inset-4 rounded-[2.5rem] bg-primary/20 blur-3xl transition-opacity duration-1000",
					isPlaying ? "opacity-100 animate-pulse" : "opacity-0",
				)}
			/>

			{/* Main Container */}
			<div className="relative w-full h-full rounded-4xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 flex items-center justify-center group-hover:border-primary/30 transition-colors duration-500">
				{thumbnail ? (
					<img
						src={thumbnail}
						alt="Album Art"
						className={cn(
							"w-full h-full object-cover transition-transform duration-2000 ease-out",
							isPlaying ? "scale-110" : "scale-100",
						)}
					/>
				) : (
					<div className="flex flex-col items-center gap-2 text-white/20">
						<div className="w-12 h-12 rounded-full border-2 border-dashed border-current animate-spin-slow" />
						<span className="text-[10px] font-bold uppercase tracking-widest">
							Loading
						</span>
					</div>
				)}

				{/* High-end Glass Overlay */}
				<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80" />

				{/* Inner Border Glow */}
				<div
					className={cn(
						"absolute inset-0 rounded-4xl border border-white/5 pointer-events-none transition-opacity duration-500",
						isPlaying ? "opacity-100" : "opacity-0",
					)}
				/>
			</div>

			{/* Floating Status Badge */}
			{isPlaying && (
				<div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-primary/20 animate-bounce">
					Live
				</div>
			)}
		</div>
	);
};

export default MusicVisualizer;
