import React from "react";
import { useTranslation } from "react-i18next";
import { Train, Clock, Calendar } from "lucide-react";

interface PnrTicketRouteDetailsProps {
	from: string;
	to: string;
	pnr: string;
	departure: string;
	arrival: string;
	departureDate?: string;
	arrivalDate?: string;
	date?: string;
	duration?: string;
}

export const PnrTicketRouteDetails: React.FC<PnrTicketRouteDetailsProps> = ({
	from,
	to,
	pnr,
	departure,
	arrival,
	departureDate,
	arrivalDate,
	date,
	duration,
}) => {
	const { t, i18n } = useTranslation();

	const formatJourneyDate = (dateStr?: string) => {
		if (!dateStr) return "";
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString(i18n.language || undefined, {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
			});
		} catch {
			return dateStr || "";
		}
	};

	return (
		<div className="relative p-5 sm:p-6 bg-muted/10">
			{/* Ticket Left & Right Cutout Notches */}
			<div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-r-2 border-primary/20 shadow-inner" />
			<div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-l-2 border-primary/20 shadow-inner" />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
				{/* Departure Stn */}
				<div className="flex-1">
					<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
						{t("tools.pnr_checker.origin_departure")}
					</span>
					<div className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
						{from || t("tools.pnr_checker.from_station")}
					</div>
					<div className="flex flex-col text-xs text-muted-foreground mt-1 space-y-0.5">
						{(departureDate || date) && (
							<div className="flex items-center gap-1 font-semibold text-foreground/90">
								<Calendar className="h-3 w-3 text-primary" />
								<span>
									{formatJourneyDate(departureDate || date)}
								</span>
							</div>
						)}
						<div className="flex items-center gap-1 font-mono text-sm font-bold text-primary">
							<Clock className="h-3.5 w-3.5 shrink-0" />
							<span>{departure || "--:--"}</span>
						</div>
					</div>
				</div>

				{/* Route Track Line */}
				<div className="w-full md:w-48 flex flex-col items-center justify-center py-2 shrink-0">
					<span className="text-[11px] font-bold text-muted-foreground bg-background/80 px-2.5 py-0.5 rounded-full border border-border/50 shadow-2xs">
						{duration || t("tools.pnr_checker.direct_route")}
					</span>
					<div className="w-full h-0.5 bg-dashed border-t-2 border-dashed border-border/80 my-2 relative">
						<div className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background p-1 rounded-full border border-border/60">
							<Train className="h-3 w-3 text-primary" />
						</div>
					</div>
					<span className="text-[10px] font-mono text-muted-foreground">
						{t("tools.pnr_checker.input_label")}:{" "}
						<strong className="text-foreground">{pnr}</strong>
					</span>
				</div>

				{/* Arrival Stn */}
				<div className="flex-1 md:text-right">
					<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
						{t("tools.pnr_checker.destination_arrival")}
					</span>
					<div className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
						{to || t("tools.pnr_checker.to_station")}
					</div>
					<div className="flex flex-col md:items-end text-xs text-muted-foreground mt-1 space-y-0.5">
						{(arrivalDate || date) && (
							<div className="flex items-center gap-1 font-semibold text-foreground/90">
								<Calendar className="h-3 w-3 text-primary" />
								<span>
									{formatJourneyDate(arrivalDate || date)}
								</span>
							</div>
						)}
						<div className="flex items-center md:justify-end gap-1 font-mono text-sm font-bold text-primary">
							<Clock className="h-3.5 w-3.5 shrink-0" />
							<span>{arrival || "--:--"}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
