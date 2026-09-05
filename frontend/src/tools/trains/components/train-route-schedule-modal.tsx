import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Train } from "lucide-react";
import { GifLoader } from "@/components/common/gif-loader";
import type { TrainScheduleResponse, ScheduleStation } from "../types/trains";

import { TrainRunningDaysBadge } from "./train-running-days-badge";

interface TrainRouteScheduleModalProps {
	isOpen: boolean;
	onClose: () => void;
	trainTitle?: string;
	from?: string;
	to?: string;
	fromCode?: string;
	toCode?: string;
	loading: boolean;
	scheduleData: TrainScheduleResponse | null;
}

export const TrainRouteScheduleModal: React.FC<
	TrainRouteScheduleModalProps
> = ({
	isOpen,
	onClose,
	trainTitle,
	from,
	to,
	fromCode,
	toCode,
	loading,
	scheduleData,
}) => {
	const { t } = useTranslation();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
			<Card className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-background border-border shadow-2xl overflow-hidden">
				<div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
					<div className="flex items-start gap-2.5">
						<Train className="h-5 w-5 text-primary mt-0.5" />
						<div>
							<h3 className="font-bold text-base text-foreground">
								{trainTitle ||
									t(
										"tools.pnr_checker.route_modal.default_title",
									)}
							</h3>
							<div className="flex flex-wrap items-center gap-3 mt-0.5">
								<p className="text-xs text-muted-foreground">
									{from} → {to}
								</p>
								{scheduleData?.runningOn && (
									<TrainRunningDaysBadge
										runningOn={scheduleData.runningOn}
									/>
								)}
							</div>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 rounded-full"
						onClick={onClose}
					>
						✕
					</Button>
				</div>

				<CardContent className="p-4 overflow-y-auto space-y-3 flex-1">
					{loading ? (
						<div className="py-12 flex flex-col items-center justify-center space-y-3">
							<GifLoader />
							<p className="text-xs text-muted-foreground animate-pulse">
								{t("tools.pnr_checker.route_modal.fetching")}
							</p>
						</div>
					) : scheduleData?.stations &&
					  scheduleData.stations.length > 0 ? (
						<div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
							{scheduleData.stations.map(
								(stn: ScheduleStation, idx: number) => {
									const isHighlight =
										stn.stationCode === fromCode ||
										stn.stationCode === toCode;

									return (
										<div
											key={stn.stationCode || idx}
											className={`relative flex items-center justify-between text-xs p-2.5 rounded-lg border transition-colors ${
												isHighlight
													? "bg-primary/10 border-primary/40 font-semibold"
													: "bg-muted/20 border-border/40 hover:bg-muted/40"
											}`}
										>
											<div className="absolute -left-5.25 w-3 h-3 rounded-full border-2 border-background bg-primary" />
											<div>
												<div className="font-bold text-sm text-foreground">
													{stn.stationName}{" "}
													{stn.stationCode && (
														<span className="text-muted-foreground font-mono text-xs">
															({stn.stationCode})
														</span>
													)}
												</div>
												<div className="text-muted-foreground text-[11px] mt-0.5">
													{t(
														"tools.pnr_checker.route_modal.day_distance",
														{
															day: stn.dayCount,
															km: stn.distance,
														},
													)}
												</div>
											</div>
											<div className="text-right space-y-0.5 font-mono">
												<div>
													{t(
														"tools.pnr_checker.route_modal.arr",
													)}
													:{" "}
													<span className="font-bold">
														{stn.arrivalTime}
													</span>
												</div>
												<div>
													{t(
														"tools.pnr_checker.route_modal.dep",
													)}
													:{" "}
													<span className="font-bold">
														{stn.departureTime}
													</span>
												</div>
											</div>
										</div>
									);
								},
							)}
						</div>
					) : (
						<p className="text-sm text-muted-foreground text-center py-8">
							{t("tools.pnr_checker.schedule_no_info")}
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
