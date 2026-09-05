import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import type { Passenger } from "../types/trains";

interface PnrPassengerListSectionProps {
	passengers?: Passenger[];
}

export const PnrPassengerListSection: React.FC<
	PnrPassengerListSectionProps
> = ({ passengers }) => {
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
		<div className="space-y-3">
			<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{t("tools.pnr_checker.passengers_header")}
			</h3>

			{passengers && passengers.length > 0 ? (
				<div className="divide-y divide-border/40">
					{passengers.map((passenger) => (
						<div
							key={`pax-${passenger.number}`}
							className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2"
						>
							<div className="flex flex-col">
								<div className="flex items-center gap-2">
									<span className="text-sm font-bold text-foreground">
										{passenger.name ||
											t("tools.pnr_checker.passenger", {
												number: passenger.number,
											})}
									</span>
									{passenger.coach && (
										<Badge
											variant="outline"
											className="text-[11px] font-mono py-0"
										>
											{t(
												"tools.pnr_checker.coach_label",
												{
													coach: passenger.coach,
												},
											)}
											{passenger.berth
												? ` • ${t(
														"tools.pnr_checker.berth_label",
														{
															berth: passenger.berth,
														},
													)}`
												: ""}
										</Badge>
									)}
								</div>
								{passenger.bookingStatus && (
									<span className="text-xs text-muted-foreground mt-0.5">
										{t("tools.pnr_checker.booking_label", {
											status: passenger.bookingStatus,
										})}
									</span>
								)}
							</div>

							<div className="flex items-center gap-2 shrink-0">
								{passenger.prediction && (
									<Badge
										variant="outline"
										className="text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center gap-1"
									>
										<TrendingUp className="w-3 h-3" />
										<span>{passenger.prediction}</span>
									</Badge>
								)}
								<Badge
									variant={getStatusVariant(passenger.status)}
									className="text-xs font-semibold px-2.5 py-1"
								>
									{passenger.status}
								</Badge>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-muted-foreground italic">
					{t("tools.pnr_checker.no_status")}
				</p>
			)}
		</div>
	);
};
