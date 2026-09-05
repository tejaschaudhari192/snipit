import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Train } from "lucide-react";
import type { TrainScheduleResponse, ScheduleStation } from "../types/trains";
import { StationScheduleRow } from "./station-schedule-row";

import { TrainRunningDaysBadge } from "./train-running-days-badge";

interface ScheduleTimetableTableProps {
	scheduleData: TrainScheduleResponse;
}

export const ScheduleTimetableTable: React.FC<ScheduleTimetableTableProps> = ({
	scheduleData,
}) => {
	const { t } = useTranslation();

	return (
		<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden">
			<div className="p-5 border-b border-border/40 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-start gap-3">
					<Train className="h-6 w-6 text-primary mt-0.5" />
					<div>
						<h2 className="text-lg font-bold text-foreground flex items-center gap-2">
							<span>
								{scheduleData.trainName ||
									`Train ${scheduleData.trainNumber}`}
							</span>
							<Badge
								variant="secondary"
								className="font-mono text-xs"
							>
								#{scheduleData.trainNumber}
							</Badge>
						</h2>
						<p className="text-xs text-muted-foreground font-mono mt-0.5">
							{scheduleData.stations.length} Stations
							{scheduleData.origin &&
								scheduleData.destination &&
								` • ${scheduleData.origin} → ${scheduleData.destination}`}
						</p>
						<div className="flex flex-wrap items-center gap-4 mt-2">
							{scheduleData.runningOn && (
								<TrainRunningDaysBadge
									runningOn={scheduleData.runningOn}
								/>
							)}
							{scheduleData.journeyClasses &&
								scheduleData.journeyClasses.length > 0 && (
									<div className="flex items-center gap-1.5 flex-wrap text-xs">
										<span className="text-muted-foreground font-medium text-[11px]">
											{t("tools.pnr_checker.classes")}:
										</span>
										{scheduleData.journeyClasses.map(
											(cls) => (
												<Badge
													key={cls}
													variant="outline"
													className="font-mono text-[10px] py-0 px-1.5"
												>
													{cls}
												</Badge>
											),
										)}
									</div>
								)}
						</div>
					</div>
				</div>
				<Badge variant="outline" className="text-xs font-mono shrink-0">
					{t("tools.pnr_checker.schedule_live_timetable")}
				</Badge>
			</div>

			<CardContent className="p-0">
				{/* Table Header - 3-Column Split Matching WhereIsMyTrain */}
				<div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 bg-muted/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
					<div className="col-span-3 text-left">
						{t("tools.pnr_checker.arrival")}
					</div>
					<div className="col-span-6 text-left">
						{t("tools.pnr_checker.station_info")}
					</div>
					<div className="col-span-3 text-right">
						{t("tools.pnr_checker.departure")}
					</div>
				</div>

				{/* Stations grouped by Day */}
				<div className="divide-y divide-border/30">
					{scheduleData.stations.map(
						(stn: ScheduleStation, idx: number) => {
							const isFirst = idx === 0;
							const isLast =
								idx === scheduleData.stations.length - 1;
							const prevStn =
								idx > 0 ? scheduleData.stations[idx - 1] : null;
							const isNewDay =
								!prevStn || stn.dayCount !== prevStn.dayCount;

							return (
								<StationScheduleRow
									key={stn.stationCode || idx}
									stn={stn}
									idx={idx}
									isFirst={isFirst}
									isLast={isLast}
									isNewDay={isNewDay}
								/>
							);
						},
					)}
				</div>
			</CardContent>
		</Card>
	);
};
