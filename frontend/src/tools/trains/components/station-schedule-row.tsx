import React from "react";
import { useTranslation } from "react-i18next";
import type { ScheduleStation } from "../types/trains";

interface StationScheduleRowProps {
	stn: ScheduleStation;
	idx?: number;
	isFirst: boolean;
	isLast: boolean;
	isNewDay: boolean;
}

export const StationScheduleRow: React.FC<StationScheduleRowProps> = ({
	stn,
	isFirst,
	isLast,
	isNewDay,
}) => {
	const { t } = useTranslation();

	return (
		<React.Fragment>
			{isNewDay && (
				<div className="px-6 py-2.5 bg-muted/50 text-xs font-bold text-foreground flex items-center gap-2">
					<span className="bg-primary/20 text-primary px-3 py-0.5 rounded-full text-xs font-mono">
						{t("tools.pnr_checker.day", { count: stn.dayCount })}
					</span>
				</div>
			)}
			<div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3.5 items-center hover:bg-muted/20 transition-colors text-sm">
				{/* 1. Left Column: Arrival Timetable */}
				<div className="col-span-3 text-left font-mono">
					{isFirst ? (
						<span className="inline-block bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
							{t("tools.pnr_checker.start")}
						</span>
					) : (
						<div className="text-xs sm:text-sm font-semibold text-foreground">
							{stn.arrivalTime}
						</div>
					)}
				</div>

				{/* 2. Middle Column: Railway Ladder Track with Amber Station Node & Info */}
				<div className="col-span-6 flex items-center gap-3 min-w-0">
					{/* Realistic Railway Track with Sleepers */}
					<div className="relative flex items-center justify-center shrink-0 w-8 self-stretch -my-3.5">
						{/* Two parallel steel rails with ladder cross-ties/sleepers */}
						<div
							className="absolute top-0 bottom-0 w-4.5 flex justify-between"
							style={{ minHeight: "72px" }}
						>
							{/* Left Steel Rail */}
							<div className="w-1 h-full bg-border/80 border-r border-foreground/30" />

							{/* Center Horizontal Rail Sleepers */}
							<div className="flex-1 flex flex-col justify-around px-0.5 pointer-events-none opacity-50">
								<div className="h-1 bg-muted-foreground/60 rounded-xs" />
								<div className="h-1 bg-muted-foreground/60 rounded-xs" />
								<div className="h-1 bg-muted-foreground/60 rounded-xs" />
								<div className="h-1 bg-muted-foreground/60 rounded-xs" />
							</div>

							{/* Right Steel Rail */}
							<div className="w-1 h-full bg-border/80 border-l border-foreground/30" />
						</div>

						{/* Amber Station Circle Node */}
						<div className="relative z-10 w-3.5 h-3.5 rounded-full border-2 border-amber-600 bg-amber-500 shadow-sm" />
					</div>

					{/* Station Info: Name, Code, Platform Badge, Distance, Halt */}
					<div className="flex flex-col min-w-0 truncate py-1">
						<div className="font-extrabold text-sm sm:text-base text-foreground truncate tracking-tight">
							{stn.stationName}
						</div>

						<div className="flex items-center gap-2 mt-1 flex-wrap">
							<span className="font-mono font-bold text-xs text-foreground/90">
								{stn.stationCode}
							</span>
							{stn.platformNumber && (
								<span className="inline-block bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 font-bold px-1.5 py-0.2 rounded text-[11px] font-mono">
									PF {stn.platformNumber}
								</span>
							)}
						</div>

						<div className="text-xs text-muted-foreground/80 font-mono mt-0.5">
							{stn.distance !== undefined && `${stn.distance} Km`}
							{stn.haltTime &&
								stn.haltTime !== "--" &&
								` • Halt ${stn.haltTime}`}
						</div>
					</div>
				</div>

				{/* 3. Right Column: Departure Timetable */}
				<div className="col-span-3 text-right font-mono">
					{isLast ? (
						<span className="inline-block bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
							{t("tools.pnr_checker.end")}
						</span>
					) : (
						<div className="text-xs sm:text-sm font-semibold text-foreground">
							{stn.departureTime}
						</div>
					)}
				</div>
			</div>
		</React.Fragment>
	);
};
