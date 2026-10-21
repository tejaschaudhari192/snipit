import icon from "@/assets/brand/icon.png";
import { useTranslation } from "react-i18next";
import type { HealthData } from "@/types";
import { useState, useEffect } from "react";
import { ShimmerProgressBar } from "@/components/ui/shimmer-progress-bar";

interface SplashPageProps {
	healthData?: HealthData | null;
	onComplete?: () => void;
	duration?: number; // Target animation duration in ms (default: 1200ms)
}

const SplashPage = ({
	healthData,
	onComplete,
	duration = 1200,
}: SplashPageProps) => {
	const { t } = useTranslation();
	const [displayProgress, setDisplayProgress] = useState(0);
	const [isFadingOut, setIsFadingOut] = useState(false);

	// Determine target progress: either from backend stream healthData or smooth time-based ramp
	const targetFromBackend = healthData?.progress ?? 0;

	useEffect(() => {
		const startTime = performance.now();
		let frameId: number;
		let completedTriggered = false;

		const update = (now: number) => {
			const elapsed = now - startTime;
			// Baseline time-based progress fraction (0 to 1 over duration)
			const timeFraction = Math.min(elapsed / duration, 1);
			const timeProgress = Math.round(
				(1 - Math.pow(1 - timeFraction, 2)) * 100,
			);

			// Progress is the max of backend stream progress and time-based progression
			// Guaranteeing steady progression that never stalls even if network fluctuates
			const effectiveTarget = Math.max(timeProgress, targetFromBackend);

			setDisplayProgress((prev) => {
				const next = Math.max(prev, effectiveTarget);
				return next > 100 ? 100 : next;
			});

			if (effectiveTarget >= 100 || timeFraction >= 1) {
				setDisplayProgress(100);
				if (!completedTriggered) {
					completedTriggered = true;
					// Hold on 100% for 180ms, then trigger smooth fade-out and completion
					const exitTimer = setTimeout(() => {
						setIsFadingOut(true);
						const finishTimer = setTimeout(() => {
							onComplete?.();
						}, 250);
						return () => clearTimeout(finishTimer);
					}, 180);
					return () => clearTimeout(exitTimer);
				}
			} else {
				frameId = requestAnimationFrame(update);
			}
		};

		frameId = requestAnimationFrame(update);
		return () => cancelAnimationFrame(frameId);
	}, [duration, targetFromBackend, onComplete]);

	const isCompleted = displayProgress >= 100;

	// Active label from backend stream or fallback stage
	const activeLabel =
		healthData?.currentLabel ||
		(displayProgress < 30
			? t("splash.initializing", "Initializing...")
			: displayProgress < 70
				? t("splash.loading", "Loading environment...")
				: displayProgress < 100
					? t("splash.preparing", "Preparing workspace...")
					: "complete");

	return (
		<div
			className={`relative h-dvh w-screen overflow-hidden bg-background text-foreground transition-opacity duration-300 flex flex-col items-center justify-center pointer-events-none ${
				isFadingOut ? "opacity-0" : "opacity-100"
			}`}
		>
			<div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 w-full max-w-md px-6">
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
				<ShimmerProgressBar
					className="mt-6"
					progress={displayProgress}
					label={isCompleted ? "complete" : activeLabel}
					isCompleted={isCompleted}
					isError={false}
				/>
			</div>
		</div>
	);
};

export default SplashPage;
