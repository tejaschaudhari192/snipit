import * as React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "cn";

interface TopNavigationProgressProps {
	className?: string;
	barClassName?: string;
}

export const TopNavigationProgress: React.FC<TopNavigationProgressProps> = ({
	className,
	barClassName,
}) => {
	const location = useLocation();
	const [progress, setProgress] = React.useState<number | null>(null);
	const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
	const isFirstRender = React.useRef(true);

	const clearAllTimers = () => {
		timersRef.current.forEach(clearTimeout);
		timersRef.current = [];
	};

	React.useEffect(() => {
		// Skip initial mount so we don't flash progress on simple page refresh
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		clearAllTimers();

		// Start progress immediately on route change
		setProgress(25);

		// Trickle forward to simulate loading
		timersRef.current = [
			setTimeout(() => setProgress(55), 180),
			setTimeout(() => setProgress(78), 420),
			setTimeout(() => setProgress(90), 800),
			// Complete and fade out
			setTimeout(() => setProgress(100), 1050),
			setTimeout(() => {
				setProgress(null);
			}, 1350),
		];

		return () => {
			clearAllTimers();
		};
	}, [location.pathname, location.search]);

	if (progress === null) return null;

	return (
		<div
			className={cn(
				"fixed inset-x-0 top-0 h-0.5 z-9999 pointer-events-none overflow-hidden",
				className,
			)}
			role="progressbar"
			aria-label="Page loading"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={progress ?? undefined}
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
