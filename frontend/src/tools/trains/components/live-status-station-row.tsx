import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { LiveStatusStation } from "../types/trains";

interface LiveStatusStationRowProps {
	stn: LiveStatusStation;
	idx?: number;
	isFirst: boolean;
	isLast: boolean;
	isNewDay: boolean;
	isCurrentStation: boolean;
	isSelectedStation: boolean;
	isAnimatedTrainPosition?: boolean;
	isPassedTrack?: boolean;
}

export const LiveStatusStationRow: React.FC<LiveStatusStationRowProps> = ({
	stn,
	isFirst,
	isLast,
	isNewDay,
	isCurrentStation,
	isSelectedStation,
	isAnimatedTrainPosition = false,
	isPassedTrack = false,
}) => {
	const { t } = useTranslation();

	const hasDeparted =
		stn.actualDepartureTime && stn.actualDepartureTime !== "--:--";
	const hasArrived =
		stn.actualArrivalTime && stn.actualArrivalTime !== "--:--";

	return (
		<React.Fragment>
			{isNewDay && (
				<div className="px-6 py-2.5 bg-muted/50 text-xs font-bold text-foreground flex items-center gap-2">
					<span className="bg-primary/20 text-primary px-3 py-0.5 rounded-full text-xs font-mono">
						{t("tools.pnr_checker.day", { count: stn.dayCount })}
					</span>
				</div>
			)}
			<div
				id={`live-station-${stn.stationCode}`}
				className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-3.5 items-center transition-all duration-300 text-sm ${
					isSelectedStation
						? "bg-primary/10 border-l-4 border-primary"
						: isCurrentStation
							? "bg-amber-500/10 border-l-4 border-amber-500"
							: "hover:bg-muted/20"
				}`}
			>
				{/* 1. Left Column: Arrival Timings (Scheduled, Actual/Expected, Delay Badge) */}
				<div className="col-span-3 text-left font-mono">
					{isFirst ? (
						<span className="inline-block bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
							{t("tools.pnr_checker.start")}
						</span>
					) : (
						<div className="flex flex-col items-start space-y-0.5">
							{/* Scheduled Time */}
							<div className="text-xs sm:text-sm font-semibold text-foreground/80">
								{stn.arrivalTime}
							</div>

							{/* Actual / Expected Time */}
							<div
								className={`text-xs sm:text-sm font-extrabold ${
									typeof stn.delayArrivalMinutes ===
										"number" && stn.delayArrivalMinutes > 0
										? "text-destructive"
										: "text-emerald-600 dark:text-emerald-400"
								}`}
							>
								{stn.actualArrivalTime || stn.arrivalTime}*
							</div>

							{/* Delay / On-Time Pill Badge */}
							<div className="pt-0.5">
								<span
									className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
										typeof stn.delayArrivalMinutes ===
											"number" &&
										stn.delayArrivalMinutes > 0
											? "bg-destructive text-destructive-foreground"
											: "bg-emerald-600 text-white"
									}`}
								>
									{typeof stn.delayArrivalMinutes ===
										"number" && stn.delayArrivalMinutes > 0
										? `${stn.delayArrivalMinutes}m late`
										: "On Time"}
								</span>
							</div>
						</div>
					)}
				</div>

				{/* 2. Middle Column: Realistic Railway Ladder Track with Train Icon */}
				<div className="col-span-6 flex items-center gap-3 min-w-0">
					{/* Realistic Railway Track with Sleepers & Train Locomotive Icon */}
					<div className="relative flex items-center justify-center shrink-0 w-8 self-stretch -my-3.5">
						{/* Two parallel steel rails with ladder cross-ties/sleepers */}
						<div
							className="absolute top-0 bottom-0 w-4.5 flex justify-between transition-colors duration-500"
							style={{ minHeight: "76px" }}
						>
							{/* Left Steel Rail */}
							<div
								className={`w-1 h-full transition-colors duration-500 ${
									isPassedTrack
										? "bg-teal-500/90 shadow-[0_0_8px_rgba(20,184,166,0.5)]"
										: "bg-border/80 border-r border-foreground/30"
								}`}
							/>

							{/* Center Horizontal Rail Sleepers / Wooden Ties */}
							<div className="flex-1 flex flex-col justify-around px-0.5 pointer-events-none opacity-60">
								<div
									className={`h-1 rounded-xs transition-colors duration-500 ${
										isPassedTrack
											? "bg-teal-500/80"
											: "bg-muted-foreground/60"
									}`}
								/>
								<div
									className={`h-1 rounded-xs transition-colors duration-500 ${
										isPassedTrack
											? "bg-teal-500/80"
											: "bg-muted-foreground/60"
									}`}
								/>
								<div
									className={`h-1 rounded-xs transition-colors duration-500 ${
										isPassedTrack
											? "bg-teal-500/80"
											: "bg-muted-foreground/60"
									}`}
								/>
								<div
									className={`h-1 rounded-xs transition-colors duration-500 ${
										isPassedTrack
											? "bg-teal-500/80"
											: "bg-muted-foreground/60"
									}`}
								/>
							</div>

							{/* Right Steel Rail */}
							<div
								className={`w-1 h-full transition-colors duration-500 ${
									isPassedTrack
										? "bg-teal-500/90 shadow-[0_0_8px_rgba(20,184,166,0.5)]"
										: "bg-border/80 border-l border-foreground/30"
								}`}
							/>
						</div>

						{/* Station Node Marker on Vertical Track */}
						<div
							id={`live-station-node-${stn.stationCode}`}
							className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 shadow-sm transition-all duration-300 ${
								isPassedTrack
									? "bg-teal-500 border-teal-600 ring-2 ring-teal-500/30"
									: hasDeparted
										? "bg-amber-500 border-amber-600"
										: hasArrived
											? "bg-amber-500 border-amber-600"
											: "bg-amber-500 border-amber-400"
							}`}
						/>
					</div>

					{/* Station Info: Name, Code, Platform Badge, Distance */}
					<div className="flex flex-col min-w-0 truncate py-1">
						<div className="flex items-center gap-2 min-w-0">
							<span className="font-extrabold text-sm sm:text-base text-foreground truncate tracking-tight">
								{stn.stationName}
							</span>
							{isAnimatedTrainPosition && (
								<div className="inline-flex items-center gap-1 bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 font-bold px-2 py-0.5 rounded-full text-[10px]">
									<span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
									<span>Train Here</span>
								</div>
							)}
						</div>

						<div className="flex items-center gap-2 mt-1 flex-wrap">
							<span className="font-mono font-bold text-xs text-foreground/90">
								{stn.stationCode}
							</span>
							{stn.expectedPlatform && (
								<span className="inline-block bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 font-bold px-1.5 py-0.2 rounded text-[11px] font-mono">
									PF {stn.expectedPlatform}
									{hasDeparted ? "" : "*"}
								</span>
							)}
							{isSelectedStation && (
								<Badge
									variant="outline"
									className="text-[10px] bg-primary/15 text-primary border-primary/30"
								>
									Your Station
								</Badge>
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

				{/* 3. Right Column: Departure Timings (Scheduled, Actual/Expected, Delay Badge) */}
				<div className="col-span-3 text-right font-mono">
					{isLast ? (
						<span className="inline-block bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
							{t("tools.pnr_checker.end")}
						</span>
					) : (
						<div className="flex flex-col items-end space-y-0.5">
							{/* Scheduled Time */}
							<div className="text-xs sm:text-sm font-semibold text-foreground/80">
								{stn.departureTime}
							</div>

							{/* Actual / Expected Time */}
							<div
								className={`text-xs sm:text-sm font-extrabold ${
									typeof stn.delayDepartureMinutes ===
										"number" &&
									stn.delayDepartureMinutes > 0
										? "text-destructive"
										: "text-emerald-600 dark:text-emerald-400"
								}`}
							>
								{stn.actualDepartureTime || stn.departureTime}*
							</div>

							{/* Delay / On-Time Pill Badge */}
							<div className="pt-0.5">
								<span
									className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
										typeof stn.delayDepartureMinutes ===
											"number" &&
										stn.delayDepartureMinutes > 0
											? "bg-destructive text-destructive-foreground"
											: "bg-emerald-600 text-white"
									}`}
								>
									{typeof stn.delayDepartureMinutes ===
										"number" &&
									stn.delayDepartureMinutes > 0
										? `${stn.delayDepartureMinutes}m late`
										: "On Time"}
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</React.Fragment>
	);
};
