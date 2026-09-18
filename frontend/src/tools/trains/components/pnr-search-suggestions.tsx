import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { History, ArrowRight, X, Trash2, Radio, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	loadPnrSearchHistory,
	removePnrFromHistory,
	clearPnrSearchHistory,
	isJourneyTodayOrUpcoming,
	formatTrainDateToYYYYMMDD,
	type PnrSearchHistoryItem,
} from "../utils/trains-storage";

interface PnrSearchSuggestionsProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectPnr: (pnr: string) => void;
	currentPnr?: string;
	refreshTrigger?: number;
}

export const PnrSearchSuggestions: React.FC<PnrSearchSuggestionsProps> = ({
	isOpen,
	onClose,
	onSelectPnr,
	currentPnr,
	refreshTrigger = 0,
}) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const [historyItems, setHistoryItems] = useState<PnrSearchHistoryItem[]>(
		[],
	);
	const containerRef = useRef<HTMLDivElement>(null);

	const reloadHistory = useCallback(() => {
		const items = loadPnrSearchHistory();
		setHistoryItems(items);
	}, []);

	useEffect(() => {
		reloadHistory();
	}, [reloadHistory, refreshTrigger]);

	// Handle outside clicks to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	const handleRemoveHistory = (e: React.MouseEvent, pnr: string) => {
		e.stopPropagation();
		const updated = removePnrFromHistory(pnr);
		setHistoryItems(updated);
	};

	const handleClearAllHistory = (e: React.MouseEvent) => {
		e.stopPropagation();
		clearPnrSearchHistory();
		setHistoryItems([]);
	};

	const formatDate = (dateStr: string) => {
		try {
			const d = new Date(dateStr);
			if (!isNaN(d.getTime())) {
				return d.toLocaleDateString(i18n.language || "en-US", {
					month: "short",
					day: "numeric",
				});
			}
		} catch {
			// fallback
		}
		return dateStr;
	};

	if (!isOpen || historyItems.length === 0) {
		return null;
	}

	return (
		<TooltipProvider delay={200}>
			<div
				ref={containerRef}
				className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-200"
			>
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/30">
					<div className="flex items-center gap-2">
						<History className="h-3.5 w-3.5 text-primary" />
						<span className="text-xs font-bold text-foreground">
							{t(
								"tools.pnr_checker.hub.recent_searches",
								"Recent Searches",
							)}
						</span>
						<Badge
							variant="secondary"
							className="h-4 px-1.5 text-[10px] font-mono font-bold bg-muted/80 text-foreground"
						>
							{historyItems.length}
						</Badge>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClearAllHistory}
						className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 cursor-pointer"
					>
						<Trash2 className="h-3 w-3" />
						<span>
							{t(
								"tools.pnr_checker.hub.clear_history",
								"Clear all",
							)}
						</span>
					</Button>
				</div>

				{/* History List */}
				<div className="max-h-72 overflow-y-auto divide-y divide-border/30 p-1">
					{historyItems.map((item) => {
						const isSelected = currentPnr === item.pnr;
						return (
							<div
								key={item.pnr}
								onClick={() => {
									onSelectPnr(item.pnr);
									onClose();
								}}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										onSelectPnr(item.pnr);
										onClose();
									}
								}}
								className={`group relative flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
									isSelected
										? "bg-primary/10 text-foreground"
										: "hover:bg-muted/50 text-foreground"
								}`}
							>
								<div className="min-w-0 space-y-1">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="font-mono text-sm font-bold tracking-wider text-foreground group-hover:text-primary transition-colors">
											{item.pnr}
										</span>
										{item.isConfirmed && (
											<Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0 font-semibold leading-tight">
												CNF
											</Badge>
										)}
										{isJourneyTodayOrUpcoming(
											item.departureDate,
										) && (
											<span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
												<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
												Active
											</span>
										)}
										<Badge
											variant="secondary"
											className={`text-[9px] px-1.5 py-0 font-medium ${
												item.isConfirmed
													? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
													: "bg-muted text-muted-foreground"
											}`}
										>
											{item.statusSummary}
										</Badge>
									</div>

									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<span className="truncate font-medium text-foreground/80">
											{item.trainNumber
												? `${item.trainNumber} • `
												: ""}
											{item.trainName ||
												t(
													"tools.pnr_checker.train_details",
													"Train Details",
												)}
										</span>
										<span>•</span>
										<div className="flex items-center gap-1 text-[11px]">
											<span>
												{item.fromCode || item.from}
											</span>
											<ArrowRight className="h-2.5 w-2.5 text-muted-foreground/60" />
											<span>
												{item.toCode || item.to}
											</span>
										</div>
										{item.departureDate && (
											<>
												<span>•</span>
												<span className="flex items-center gap-1 text-[11px]">
													<Calendar className="h-2.5 w-2.5 text-muted-foreground/60" />
													{formatDate(
														item.departureDate,
													)}
												</span>
											</>
										)}
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-1.5 shrink-0 ml-2">
									{item.trainNumber && (
										<Tooltip>
											<TooltipTrigger
												render={
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															const formattedDate =
																formatTrainDateToYYYYMMDD(
																	item.departureDate,
																);
															navigate(
																`/tools/trains?tab=live&trainNumber=${item.trainNumber}&date=${formattedDate}`,
															);
														}}
														className="h-6 px-1.5 rounded-md flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
													>
														<Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
														<span>Live</span>
													</button>
												}
											/>
											<TooltipContent side="top">
												<p className="text-xs">
													Track live status of Train{" "}
													{item.trainNumber}
												</p>
											</TooltipContent>
										</Tooltip>
									)}

									<Tooltip>
										<TooltipTrigger
											render={
												<button
													type="button"
													onClick={(e) =>
														handleRemoveHistory(
															e,
															item.pnr,
														)
													}
													className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
												>
													<X className="h-3.5 w-3.5" />
												</button>
											}
										/>
										<TooltipContent side="top">
											<p className="text-xs">
												Remove from history
											</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</TooltipProvider>
	);
};
