import * as React from "react";
import { cn } from "cn";

export interface SubNavProgressBarProps {
	/**
	 * Controls whether the progress trickle is active.
	 */
	loading: boolean;
	/**
	 * Custom container class name (defaults to "absolute inset-x-0 top-0 h-0.5 z-20 pointer-events-none")
	 */
	className?: string;
	/**
	 * Custom bar class name (defaults to "bg-primary shadow-xs shadow-primary/50")
	 */
	barClassName?: string;
	/**
	 * Optional accessible label
	 */
	"aria-label"?: string;
}

export const SubNavProgressBar: React.FC<SubNavProgressBarProps> = ({
	loading,
	className,
	barClassName,
	"aria-label": ariaLabel = "Loading...",
}) => {
	const [progress, setProgress] = React.useState<number | null>(null);
	const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

	const clearTimers = () => {
		timersRef.current.forEach(clearTimeout);
		timersRef.current = [];
	};

	React.useEffect(() => {
		clearTimers();

		if (loading) {
			// Start initial jump
			setProgress(20);

			// Simulated incremental trickle forward
			timersRef.current = [
				setTimeout(() => setProgress(45), 180),
				setTimeout(() => setProgress(70), 500),
				setTimeout(() => setProgress(85), 900),
			];
		} else {
			// Complete and fade out
			if (progress !== null) {
				setProgress(100);
				timersRef.current = [
					setTimeout(() => {
						setProgress(null);
					}, 350),
				];
			}
		}

		return () => {
			clearTimers();
		};
	}, [loading]);

	if (progress === null) return null;

	return (
		<div
			className={cn(
				"absolute inset-x-0 top-0 h-0.5 z-20 overflow-hidden pointer-events-none",
				className,
			)}
			role="progressbar"
			aria-label={ariaLabel}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={progress}
		>
			<div
				className={cn(
					"h-full bg-primary shadow-xs shadow-primary/50 transition-all duration-300 ease-out motion-reduce:transition-none",
					barClassName,
				)}
				style={{
					width: `${progress}%`,
					opacity: progress === 100 ? 0 : 1,
				}}
			/>
		</div>
	);
};
