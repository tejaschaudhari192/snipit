import { cn } from "@/utils";

interface MediaCircularProgressProps {
	progress: number;
	filename?: string;
	size?: number;
	strokeWidth?: number;
	className?: string;
}

export function MediaCircularProgress({
	progress,
	size = 80,
	strokeWidth = 6,
	className,
}: MediaCircularProgressProps) {
	const clampedProgress = Math.min(100, Math.max(0, progress));
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (clampedProgress / 100) * circumference;

	return (
		<div
			className={cn(
				"relative flex items-center justify-center select-none",
				className,
			)}
			style={{ width: size, height: size }}
			role="progressbar"
			aria-valuenow={Math.round(clampedProgress)}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<svg
				className="w-full h-full -rotate-90 transform"
				viewBox={`0 0 ${size} ${size}`}
			>
				{/* Background track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted/60 dark:text-muted/40"
				/>
				{/* Progress ring */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className="text-primary transition-all duration-300 ease-out"
				/>
			</svg>

			{/* Center text overlay */}
			<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
				<span className="text-sm font-bold tracking-tight text-foreground tabular-nums">
					{Math.round(clampedProgress)}%
				</span>
			</div>
		</div>
	);
}
