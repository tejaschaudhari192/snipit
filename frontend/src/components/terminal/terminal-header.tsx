import {
	X,
	Play,
	Square,
	Terminal as TerminalIcon,
	PanelBottom,
	PanelRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
					<button
						onClick={onClose}
						className="group relative h-3 w-3 rounded-full bg-rose-500 hover:bg-rose-400 transition-all flex items-center justify-center shadow-inner"
						title={t("common.close")}
					>
						<X className="h-2 w-2 text-rose-950 opacity-0 group-hover/dots:opacity-100 transition-opacity" />
					</button>
					<button
						onClick={onClose}
						className="group relative h-3 w-3 rounded-full bg-amber-500 hover:bg-amber-400 transition-all flex items-center justify-center shadow-inner"
						title="Minimize"
					>
						<div className="h-[1px] w-1.5 bg-amber-950 opacity-0 group-hover/dots:opacity-100 transition-opacity" />
					</button>
					<button
						onClick={() =>
							onPositionChange(
								position === "bottom" ? "right" : "bottom",
							)
						}
						className="group relative h-3 w-3 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center shadow-inner"
						title="Toggle Layout"
					>
						<PanelRight className="h-2 w-2 text-emerald-950 opacity-0 group-hover/dots:opacity-100 transition-opacity transform rotate-45" />
					</button>
				</div>

				<div className="flex items-center gap-2.5 text-white/60">
					<TerminalIcon className="h-4 w-4" />
					<span className="text-[11px] font-bold tracking-tight text-white/70">
						{language.charAt(0).toUpperCase() + language.slice(1)}
					</span>
				</div>

				<div className="h-4 w-[1px] bg-white/10 mx-2" />

				{isRunning ? (
					<button
						onClick={onStop}
						className="flex items-center gap-2 group px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all font-bold text-rose-400 text-[11px]"
					>
						<Square className="h-3 w-3 fill-rose-500 text-rose-500" />
						{t("display.terminal.stop", "Stop")}
					</button>
				) : (
					<button
						onClick={onRun}
						className="flex items-center gap-2 group px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all font-bold text-emerald-400 text-[11px]"
					>
						<Play className="h-3 w-3 fill-emerald-500 text-emerald-500" />
						{t("display.terminal.run_code", "Run Code")}
					</button>
				)}
			</div>

			<div className="flex items-center gap-2">
				<div className="flex items-center bg-white/5 rounded-lg p-0.5 mr-2">
					<button
						onClick={() => onPositionChange("bottom")}
						className={cn(
							"p-1 rounded-md transition-all",
							position === "bottom"
								? "bg-white/10 text-white shadow-sm"
								: "text-white/30 hover:text-white/60",
						)}
						title="Bottom"
					>
						<PanelBottom className="h-3.5 w-3.5" />
					</button>
					<button
						onClick={() => onPositionChange("right")}
						className={cn(
							"p-1 rounded-md transition-all",
							position === "right"
								? "bg-white/10 text-white shadow-sm"
								: "text-white/30 hover:text-white/60",
						)}
						title="Right"
					>
						<PanelRight className="h-3.5 w-3.5" />
					</button>
				</div>

				<button
					onClick={onClose}
					className="p-1 hover:bg-white/10 rounded-md transition-all text-white/40 hover:text-white"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
};
