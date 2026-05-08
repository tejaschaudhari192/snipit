import {
	History,
	RefreshCw,
	X,
	Link as LinkIcon,
	Copy,
	QrCode,
	ExternalLink,
	Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/utils";
import { toast } from "sonner";
import type { PasteData } from "@/types";

interface RecentLinksSidebarProps {
	linkHistory: Array<PasteData>;
	setIsHistoryVisible: (v: boolean) => void;
	onDeleteHistoryItem?: (id: string) => void;
	onShowQR: (url: string) => void;
}

export const RecentLinksSidebar = ({
	linkHistory,
	setIsHistoryVisible,
	onDeleteHistoryItem,
	onShowQR,
}: RecentLinksSidebarProps) => {
	const { t } = useTranslation();

	return (
		<div className="md:col-span-4 bg-background/30 flex flex-col min-h-0 border-l border-border/5">
			<div className="p-4 border-b border-border/10 flex items-center justify-between bg-background/40 backdrop-blur-md sticky top-0 z-10">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-lg bg-primary/10 text-primary">
						<History className="h-3.5 w-3.5" />
					</div>
					<h3 className="text-xs font-black uppercase tracking-widest text-primary/80">
						{t("history.recent_links")}
					</h3>
				</div>
				<div className="flex items-center gap-1">
					<button
						className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
						onClick={() => window.location.reload()}
						title={t("common.refresh")}
					>
						<RefreshCw className="h-3 w-3" />
					</button>
					<button
						className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
						onClick={() => setIsHistoryVisible(false)}
						title={t("common.close")}
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
				{linkHistory.length === 0 ? (
					<div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
						<div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
							<LinkIcon className="h-5 w-5 text-muted-foreground/40" />
						</div>
						<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
							{t("history.no_history_desc")}
						</p>
					</div>
				) : (
					linkHistory.map((item) => (
						<div
							key={item.id}
							className="group/history-item w-full p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-primary/2 hover:border-primary/20 transition-all flex flex-col gap-2 relative overflow-hidden"
						>
							<div className="flex items-center justify-between">
								<span className="text-[10px] font-bold tracking-wider text-primary/80">
									/{item.id}
								</span>
								<span className="text-[9px] font-bold text-muted-foreground/50">
									{timeAgo(item.createdAt, t)}
								</span>
							</div>
							<p className="text-[11px] font-medium text-foreground/70 truncate leading-relaxed">
								{item.content}
							</p>

							<div className="flex items-center gap-2 mt-1.5 transition-all">
								<Button
									variant="secondary"
									size="sm"
									className="h-7 px-2 text-[9px] font-black uppercase tracking-wider gap-1.5 flex-1 bg-primary/10 hover:bg-primary/20 text-primary border-none transition-all"
									onClick={() => {
										const shortUrl = `${window.location.origin}/${item.id}`;
										navigator.clipboard.writeText(shortUrl);
										toast.success(
											t("header.copied_link", {
												id: `/${item.id}`,
											}),
										);
									}}
								>
									<Copy className="h-3 w-3" />
									{t("display.copy_button")}
								</Button>
								<Button
									variant="secondary"
									size="sm"
									className="h-7 w-8 flex items-center justify-center bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary border-none transition-all"
									onClick={() =>
										onShowQR(
											`${window.location.origin}/${item.id}`,
										)
									}
									title={t("header.qr_button")}
								>
									<QrCode className="h-3 w-3" />
								</Button>
								<Button
									variant="secondary"
									size="sm"
									className="h-7 px-2 text-[9px] font-black uppercase tracking-wider gap-1.5 flex-1 bg-muted/60 hover:bg-muted text-muted-foreground border-none transition-all"
									onClick={() =>
										window.open(
											`${window.location.origin}/${item.id}`,
											"_blank",
										)
									}
								>
									<ExternalLink className="h-3 w-3" />
									{t("common.visit_link")}
								</Button>
								{onDeleteHistoryItem && (
									<Button
										variant="secondary"
										size="sm"
										className="h-7 w-8 flex items-center justify-center bg-muted/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border-none transition-all"
										onClick={(e) => {
											e.stopPropagation();
											onDeleteHistoryItem(item.id);
										}}
										title={t("display.delete_button")}
									>
										<Trash2 className="h-3 w-3" />
									</Button>
								)}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
