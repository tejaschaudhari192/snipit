import {
	X,
	Play,
	Square,
	Terminal as TerminalIcon,
	PanelBottom,
	PanelRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import { SUPPORTED_RUN_LANGUAGES } from "@/constants";
import { Button } from "@/components/ui/button";

interface TerminalHeaderProps {
	language: string;
	isRunning: boolean;
	onRun: () => void;
	onStop: () => void;
	onClose: () => void;
	position: "bottom" | "right";
	onPositionChange: (pos: "bottom" | "right") => void;
}

export const TerminalHeader = ({
	language,
	isRunning,
	onRun,
	onStop,
	onClose,
	position,
	onPositionChange,
}: TerminalHeaderProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center justify-between p-2 px-4 bg-[#1c2833] border-b border-white/5 select-none">
			<div className="flex items-center gap-6">
				{/* Mac-style Window Controls */}
				<div className="flex items-center gap-2 group/dots">
					<Button
						variant="ghost"
						onClick={onClose}
						className="p-0 h-3 w-3 min-w-0 min-h-0 rounded-full bg-rose-500 hover:bg-rose-400 hover:text-rose-950 transition-all flex items-center justify-center shadow-inner group relative"
						title={t("common.close")}
					>
						<X className="h-2 w-2 text-rose-950 opacity-0 group-hover/dots:opacity-100 transition-opacity" />
					</Button>
					<Button
						variant="ghost"
						onClick={onClose}
						className="p-0 h-3 w-3 min-w-0 min-h-0 rounded-full bg-amber-500 hover:bg-amber-400 transition-all flex items-center justify-center shadow-inner group relative"
						title="Minimize"
					>
						<div className="h-px w-1.5 bg-amber-950 opacity-0 group-hover/dots:opacity-100 transition-opacity" />
					</Button>
					<Button
						variant="ghost"
						onClick={() =>
							onPositionChange(
								position === "bottom" ? "right" : "bottom",
							)
						}
						className="p-0 h-3 w-3 min-w-0 min-h-0 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center shadow-inner group relative"
						title="Toggle Layout"
					>
						<PanelRight className="h-2 w-2 text-emerald-950 opacity-0 group-hover/dots:opacity-100 transition-opacity transform rotate-45" />
					</Button>
				</div>

				<div className="flex items-center gap-2.5 text-white/60">
					<TerminalIcon className="h-4 w-4" />
					<span className="text-[11px] font-bold tracking-tight text-white/70">
						{language.charAt(0).toUpperCase() + language.slice(1)}
					</span>
				</div>

				<div className="h-4 w-px bg-white/10 mx-2" />

				{SUPPORTED_RUN_LANGUAGES.includes(language.toLowerCase()) &&
					(isRunning ? (
						<Button
							variant="outline"
							size="sm"
							onClick={onStop}
							className="flex items-center gap-2 h-7 group px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 transition-all font-bold text-rose-400 hover:text-rose-400 text-[11px]"
						>
							<Square className="h-3 w-3 fill-rose-500 text-rose-500" />
							{t("display.terminal.stop")}
						</Button>
					) : (
						<Button
							variant="outline"
							size="sm"
							onClick={onRun}
							className="flex items-center gap-2 h-7 group px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 transition-all font-bold text-emerald-400 hover:text-emerald-400 text-[11px]"
						>
							<Play className="h-3 w-3 fill-emerald-500 text-emerald-500" />
							{t("display.terminal.run_code")}
						</Button>
					))}
			</div>

			<div className="flex items-center gap-2">
				<div className="flex items-center bg-white/5 rounded-lg p-0.5 mr-2">
					<Button
						variant="ghost"
						onClick={() => onPositionChange("bottom")}
						className={cn(
							"p-1 h-6 w-6 rounded-md transition-all",
							position === "bottom"
								? "bg-white/10 text-white shadow-sm hover:bg-white/10 hover:text-white"
								: "text-white/30 hover:text-white/60 hover:bg-transparent",
						)}
						title="Bottom"
					>
						<PanelBottom className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="ghost"
						onClick={() => onPositionChange("right")}
						className={cn(
							"p-1 h-6 w-6 rounded-md transition-all",
							position === "right"
								? "bg-white/10 text-white shadow-sm hover:bg-white/10 hover:text-white"
								: "text-white/30 hover:text-white/60 hover:bg-transparent",
						)}
						title="Right"
					>
						<PanelRight className="h-3.5 w-3.5" />
					</Button>
				</div>

				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="h-6 w-6 rounded-md transition-all text-white/40 hover:text-white hover:bg-white/10"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};
