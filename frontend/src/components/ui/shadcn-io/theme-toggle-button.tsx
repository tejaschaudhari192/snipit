"use client";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ThemeToggleButtonProps {
	theme?: "light" | "dark";
	showLabel?: boolean;
	className?: string;
	onClick?: () => void;
}

export const ThemeToggleButton = ({
	theme = "light",
	showLabel = false,
	className,
	onClick,
}: ThemeToggleButtonProps) => {
	const isDark = theme === "dark";

	return (
		<Button
			variant="outline"
			size={showLabel ? "default" : "icon"}
			onClick={onClick}
			className={cn(
				"relative overflow-hidden transition-all duration-300",
				showLabel && "gap-2",
				className,
			)}
			aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
		>
			<div className="relative w-[1.2rem] h-[1.2rem] flex items-center justify-center">
				<Sun
					className={cn(
						"absolute transition-all duration-300",
						isDark
							? "rotate-90 scale-0 opacity-0"
							: "rotate-0 scale-100 opacity-100",
					)}
				/>
				<Moon
					className={cn(
						"absolute transition-all duration-300",
						isDark
							? "rotate-0 scale-100 opacity-100"
							: "-rotate-90 scale-0 opacity-0",
					)}
				/>
			</div>
			{showLabel && (
				<span className="text-sm">{isDark ? "Dark" : "Light"}</span>
			)}
		</Button>
	);
};
