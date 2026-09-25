import icon from "@/assets/brand/icon.png";
import { useTranslation } from "react-i18next";
import type { HealthData } from "@/types";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/utils/index";

interface SplashPageProps {
	healthData?: HealthData | null;
	onComplete?: () => void;
}

const SplashPage = ({ healthData, onComplete }: SplashPageProps) => {
	const { t } = useTranslation();

	const targetProgress = healthData?.progress || 0;
	const currentLabel = healthData?.currentLabel || "Initializing...";
	const isError = healthData?.status === "down";

	const [displayProgress, setDisplayProgress] = useState(0);
	const [activeLabel, setActiveLabel] = useState(currentLabel);

	// Update activeLabel when incoming currentLabel changes and not complete
	useEffect(() => {
		if (currentLabel && displayProgress < 100) {
			setActiveLabel(currentLabel);
		}
	}, [currentLabel, displayProgress]);

	// Smoothly interpolate progress toward targetProgress with natural pacing
	useEffect(() => {
		if (isError) return;

		const interval = setInterval(() => {
			setDisplayProgress((prev) => {
				if (prev >= targetProgress) return prev;
				// Smooth realistic step so steps don't instantly jump to 100%
				const diff = targetProgress - prev;
				const step = Math.min(Math.max(1, Math.round(diff * 0.08)), 4);
				const next = Math.min(prev + step, targetProgress);
				return next;
			});
		}, 25);

		return () => clearInterval(interval);
	}, [targetProgress, isError]);

	// When progress reaches 100%, show "complete" state and give user time to see the filled bar
	useEffect(() => {
		if (displayProgress >= 100 && onComplete) {
			const timer = setTimeout(() => {
				onComplete();
			}, 900); // 900ms hold on 100% & "complete" message so user clearly sees the filled UI
			return () => clearTimeout(timer);
		}
	}, [displayProgress, onComplete]);

	const isCompleted = displayProgress >= 100;

	return (
		<div className="relative h-dvh w-screen overflow-hidden bg-background text-foreground transition-colors duration-300 flex flex-col items-center justify-center pointer-events-none">
			<div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 w-full max-w-md px-6">
				<div className="flex flex-col items-center justify-center mb-6">
					<div className="relative flex items-center justify-center w-32 h-32 mb-8">
						<img
							src={icon}
							alt="Snipit logo"
							className="relative z-10 h-20 w-20 drop-shadow-md transition-transform hover:scale-105 duration-300"
						/>
					</div>

					<h1 className="text-7xl tracking-tighter font-extrabold text-transparent bg-clip-text bg-linear-to-b from-foreground via-foreground to-muted-foreground pb-2">
						Snipit
					</h1>
				</div>

				{/* progress-04 inspired sleek progress section */}
				<div className="w-full flex flex-col items-center justify-center space-y-6 mt-6">
					{/* Centered Animated Text */}
					<div className="relative h-8 flex items-center justify-center w-full">
						<AnimatePresence mode="wait">
							<motion.p
								key={
									isError
										? "error"
										: isCompleted
											? "completed"
											: activeLabel
								}
								initial={{ opacity: 0, scale: 1.4, y: -5 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.5, y: 5 }}
								transition={{
									type: "spring",
									stiffness: 400,
									damping: 18,
								}}
								className={cn(
									"text-2xl font-medium tracking-tight",
									isError
										? "text-destructive font-semibold"
										: isCompleted
											? "text-blue-500 font-semibold"
											: "text-muted-foreground/80",
								)}
							>
								{isError
									? t("splash.system_failure")
									: isCompleted
										? "complete"
										: activeLabel}
							</motion.p>
						</AnimatePresence>
					</div>

					{/* Sleek Progress Bar matching progress-04 visual spec */}
					<div className="w-full relative px-1">
						<div className="h-3 w-full bg-muted/30 overflow-hidden rounded-full relative">
							{/* Indicator */}
							<div
								className={cn(
									"h-full rounded-full transition-all duration-300 relative overflow-hidden",
									isError ? "bg-destructive" : "bg-blue-500",
								)}
								style={{
									width: `${Math.min(Math.max(displayProgress, 0), 100)}%`,
								}}
							>
								{/* Shimmer sweep effect - only while loading */}
								{!isCompleted && !isError && (
									<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
								)}
							</div>
						</div>

						{/* Glow tracks progress but fades on completion for a clean look */}
						<div
							className={cn(
								"absolute -bottom-1 left-0 h-0.5 blur-md transition-all duration-700",
								isError ? "bg-destructive" : "bg-blue-500",
								isCompleted ? "opacity-0" : "opacity-50",
							)}
							style={{
								width: `${Math.min(Math.max(displayProgress, 0), 100)}%`,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SplashPage;
