import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface TrainRunningDaysBadgeProps {
	runningOn?: string;
	className?: string;
}

const DAYS_CODE = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAYS_FULL = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export const TrainRunningDaysBadge: React.FC<TrainRunningDaysBadgeProps> = ({
	runningOn,
	className = "",
}) => {
	const { t } = useTranslation();

	if (!runningOn || runningOn.length < 7) {
		return null;
	}

	const flags = runningOn.slice(0, 7).split("");
	const runsEveryDay = flags.every((f) => f.toUpperCase() === "Y");

	return (
		<div
			className={`flex items-center gap-1.5 flex-wrap text-xs ${className}`}
		>
			<span className="text-muted-foreground font-medium text-[11px]">
				{t("tools.pnr_checker.running_days")}:
			</span>
			<div className="flex items-center gap-1">
				{flags.map((flag, idx) => {
					const isRunning = flag.toUpperCase() === "Y";
					return (
						<span
							key={idx}
							title={`${DAYS_FULL[idx]}: ${isRunning ? "Runs" : "Does not run"}`}
							className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded-md border transition-colors ${
								isRunning
									? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-2xs font-bold"
									: "bg-muted/30 text-muted-foreground/35 border-transparent line-through"
							}`}
						>
							{DAYS_CODE[idx]}
						</span>
					);
				})}
			</div>
			{runsEveryDay && (
				<Badge
					variant="secondary"
					className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold py-0 px-1.5"
				>
					Daily
				</Badge>
			)}
		</div>
	);
};
