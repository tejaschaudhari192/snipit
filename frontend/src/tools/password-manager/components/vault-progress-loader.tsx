import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/utils/index";
import icon from "@/assets/brand/icon.png";

interface VaultProgressLoaderProps {
	label?: string;
	sublabel?: string;
	onComplete?: () => void;
	isError?: boolean;
	errorMessage?: string;
}

export function VaultProgressLoader({
	label = "Loading Vault...",
	sublabel,
	onComplete,
	isError = false,
	errorMessage = "Failed to load vault",
}: VaultProgressLoaderProps) {
	const [displayProgress, setDisplayProgress] = useState(0);

	// Smoothly progress from 0% toward 100% like splash screen
	useEffect(() => {
		if (isError) return;

		const target = 100;
		const interval = setInterval(() => {
			setDisplayProgress((prev) => {
				if (prev >= target) {
					clearInterval(interval);
					return target;
				}
				const diff = target - prev;
				// Progressive steps with realistic natural pacing
				const step = Math.min(Math.max(1, Math.round(diff * 0.09)), 5);
				return Math.min(prev + step, target);
			});
		}, 30);

		return () => clearInterval(interval);
	}, [isError]);

	const isCompleted = displayProgress >= 100;

	// When reaches 100%, trigger completion callback after graceful pause
	useEffect(() => {
		if (isCompleted && onComplete) {
			const timer = setTimeout(() => {
				onComplete();
			}, 400);
			return () => clearTimeout(timer);
		}
	}, [isCompleted, onComplete]);

	return (
		<div className="h-full w-full bg-background text-foreground flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
			<div className="w-full max-w-sm flex flex-col items-center justify-center space-y-6">
				{/* Logo / Brand */}
				<div className="relative flex items-center justify-center w-20 h-20 mb-2">
					<img
						src={icon}
						alt="Snipit Vault"
						className="relative z-10 h-14 w-14 drop-shadow-md transition-transform hover:scale-105 duration-300"
					/>
				</div>

				{/* Animated Text Section */}
				<div className="relative h-8 flex items-center justify-center w-full">
					<AnimatePresence mode="wait">
						<motion.p
							key={
								isError
									? "error"
									: isCompleted
										? "completed"
										: label
							}
							initial={{ opacity: 0, scale: 1.2, y: -4 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.6, y: 4 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 20,
							}}
							className={cn(
								"text-xl font-medium tracking-tight",
								isError
									? "text-destructive font-semibold"
									: isCompleted
										? "text-blue-500 font-semibold"
										: "text-muted-foreground/90",
							)}
						>
							{isError
								? errorMessage
								: isCompleted
									? "complete"
									: label}
						</motion.p>
					</AnimatePresence>
				</div>

				{/* Sleek Progress Bar matching splash progress visual spec */}
				<div className="w-full relative px-2">
					<div className="h-2.5 w-full bg-muted/40 overflow-hidden rounded-full relative">
						{/* Progress Indicator */}
						<div
							className={cn(
								"h-full rounded-full transition-all duration-150 relative overflow-hidden",
								isError ? "bg-destructive" : "bg-blue-500",
							)}
							style={{
								width: `${Math.min(Math.max(displayProgress, 0), 100)}%`,
							}}
						>
							{/* Shimmer sweep effect while progressing */}
							{!isCompleted && !isError && (
								<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
							)}
						</div>
					</div>

					{/* Glow underneath tracks progress */}
					<div
						className={cn(
							"absolute -bottom-1 left-2 h-1 blur-md transition-all duration-300",
							isError ? "bg-destructive" : "bg-blue-500",
							isCompleted ? "opacity-0" : "opacity-60",
						)}
						style={{
							width: `${Math.min(Math.max(displayProgress, 0), 100)}%`,
						}}
					/>
				</div>

				{sublabel && (
					<p className="text-xs text-muted-foreground/60 text-center tracking-wide font-mono">
						{sublabel}
					</p>
				)}
			</div>
		</div>
	);
}

export default VaultProgressLoader;
