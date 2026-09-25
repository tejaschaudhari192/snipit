import React from "react";
import { cn } from "cn";

export interface ShimmerProgressBarProps {
	progress: number;
	isError?: boolean;
	className?: string;
	trackClassName?: string;
	indicatorClassName?: string;
	glowClassName?: string;
}

export const ShimmerProgressBar: React.FC<ShimmerProgressBarProps> = ({
	progress,
	isError = false,
	className,
	trackClassName,
	indicatorClassName,
	glowClassName,
}) => {
	const clampedProgress = Math.min(Math.max(progress, 0), 100);

	return (
		<div className={cn("w-full relative", className)}>
			{/* Progress Track */}
			<div
				className={cn(
					"h-1.5 w-full bg-muted/40 rounded-full overflow-hidden relative",
					trackClassName,
				)}
			>
				{/* Progress Indicator */}
				<div
					className={cn(
						"h-full transition-all duration-300 ease-out rounded-full relative overflow-hidden",
						isError ? "bg-destructive" : "bg-primary",
						indicatorClassName,
					)}
					style={{ width: `${clampedProgress}%` }}
				>
					{/* Shimmer sweep animation across the indicator */}
					{clampedProgress < 100 && !isError && (
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
					)}
				</div>
			</div>

			{/* Glow tracks progress and softly fades out when complete or on error */}
			<div
				className={cn(
					"absolute -bottom-1 left-0 h-1 rounded-full blur-xs transition-all duration-500 pointer-events-none",
					isError ? "bg-destructive/40" : "bg-primary/50",
					clampedProgress >= 100 ? "opacity-0" : "opacity-70",
					glowClassName,
				)}
				style={{ width: `${clampedProgress}%` }}
			/>
		</div>
	);
};

export default ShimmerProgressBar;
