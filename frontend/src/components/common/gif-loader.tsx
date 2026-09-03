import React from "react";
import loadingGif from "@/assets/icons/loading/loading.gif";
import { cn } from "@/utils";

interface GifLoaderProps {
	label?: string;
	className?: string;
	imageClassName?: string;
	size?: "icon" | "sm" | "md" | "lg" | "xl" | "2xl" | "hero";
}

export const GifLoader: React.FC<GifLoaderProps> = ({
	label,
	className,
	imageClassName,
	size = "lg",
}) => {
	const sizeClasses = {
		icon: "h-6 w-6",
		sm: "h-12 w-12",
		md: "h-24 w-24",
		lg: "h-36 w-36",
		xl: "h-48 w-48",
		"2xl": "h-64 w-64",
		hero: "h-80 w-80",
	};

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center space-y-3 text-center leading-none p-4",
				className,
			)}
		>
			<img
				src={loadingGif}
				alt="Loading..."
				className={cn(
					"object-contain select-none pointer-events-none shrink-0 max-w-full",
					sizeClasses[size],
					imageClassName,
				)}
			/>
			{label && (
				<p className="text-sm font-semibold tracking-wide text-foreground/80 animate-pulse">
					{label}
				</p>
			)}
		</div>
	);
};
