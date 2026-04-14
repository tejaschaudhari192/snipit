import {
	Link,
	X,
	CheckCircle2,
	Copy,
	ExternalLink,
	History,
	RefreshCw,
	Trash2,
	Download,
	QrCode,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import type { PasteData } from "@/types";
import { QRDialog } from "@/components/common/qr-dialog";
import { useState } from "react";

interface LinkResultViewProps {
	textValue: string;
	setTextValue: (v: string) => void;
	shortenedResult?: {
		id: string;
		url: string;
	} | null;
	isHistoryVisible: boolean;
	setIsHistoryVisible: (v: boolean) => void;
	linkHistory: Array<PasteData>;
	onDeleteHistoryItem?: (id: string) => void;
}

export const LinkResultView = ({
	textValue,
	setTextValue,
	shortenedResult,
	isHistoryVisible,
	setIsHistoryVisible,
	linkHistory,
	onDeleteHistoryItem,
}: LinkResultViewProps) => {
	const { t } = useTranslation();
	const [qrUrl, setQrUrl] = useState<string | null>(null);
	const downloadQR = () => {
		const canvas = document.getElementById(
			"short-url-qr",
		) as HTMLCanvasElement;
		if (canvas && shortenedResult) {
			const pngUrl = canvas
				.toDataURL("image/png")
				.replace("image/png", "image/octet-stream");
			const downloadLink = document.createElement("a");
			downloadLink.href = pngUrl;
			downloadLink.download = `qr-${shortenedResult.id}.png`;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			toast.success(t("messages.qr_downloaded", "QR Code downloaded!"));
		}
	};

	return (
		<div className="h-full w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden relative">
			<div
				className={cn(
					"flex items-center justify-center p-6 bg-muted/5 overflow-y-auto transition-all duration-300",
					isHistoryVisible
						? "md:col-span-8 border-r border-border/10"
						: "md:col-span-12",
				)}
			>
				{!isHistoryVisible && (
					<Button
						variant="ghost"
						size="sm"
						className="absolute top-4 right-4 h-9 gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-all z-30"
						onClick={() => setIsHistoryVisible(true)}
					>
						<History className="h-3.5 w-3.5" />
						{t("history.recent_links", "Recent Links")}
					</Button>
				)}
				{shortenedResult ? (
					<div className="w-full max-w-xl animate-in zoom-in-95 duration-500">
						<div className="glass-card p-8 flex flex-col items-center gap-6 text-center border-primary/20 bg-primary/5">
							<div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
								<CheckCircle2 className="h-10 w-10" />
							</div>

							<div className="space-y-2">
								<h2 className="text-2xl font-black tracking-tight text-foreground">
									{t(
										"home.link_shortened",
										"Link Shortened!",
									)}
								</h2>
								<p className="text-muted-foreground font-medium">
									{t(
										"home.link_ready_desc",
										"Your short link is ready to share",
									)}
								</p>
							</div>

							<div className="flex flex-col items-center group/qr relative">
								<div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
								<div className="p-3 bg-white rounded-2xl shadow-xl shadow-primary/10 border border-primary/10 relative z-10 transition-transform hover:scale-105 duration-300">
									<QRCodeCanvas
										id="short-url-qr"
										value={shortenedResult.url}
										size={140}
										level="H"
										includeMargin={false}
									/>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="mt-4 h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-all gap-1.5"
									onClick={downloadQR}
								>
									<Download className="h-3 w-3" />
									{t("common.download_qr", "Download QR")}
								</Button>
							</div>

							<div className="w-full space-y-4">
								<div className="relative group/link">
									<div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-emerald-500/50 rounded-xl blur opacity-20 group-hover/link:opacity-40 transition duration-500"></div>
									<div className="relative flex items-center gap-2 p-1 pl-4 bg-background border border-border/50 rounded-xl">
										<span className="flex-1 text-sm font-bold truncate text-left text-foreground/90">
											{shortenedResult.url}
										</span>
										<Button
											size="sm"
											variant="ghost"
											className="h-9 px-4 font-bold gap-2 hover:bg-primary/10 hover:text-primary transition-all"
											onClick={() => {
												navigator.clipboard.writeText(
													shortenedResult.url,
												);
												toast.success(
													t("header.copied_link", {
														id: `/${shortenedResult.id}`,
														defaultValue: `Copied /${shortenedResult.id}`,
													}),
												);
											}}
										>
											<Copy className="h-3.5 w-3.5" />
											{t("display.copy_button", "Copy")}
										</Button>
									</div>
								</div>

								<div className="flex items-center justify-between px-2 text-[11px] font-bold text-muted-foreground/80 tracking-wide">
									<span>
										{t("home.alias", "Alias")}:{" "}
										{shortenedResult.id}
									</span>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
								<Button
									className="flex-1 h-11 font-black uppercase tracking-wider shadow-lg shadow-primary/20"
									onClick={() =>
										window.open(
											shortenedResult.url,
											"_blank",
										)
									}
								>
									<ExternalLink className="h-4 w-4 mr-2" />
									{t("common.visit_link")}
								</Button>
								<Button
									variant="outline"
									className="flex-1 h-11 font-bold border-border/50 bg-background/50 backdrop-blur-sm"
									onClick={() => setTextValue("")}
								>
									{t("home.create_another", "Create Another")}
								</Button>
							</div>
						</div>
					</div>
				) : (
					<div className="w-full max-w-xl space-y-6">
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
								<Link className="h-6 w-6" />
							</div>
							<h2 className="text-xl font-bold tracking-tight">
								{t("home.tab_link", "Link")}
							</h2>
							<p className="text-muted-foreground text-sm font-medium">
								{t(
									"home.link_desc",
									"Paste a long link to shorten it",
								)}
							</p>
						</div>
						<Input
							value={textValue}
							onChange={(e) => setTextValue(e.target.value)}
							placeholder={t(
								"home.link_placeholder",
								"Paste long URL and click Shorten",
							)}
							className="h-12 text-base px-5 rounded-xl border-primary/20 focus-visible:ring-primary/20 bg-background"
						/>
						<div className="flex items-center justify-center gap-4 text-xs text-muted-foreground font-bold">
							<span className="px-3 py-1 rounded-lg bg-muted border border-border/50">
								✅{" "}
								{t("home.link_features.custom", "Custom Alias")}
							</span>
						</div>
					</div>
				)}
			</div>

			{/* Recent Links Sidebar */}
			{isHistoryVisible && (
				<div className="md:col-span-4 bg-background/30 flex flex-col min-h-0 border-l border-border/5">
					<div className="p-4 border-b border-border/10 flex items-center justify-between bg-background/40 backdrop-blur-md sticky top-0 z-10">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-lg bg-primary/10 text-primary">
								<History className="h-3.5 w-3.5" />
							</div>
							<h3 className="text-xs font-black uppercase tracking-widest text-primary/80">
								{t("history.recent_links", "Recent Links")}
							</h3>
						</div>
						<div className="flex items-center gap-1">
							<button
								className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
								onClick={() => window.location.reload()}
								title={t("common.refresh", "Refresh")}
							>
								<RefreshCw className="h-3 w-3" />
							</button>
							<button
								className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
								onClick={() => setIsHistoryVisible(false)}
								title={t("common.close", "Close")}
							>
								<X className="h-3 w-3" />
							</button>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
						{linkHistory.length === 0 ? (
							<div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
								<div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
									<Link className="h-5 w-5 text-muted-foreground/40" />
								</div>
								<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
									{t(
										"history.no_history_desc",
										"No history yet",
									)}
								</p>
							</div>
						) : (
							linkHistory.map((item) => (
								<div
									key={item.id}
									className={cn(
										"group/history-item w-full p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-primary/[0.02] hover:border-primary/20 transition-all flex flex-col gap-2 relative overflow-hidden",
									)}
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
												navigator.clipboard.writeText(
													shortUrl,
												);
												toast.success(
													t("header.copied_link", {
														id: `/${item.id}`,
														defaultValue: `Copied /${item.id}`,
													}),
												);
											}}
										>
											<Copy className="h-3 w-3" />
											{t("display.copy_button", "Copy")}
										</Button>
										<Button
											variant="secondary"
											size="sm"
											className="h-7 w-8 flex items-center justify-center bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary border-none transition-all"
											onClick={() => {
												setQrUrl(
													`${window.location.origin}/${item.id}`,
												);
											}}
											title={t("header.qr_button")}
										>
											<QrCode className="h-3 w-3" />
										</Button>
										<Button
											variant="secondary"
											size="sm"
											className="h-7 px-2 text-[9px] font-black uppercase tracking-wider gap-1.5 flex-1 bg-muted/60 hover:bg-muted text-muted-foreground border-none transition-all"
											onClick={() => {
												const shortUrl = `${window.location.origin}/${item.id}`;
												window.open(shortUrl, "_blank");
											}}
										>
											<ExternalLink className="h-3 w-3" />
											{t("common.visit_link", "Visit")}
										</Button>
										{onDeleteHistoryItem && (
											<Button
												variant="secondary"
												size="sm"
												className="h-7 w-8 flex items-center justify-center bg-muted/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border-none transition-all"
												onClick={(e) => {
													e.stopPropagation();
													onDeleteHistoryItem(
														item.id,
													);
												}}
												title={t(
													"display.delete_button",
													"Delete",
												)}
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
			)}
			<QRDialog
				url={qrUrl || ""}
				isOpen={!!qrUrl}
				onOpenChange={(open) => !open && setQrUrl(null)}
			/>
		</div>
	);
};
