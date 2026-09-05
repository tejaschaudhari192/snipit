import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Train, FileCheck2 } from "lucide-react";

interface PnrHeaderSectionProps {
	trainName: string;
	travelClass: string;
	pnr: string;
	journeyDate: string;
	chartStatus?: string;
	onViewRoute: () => void;
}

export const PnrHeaderSection: React.FC<PnrHeaderSectionProps> = ({
	trainName,
	travelClass,
	pnr,
	journeyDate,
	chartStatus,
	onViewRoute,
}) => {
	const { t, i18n } = useTranslation();

	const formatJourneyDate = (dateStr: string) => {
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
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<Train className="h-5 w-5 text-primary shrink-0" />
					<h2 className="text-lg font-bold text-foreground">
						{trainName}
					</h2>
				</div>
				<div className="flex flex-wrap items-center gap-2 ml-7">
					<Badge variant="secondary" className="text-xs">
						{travelClass}
					</Badge>
					<Badge variant="outline" className="text-xs font-mono">
						{t("tools.pnr_checker.input_label")}: {pnr}
					</Badge>
					<Badge variant="outline" className="text-xs">
						{formatJourneyDate(journeyDate)}
					</Badge>
				</div>
			</div>

			<div className="flex items-center gap-2 self-start sm:self-center ml-7 sm:ml-0">
				{chartStatus && (
					<div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg">
						<FileCheck2 className="h-4 w-4 text-primary" />
						<span>{chartStatus}</span>
					</div>
				)}
				<Button
					variant="outline"
					size="sm"
					className="text-xs h-8 gap-1.5"
					onClick={onViewRoute}
				>
					<Train className="h-3.5 w-3.5 text-primary" />
					<span>{t("tools.pnr_checker.train_route")}</span>
				</Button>
			</div>
		</div>
	);
};
