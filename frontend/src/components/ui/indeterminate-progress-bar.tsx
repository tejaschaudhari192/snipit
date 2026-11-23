import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "cn";

export interface IndeterminateProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Custom track class name (defaults to bg-primary-foreground/30)
	 */
	trackClassName?: string;
	/**
	 * Custom indicator bar class name (defaults to bg-primary-foreground)
	 */
	indicatorClassName?: string;
	/**
	 * Animation duration in seconds (default: 1.2)
	 */
	duration?: number;
}

export const IndeterminateProgressBar = React.forwardRef<
	HTMLDivElement,
	IndeterminateProgressBarProps
>(
	(
		{
			className,
			trackClassName,
			indicatorClassName,
			duration = 1.2,
			"aria-label": ariaLabel = "Loading...",
			...props
		},
		ref,
	) => {
		const reduceMotion = useReducedMotion();

		return (
			<div
				ref={ref}
				role="progressbar"
				aria-busy="true"
				aria-label={ariaLabel}
				className={cn(
					"relative h-1 w-12 overflow-hidden rounded-full bg-primary-foreground/30",
					trackClassName,
					className,
				)}
				{...props}
			>
				{reduceMotion ? (
					<div
						className={cn(
							"h-full w-1/3 rounded-full bg-primary-foreground",
							indicatorClassName,
						)}
					/>
				) : (
					<motion.div
						className={cn(
							"absolute inset-y-0 w-1/3 rounded-full bg-primary-foreground",
							indicatorClassName,
						)}
						initial={{ left: "-35%" }}
						animate={{ left: "100%" }}
						transition={{
							duration,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				)}
			</div>
		);
	},
);

IndeterminateProgressBar.displayName = "IndeterminateProgressBar";
