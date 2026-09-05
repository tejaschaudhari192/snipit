import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Star } from "lucide-react";

interface PnrFooterMetaSectionProps {
	expectedPlatformNo?: string;
	ticketFare?: string | number;
	ratings?: {
		overall?: number;
		cleanliness?: number;
		punctuality?: number;
		food?: number;
	};
}

export const PnrFooterMetaSection: React.FC<PnrFooterMetaSectionProps> = ({
	expectedPlatformNo,
	ticketFare,
	ratings,
}) => {
	const { t } = useTranslation();

	if (!expectedPlatformNo && !ticketFare && !ratings) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
			<div className="flex flex-wrap items-center gap-4">
				{expectedPlatformNo && (
					<div className="flex items-center gap-1.5">
						<span className="font-semibold text-foreground">
							{t("tools.pnr_checker.expected_platform")}:
						</span>
						<Badge
							variant="secondary"
							className="font-mono text-xs"
						>
							#{expectedPlatformNo}
						</Badge>
					</div>
				)}
				{ticketFare && (
					<div className="flex items-center gap-1">
						<span className="font-semibold text-foreground">
							{t("tools.pnr_checker.total_amount")}:
						</span>
						<span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center">
							<IndianRupee className="w-3 h-3 inline" />
							{ticketFare}
						</span>
					</div>
				)}
			</div>

			{ratings && ratings.overall && (
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1 text-amber-500 font-bold">
						<Star className="w-3.5 h-3.5 fill-amber-500" />
						<span>{ratings.overall} / 5</span>
					</div>
					{ratings.cleanliness && (
						<span className="text-[11px]">
							({t("tools.pnr_checker.cleanliness_rating")}:{" "}
							{ratings.cleanliness})
						</span>
					)}
				</div>
			)}
		</div>
	);
};
