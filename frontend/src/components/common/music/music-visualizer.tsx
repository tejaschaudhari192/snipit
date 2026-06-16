import React, { useEffect, useRef } from "react";
import { cn } from "@/utils";
import { useMusic } from "@/context/use-music";

interface MusicVisualizerProps {
	isPlaying: boolean;
	thumbnail?: string;
}

const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
	isPlaying,
	thumbnail,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { volume } = useMusic();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;
		const barCount = 28;
		const barHeights = new Array(barCount).fill(0);
		const targetHeights = new Array(barCount).fill(0);

		// Physics & smoothing parameters
		const smoothing = 0.22; // How fast bars rise
		const decay = 0.08; // How fast bars fall
		let time = 0;

		const draw = () => {
			if (!canvas || !ctx) return;

			// Handle high-DPI displays
			const rect = canvas.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			ctx.scale(dpr, dpr);

			const width = rect.width;
			const height = rect.height;

			ctx.clearRect(0, 0, width, height);

			time += 0.09;
			const volFactor = isPlaying ? (volume ?? 50) / 100 : 0;

			// Update simulated frequencies
			for (let i = 0; i < barCount; i++) {
				if (isPlaying) {
					let base = 0;

					// Bass (left bars): heavy rhythmic beat
					if (i < 6) {
						const bassBeat = Math.max(
							0,
							Math.sin(time * 1.6) * 0.8 +
								Math.cos(time * 0.8) * 0.4,
						);
						base = 15 + bassBeat * 40;
						if (Math.random() > 0.94) base += 25;
					}
					// Mids (middle bars): vocal/melody waves
					else if (i >= 6 && i < 20) {
						const wave1 = Math.sin(time * 2.2 + i * 0.35) * 16;
						const wave2 = Math.cos(time * 1.2 - i * 0.22) * 12;
						base = 24 + wave1 + wave2;
					}
					// Treble (right bars): rapid jitter
					else {
						const jitter = Math.sin(time * 3.8 + i * 0.7) * 7;
						const noise = Math.random() * 14;
						base = 12 + jitter + noise;
					}

					const variance = 0.75 + Math.random() * 0.5;
					targetHeights[i] = Math.max(2, base * volFactor * variance);
				} else {
					targetHeights[i] = 0;
				}

				// Physics-based interpolation
				if (barHeights[i] < targetHeights[i]) {
					barHeights[i] +=
						(targetHeights[i] - barHeights[i]) * smoothing;
				} else {
					barHeights[i] = Math.max(
						0,
						barHeights[i] -
							(barHeights[i] - targetHeights[i]) * decay -
							0.4,
					);
				}
			}

			// Draw spectrum bars
			const barWidth = width / barCount - 2;
			const maxBarHeight = height - 8;

			// Create dynamic theme color gradient
			const gradient = ctx.createLinearGradient(0, height, 0, 0);
			gradient.addColorStop(0, "rgba(239, 68, 68, 0.15)");
			gradient.addColorStop(0.4, "rgba(239, 68, 68, 0.85)");
			gradient.addColorStop(1, "rgba(244, 63, 94, 1)");

			ctx.fillStyle = gradient;

			for (let i = 0; i < barCount; i++) {
				const x = i * (barWidth + 2) + 1;
				const curHeight = Math.min(maxBarHeight, barHeights[i]);
				const y = height - curHeight;

				ctx.beginPath();
				if (typeof ctx.roundRect === "function") {
					ctx.roundRect(x, y, barWidth, curHeight, [2.5, 2.5, 0, 0]);
				} else {
					ctx.rect(x, y, barWidth, curHeight);
				}
				ctx.fill();

				// Draw high-fidelity peak particles
				if (curHeight > 4 && isPlaying) {
					ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
					ctx.beginPath();
					ctx.arc(
						x + barWidth / 2,
						y - 2.5,
						Math.min(1.2, barWidth / 2),
						0,
						Math.PI * 2,
					);
					ctx.fill();
					ctx.fillStyle = gradient;
				}
			}

			animationFrameId = requestAnimationFrame(draw);
		};

		draw();

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [isPlaying, volume]);

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

				{/* Live Spectrum Visualizer Canvas */}
				<canvas
					ref={canvasRef}
					className="absolute bottom-0 left-0 w-full h-24 pointer-events-none"
				/>

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
