import React from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";

interface PnrJourneyDetailsSectionProps {
	from: string;
	to: string;
	departure: string;
	departureDate?: string;
	arrival: string;
	arrivalDate?: string;
	duration?: string;
}

export const PnrJourneyDetailsSection: React.FC<
	PnrJourneyDetailsSectionProps
> = ({
	from,
	to,
	departure,
	departureDate,
	arrival,
	arrivalDate,
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
			return dateStr;
		}
	};

	return (
		<div className="flex justify-between items-center gap-4">
			<div className="flex-1 text-left">
				<div className="text-xl font-black tracking-tight text-foreground">
					{from || t("tools.pnr_checker.from_station")}
				</div>
				<div className="flex flex-col text-xs text-muted-foreground mt-0.5 space-y-0.5">
					{departureDate && (
						<span className="font-semibold text-foreground/90">
							{formatJourneyDate(departureDate)}
						</span>
					)}
					<div className="flex items-center gap-1">
						<Clock className="h-3 w-3 text-primary shrink-0" />
						<span>{departure || "--:--"}</span>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center justify-center px-2 shrink-0">
				<span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/40">
					{duration || t("tools.pnr_checker.direct_route")}
				</span>
				<div className="w-16 h-px bg-border/80 my-1 relative">
					<div className="absolute right-0 -top-0.75 border-y-4 border-y-transparent border-l-[6px] border-l-border/80" />
				</div>
			</div>

			<div className="flex-1 text-right">
				<div className="text-xl font-black tracking-tight text-foreground">
					{to || t("tools.pnr_checker.to_station")}
				</div>
				<div className="flex flex-col items-end text-xs text-muted-foreground mt-0.5 space-y-0.5">
					{arrivalDate && (
						<span className="font-semibold text-foreground/90">
							{formatJourneyDate(arrivalDate)}
						</span>
					)}
					<div className="flex items-center justify-end gap-1">
						<Clock className="h-3 w-3 text-primary shrink-0" />
						<span>{arrival || "--:--"}</span>
					</div>
				</div>
			</div>
		</div>
	);
};
