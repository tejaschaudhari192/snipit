import React from "react";
import { cn } from "cn";

export interface ShimmerProgressBarProps {
	progress: number;
	isCompleted?: boolean;
	isError?: boolean;
	className?: string;
	trackClassName?: string;
	indicatorClassName?: string;
	glowClassName?: string;
}

export const ShimmerProgressBar: React.FC<ShimmerProgressBarProps> = ({
	progress,
	isCompleted = false,
	isError = false,
	className,
	trackClassName,
	indicatorClassName,
	glowClassName,
}) => {
	const clampedProgress = Math.min(Math.max(progress, 0), 100);
	const completed = isCompleted || clampedProgress >= 100;

	return (
		<div className={cn("w-full relative px-1", className)}>
			{/* Progress Track */}
			<div
				className={cn(
					"h-3 w-full bg-muted/30 overflow-hidden rounded-full relative",
					trackClassName,
				)}
			>
				{/* Progress Indicator */}
				<div
					className={cn(
						"h-full rounded-full transition-all duration-300 relative overflow-hidden",
						isError ? "bg-destructive" : "bg-blue-500",
						indicatorClassName,
					)}
					style={{ width: `${clampedProgress}%` }}
				>
					{/* Shimmer sweep animation across the indicator */}
					{!completed && !isError && (
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
					)}
				</div>
			</div>

			{/* Glow tracks progress but fades on completion for a clean look */}
			<div
				className={cn(
					"absolute -bottom-1 left-0 h-0.5 blur-md transition-all duration-700 pointer-events-none",
					isError ? "bg-destructive" : "bg-blue-500",
					completed ? "opacity-0" : "opacity-50",
					glowClassName,
				)}
				style={{ width: `${clampedProgress}%` }}
			/>
		</div>
	);
};

export default ShimmerProgressBar;
