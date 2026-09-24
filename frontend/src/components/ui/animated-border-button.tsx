import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export interface AnimatedBorderButtonProps extends React.ComponentProps<
	typeof Button
> {
	borderClassName?: string;
	contentClassName?: string;
	gradient?: string;
	duration?: string;
}

export const AnimatedBorderButton = React.forwardRef<
	HTMLButtonElement,
	AnimatedBorderButtonProps
>(
	(
		{
			children,
			className,
			borderClassName,
			contentClassName,
			gradient = "bg-[conic-gradient(from_0deg,transparent_0%,transparent_35%,var(--color-blue-500)_50%,transparent_65%,transparent_85%,var(--color-orange-400)_100%)]",
			duration = "3s",
			variant = "outline",
			...props
		},
		ref,
	) => {
		return (
			<Button
				ref={ref}
				variant={variant}
				className={cn(
					"relative h-10 gap-2 overflow-hidden rounded-full border-transparent px-6 text-primary cursor-pointer",
					className,
				)}
				{...props}
			>
				{/* Continuously animated gradient border */}
				<div
					className={cn(
						"absolute inset-0 z-0 overflow-hidden rounded-full bg-border",
						borderClassName,
					)}
				>
					<div
						className={cn(
							"absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 animate-spin",
							gradient,
						)}
						style={{ animationDuration: duration }}
					/>
					<div className="absolute inset-0.5 rounded-full bg-background" />
				</div>

				<span
					className={cn(
						"relative z-10 flex items-center gap-2",
						contentClassName,
					)}
				>
					{children}
				</span>
			</Button>
		);
	},
);

AnimatedBorderButton.displayName = "AnimatedBorderButton";

export default AnimatedBorderButton;
