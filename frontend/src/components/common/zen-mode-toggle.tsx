import { Maximize2, Minimize2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import { memo } from "react";

interface ZenModeToggleProps {
	isFullscreen: boolean;
	isWindowFullscreen: boolean;
	onToggle: () => void;
	onWindowToggle: () => void;
	className?: string;
}

export const ZenModeToggle = memo(
	({
		isFullscreen,
		isWindowFullscreen,
		onToggle,
		onWindowToggle,
		className,
	}: ZenModeToggleProps) => {
		const { t } = useTranslation();

		return (
			<div
				className={cn(
					"z-100 transition-all animate-in fade-in duration-300 flex items-center gap-2",
					className,
				)}
			>
				{!isWindowFullscreen && (
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"h-9 w-9 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-300 group",
							isFullscreen
								? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary/20 scale-110"
								: "bg-black/80 hover:bg-black text-white border-white/10",
						)}
						onClick={onToggle}
						title={
							isFullscreen
								? t("common.shrink")
								: t("common.expand")
						}
					>
						{isFullscreen ? (
							<Minimize2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
						) : (
							<Maximize2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
						)}
					</Button>
				)}

				{(isFullscreen || isWindowFullscreen) && (
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"h-9 w-9 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-300 group",
							isWindowFullscreen
								? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary/20"
								: "bg-black/80 hover:bg-black text-white border-white/10",
						)}
						onClick={onWindowToggle}
						title={
							isWindowFullscreen
								? t("common.exit_fullscreen")
								: t("common.window_fullscreen")
						}
					>
						{isWindowFullscreen ? (
							<Minimize2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
						) : (
							<Monitor className="h-4 w-4 group-hover:scale-110 transition-transform" />
						)}
					</Button>
				)}
			</div>
		);
	},
);
