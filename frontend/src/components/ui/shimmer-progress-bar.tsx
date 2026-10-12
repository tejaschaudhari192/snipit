import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "cn";

export interface ShimmerProgressBarProps {
	progress: number;
	label?: React.ReactNode;
	isCompleted?: boolean;
	isError?: boolean;
	className?: string;
	trackClassName?: string;
	indicatorClassName?: string;
	glowClassName?: string;
	labelClassName?: string;
}

export const ShimmerProgressBar: React.FC<ShimmerProgressBarProps> = ({
	progress,
	label,
	isCompleted = false,
	isError = false,
	className,
	trackClassName,
	indicatorClassName,
	glowClassName,
	labelClassName,
}) => {
	const clampedProgress = Math.min(Math.max(progress, 0), 100);
	const completed = isCompleted || clampedProgress >= 100;

	return (
		<div
			className={cn(
				"w-full flex flex-col items-center justify-center space-y-6",
				className,
			)}
		>
			{/* Centered Animated Label if provided */}
			{label !== undefined && (
				<div className="relative h-8 flex items-center justify-center w-full">
					<AnimatePresence mode="wait">
						<motion.p
							key={
								isError
									? "error"
									: completed
										? "completed"
										: typeof label === "string" ||
											  typeof label === "number"
											? String(label)
											: undefined
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
									: completed
										? "text-blue-500 font-semibold"
										: "text-muted-foreground/80",
								labelClassName,
							)}
						>
							{label}
						</motion.p>
					</AnimatePresence>
				</div>
			)}

			{/* Progress Bar Container */}
			<div className="w-full relative px-1">
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
		</div>
	);
};

export default ShimmerProgressBar;
