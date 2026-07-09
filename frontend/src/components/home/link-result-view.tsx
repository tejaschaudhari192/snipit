import { Link, History, MousePointerClick, Timer, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";
import type { PasteData, RedirectionType } from "@/types";
import { QRDialog } from "@/components/common/qr-dialog";
import { useState } from "react";
import { ShortenedResultCard } from "./shortened-result-card";
import { RecentLinksSidebar } from "./recent-links-sidebar";
import { usePaste } from "@/context/PasteContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
	const { redirectionType, setRedirectionType } = usePaste();

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
						{t("history.recent_links")}
					</Button>
				)}

				{shortenedResult ? (
					<ShortenedResultCard
						shortenedResult={shortenedResult}
						setTextValue={setTextValue}
					/>
				) : (
					<div className="w-full max-w-xl space-y-6">
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
								<Link className="h-6 w-6" />
							</div>
							<h2 className="text-xl font-bold tracking-tight">
								{t("home.tab_link")}
							</h2>
							<p className="text-muted-foreground text-sm font-medium">
								{t("home.link_desc")}
							</p>
						</div>
						<Input
							value={textValue}
							onChange={(e) => setTextValue(e.target.value)}
							placeholder={t("home.link_placeholder")}
							className="h-12 text-base px-5 rounded-xl border-primary/20 focus-visible:ring-primary/20 bg-background"
						/>

						<div className="flex flex-col gap-4 items-center justify-center w-full max-w-md mx-auto animate-in fade-in duration-300">
							<Tabs
								value={redirectionType}
								onValueChange={(v) =>
									setRedirectionType?.(v as RedirectionType)
								}
								className="w-full"
							>
								<TabsList className="grid w-full grid-cols-3 h-9 bg-muted border border-border/50 p-0.75 rounded-lg">
									<TabsTrigger
										value="click"
										className="text-xs font-bold gap-1.5"
									>
										<MousePointerClick className="h-3.5 w-3.5 text-primary shrink-0" />
										{t("common.redirection_click")}
									</TabsTrigger>
									<TabsTrigger
										value="timer"
										className="text-xs font-bold gap-1.5"
									>
										<Timer className="h-3.5 w-3.5 text-amber-500 shrink-0" />
										{t("common.redirection_timer")}
									</TabsTrigger>
									<TabsTrigger
										value="direct"
										className="text-xs font-bold gap-1.5"
									>
										<Zap className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
										{t("common.redirection_direct")}
									</TabsTrigger>
								</TabsList>
							</Tabs>

							<div className="flex items-center justify-center w-full text-xs font-bold px-1 select-none">
								<div className="text-[11px] text-muted-foreground/80 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
									{redirectionType === "click" && (
										<>
											<span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
											<span>
												{t(
													"common.redirection_click_desc",
												)}
											</span>
										</>
									)}
									{redirectionType === "timer" && (
										<>
											<span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
											<span>
												{t(
													"common.redirection_timer_desc",
												)}
											</span>
										</>
									)}
									{redirectionType === "direct" && (
										<>
											<span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
											<span>
												{t(
													"common.redirection_direct_desc",
												)}
											</span>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{isHistoryVisible && (
				<RecentLinksSidebar
					linkHistory={linkHistory}
					setIsHistoryVisible={setIsHistoryVisible}
					onDeleteHistoryItem={onDeleteHistoryItem}
					onShowQR={setQrUrl}
				/>
			)}
			<QRDialog
				url={qrUrl || ""}
				isOpen={!!qrUrl}
				onOpenChange={(open) => !open && setQrUrl(null)}
			/>
		</div>
	);
};
