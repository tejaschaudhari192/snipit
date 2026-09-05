import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Train, Download } from "lucide-react";

interface PnrTicketHeaderBannerProps {
	train: string;
	trainNumber?: string;
	travelClass: string;
	downloading: boolean;
	onViewRoute?: () => void;
	onDownload: () => void;
}

export const PnrTicketHeaderBanner: React.FC<PnrTicketHeaderBannerProps> = ({
	train,
	trainNumber,
	travelClass,
	downloading,
	onViewRoute,
	onDownload,
}) => {
	const { t } = useTranslation();

	return (
		<div className="bg-linear-to-r from-primary/15 via-primary/10 to-transparent p-4 sm:p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				<div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
					<Train className="h-5 w-5" />
				</div>
				<div>
					<div className="flex items-center gap-2 flex-wrap">
						<h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
							{train}
						</h3>
						{trainNumber && (
							<Badge
								variant="secondary"
								className="font-mono text-xs"
							>
								#{trainNumber}
							</Badge>
						)}
					</div>
					<div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
						<span className="font-semibold text-foreground/80">
							{t("tools.pnr_checker.boarding_pass")}
						</span>
						<span>•</span>
						<span>
							{t("tools.pnr_checker.class_label_prefix")}{" "}
							<strong className="text-foreground">
								{travelClass}
							</strong>
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 self-start sm:self-center">
				{onViewRoute && (
					<Button
						variant="outline"
						size="sm"
						className="text-xs h-8 gap-1.5 rounded-xl border-border/70"
						onClick={onViewRoute}
					>
						<Train className="h-3.5 w-3.5 text-primary" />
						<span>{t("tools.pnr_checker.train_route")}</span>
					</Button>
				)}
				<Button
					variant="default"
					size="sm"
					className="text-xs h-8 gap-1.5 rounded-xl shadow-xs"
					onClick={onDownload}
					disabled={downloading}
				>
					<Download className="h-3.5 w-3.5" />
					<span>
						{downloading
							? t("tools.pnr_checker.downloading")
							: t("tools.pnr_checker.download")}
					</span>
				</Button>
			</div>
		</div>
	);
};
