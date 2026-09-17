import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { User, TrendingUp } from "lucide-react";
import type { Passenger } from "../types/trains";
import { getEffectiveCoachAndBerth } from "../utils/pnr-helpers";

interface PnrTicketPassengerListProps {
	passengers?: Passenger[];
}

export const PnrTicketPassengerList: React.FC<PnrTicketPassengerListProps> = ({
	passengers,
}) => {
	const { t } = useTranslation();

	const getStatusVariant = (
		status: string,
	): "default" | "secondary" | "destructive" | "outline" => {
		const s = status.toLowerCase();
		if (s.includes("confirm") || s.includes("cnf")) return "default";
		if (s.includes("rac")) return "secondary";
		if (s.includes("wl") || s.includes("wait")) return "destructive";
		return "outline";
	};

	return (
		<div className="p-5 sm:p-6 bg-card space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
					<User className="h-3.5 w-3.5 text-primary" />
					<span>{t("tools.pnr_checker.passengers_header")}</span>
				</h4>
				<span className="text-[11px] text-muted-foreground font-mono">
					{t("tools.pnr_checker.passengers_count", {
						count: passengers?.length || 0,
					})}
				</span>
			</div>

			{passengers && passengers.length > 0 ? (
				<div className="divide-y divide-border/40 rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
					{passengers.map((passenger) => {
						const { coach, berth, cleanStatus } =
							getEffectiveCoachAndBerth(passenger);
						const displayStatus = cleanStatus || passenger.status;

						return (
							<div
								key={`pax-${passenger.number}`}
								className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2.5 hover:bg-muted/20 transition-colors"
							>
								<div className="flex flex-col">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-sm font-bold text-foreground">
											{passenger.name ||
												t(
													"tools.pnr_checker.passenger",
													{
														number: passenger.number,
													},
												)}
										</span>
										{(coach || berth) && (
											<Badge
												variant="outline"
												className="text-[11px] font-mono py-0 bg-background border-primary/30 text-primary font-semibold"
											>
												{coach &&
													t(
														"tools.pnr_checker.coach_label",
														{
															coach,
														},
													)}
												{coach && berth && " • "}
												{berth &&
													t(
														"tools.pnr_checker.berth_label",
														{
															berth,
														},
													)}
											</Badge>
										)}
									</div>
									{passenger.bookingStatus && (
										<span className="text-xs text-muted-foreground mt-0.5">
											{t(
												"tools.pnr_checker.booking_label",
												{
													status: passenger.bookingStatus,
												},
											)}
										</span>
									)}
								</div>

								<div className="flex items-center gap-2 shrink-0">
									{passenger.prediction &&
										(() => {
											const probNum = parseInt(
												passenger.prediction,
											);
											const isHigh = !isNaN(probNum)
												? probNum >= 75
												: passenger.prediction.includes(
														"100",
													);
											const isMedium =
												!isNaN(probNum) &&
												probNum >= 50;
											const badgeClass = isHigh
												? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
												: isMedium
													? "border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10"
													: "border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10";
											return (
												<Badge
													variant="outline"
													className={`text-xs font-bold flex items-center gap-1 ${badgeClass}`}
												>
													<TrendingUp className="w-3 h-3" />
													<span>
														{passenger.prediction}
													</span>
												</Badge>
											);
										})()}
									<Badge
										variant={getStatusVariant(
											displayStatus,
										)}
										className="text-xs font-semibold px-3 py-1 shadow-2xs"
									>
										{displayStatus}
									</Badge>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<p className="text-sm text-muted-foreground italic">
					{t("tools.pnr_checker.no_status")}
				</p>
			)}
		</div>
	);
};
