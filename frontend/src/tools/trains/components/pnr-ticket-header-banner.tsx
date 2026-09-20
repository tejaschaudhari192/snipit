import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Train, Download, Radio, Share2 } from "lucide-react";

interface PnrTicketHeaderBannerProps {
	train: string;
	trainNumber?: string;
	travelClass: string;
	downloading: boolean;
	onViewRoute?: () => void;
	onDownload: () => void;
	onCheckLiveStatus?: () => void;
	onShare?: () => void;
}

export const PnrTicketHeaderBanner: React.FC<PnrTicketHeaderBannerProps> = ({
	train,
	trainNumber,
	travelClass,
	downloading,
	onViewRoute,
	onDownload,
	onCheckLiveStatus,
	onShare,
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
				{onCheckLiveStatus && (
					<Button
						variant="outline"
						size="sm"
						className="text-xs h-8 gap-1.5 rounded-xl border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all font-semibold shadow-xs cursor-pointer"
						onClick={onCheckLiveStatus}
					>
						<Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
						<span>{t("tools.pnr_checker.live_status_tab")}</span>
					</Button>
				)}
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
				{onShare && (
					<Button
						variant="outline"
						size="sm"
						className="text-xs h-8 gap-1.5 rounded-xl border-border/70 hover:border-primary/40 hover:bg-primary/5 transition-all shadow-xs cursor-pointer"
						onClick={onShare}
					>
						<Share2 className="h-3.5 w-3.5 text-primary" />
						<span>{t("tools.pnr_checker.share")}</span>
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
