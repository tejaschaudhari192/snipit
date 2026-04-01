import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface ZenModeToggleProps {
	isFullscreen: boolean;
	onToggle: () => void;
	className?: string;
}

export const ZenModeToggle = memo(
	({ isFullscreen, onToggle, className }: ZenModeToggleProps) => {
		const { t } = useTranslation();

		return (
			<div
				className={cn(
					"z-50 transition-opacity animate-in fade-in duration-300",
					className,
				)}
			>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full bg-black/80 hover:bg-black text-white shadow-2xl backdrop-blur-md border border-white/10 transition-all duration-300 group"
					onClick={onToggle}
					title={
						isFullscreen
							? t("common.exit_zen")
							: t("common.zen_mode")
					}
				>
					{isFullscreen ? (
						<Minimize className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
					) : (
						<Maximize className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
					)}
				</Button>
			</div>
		);
	},
);
