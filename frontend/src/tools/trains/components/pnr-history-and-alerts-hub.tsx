import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
	Bell,
	BellOff,
	Clock,
	ArrowRight,
	Loader2,
	LogIn,
	Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { getMyPnrTrackings, unsubscribePnrTracking } from "../api/trains";
import type { PnrTrackingItem } from "../types/trains";
import { formatTrainDateToYYYYMMDD } from "../utils/trains-storage";

interface PnrHistoryAndAlertsHubProps {
	onSelectPnr: (pnr: string) => void;
	currentPnr?: string;
	refreshTrigger?: number;
}

export const PnrHistoryAndAlertsHub: React.FC<PnrHistoryAndAlertsHubProps> = ({
	onSelectPnr,
	currentPnr,
	refreshTrigger = 0,
}) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { user, loading: authLoading } = useAuth();

	const [activeTrackings, setActiveTrackings] = useState<PnrTrackingItem[]>(
		[],
	);
	const [trackingsLoading, setTrackingsLoading] = useState(false);
	const [unsubscribingPnr, setUnsubscribingPnr] = useState<string | null>(
		null,
	);

	// Fetch active trackings from API for logged in users
	const reloadTrackings = useCallback(async () => {
		if (!user) {
			setActiveTrackings([]);
			return;
		}
		setTrackingsLoading(true);
		try {
			const trackings = await getMyPnrTrackings();
			const active = trackings.filter((tr) => tr.isActive);
			setActiveTrackings(active);
		} catch (err) {
			console.error("Failed to fetch active PNR trackings:", err);
		} finally {
			setTrackingsLoading(false);
		}
	}, [user]);

	useEffect(() => {
		if (!authLoading && user) {
			reloadTrackings();
		} else if (!authLoading && !user) {
			setActiveTrackings([]);
		}
	}, [authLoading, user, reloadTrackings, refreshTrigger]);

	const handleStopTracking = async (e: React.MouseEvent, pnr: string) => {
		e.stopPropagation();
		setUnsubscribingPnr(pnr);
		try {
			await unsubscribePnrTracking(pnr);
			setActiveTrackings((prev) =>
				prev.filter((item) => item.pnr !== pnr),
			);
		} catch (err) {
			console.error("Failed to stop tracking:", err);
		} finally {
			setUnsubscribingPnr(null);
		}
	};

	// Don't render alerts hub if user has no active trackings and not logged in
	const hasAlerts = activeTrackings.length > 0;

	if (!hasAlerts && !user) {
		return null;
	}

	return (
		<TooltipProvider delay={200}>
			<div className="w-full rounded-2xl border border-emerald-500/30 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden transition-all duration-300">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:px-4 border-b border-emerald-500/20 bg-emerald-500/5">
					<div className="flex items-center gap-2">
						<span className="relative flex h-2 w-2">
							{hasAlerts && (
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
							)}
							<span
								className={`relative inline-flex rounded-full h-2 w-2 ${
									hasAlerts
										? "bg-emerald-500"
										: "bg-muted-foreground/50"
								}`}
							/>
						</span>
						<Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
						<span className="text-xs font-bold text-foreground">
							{t(
								"tools.pnr_checker.hub.tab_alerts",
								"Active Tracking Alerts",
							)}
						</span>
						{hasAlerts && (
							<Badge
								variant="secondary"
								className="h-4 px-1.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
							>
								{activeTrackings.length}
							</Badge>
						)}
					</div>

					{hasAlerts && (
						<Badge
							variant="outline"
							className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center gap-1 self-start sm:self-auto"
						>
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span>
								{t(
									"tools.pnr_checker.hub.live_sync",
									"Hourly Live Sync",
								)}
							</span>
						</Badge>
					)}
				</div>

				<div className="p-3 sm:p-4">
					{trackingsLoading ? (
						<div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
							<span>Loading active tracking alerts...</span>
						</div>
					) : !user ? (
						<div className="py-6 px-4 text-center rounded-xl bg-muted/20 border border-border/40 space-y-3">
							<Bell className="h-6 w-6 mx-auto text-primary/70" />
							<div className="space-y-1 max-w-sm mx-auto">
								<p className="text-xs font-semibold text-foreground">
									{t(
										"tools.pnr_checker.hub.login_to_view_alerts",
										"Sign in to view hourly PNR alerts",
									)}
								</p>
								<p className="text-[11px] text-muted-foreground">
									Hourly email alerts notify you whenever your
									berth, RAC, or chart changes.
								</p>
							</div>
							<Link
								to="/auth/login"
								className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium gap-1.5 shadow-xs hover:bg-primary/90 transition-colors"
							>
								<LogIn className="h-3.5 w-3.5" />
								<span>
									{t(
										"tools.pnr_checker.hub.sign_in",
										"Sign in",
									)}
								</span>
							</Link>
						</div>
					) : hasAlerts ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
							{activeTrackings.map((tracking) => {
								const isSelected = currentPnr === tracking.pnr;
								const nextCheck = tracking.nextCheckAt
									? new Date(
											tracking.nextCheckAt,
										).toLocaleTimeString(
											i18n.language || "en-US",
											{
												hour: "2-digit",
												minute: "2-digit",
											},
										)
									: null;

								return (
									<div
										key={tracking._id || tracking.pnr}
										onClick={() =>
											onSelectPnr(tracking.pnr)
										}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === "Enter")
												onSelectPnr(tracking.pnr);
										}}
										className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
											isSelected
												? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30"
												: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-xs"
										}`}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 space-y-0.5">
												<div className="flex items-center gap-1.5">
													<span className="font-mono text-xs font-bold text-foreground tracking-wider group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
														{tracking.pnr}
													</span>
													<Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 font-semibold gap-1">
														<span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
														<span>Active</span>
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground truncate font-medium">
													{tracking.trainNumber
														? `${tracking.trainNumber} • `
														: ""}
													{tracking.trainName ||
														t(
															"tools.pnr_checker.train_details",
															"Train Details",
														)}
												</p>
											</div>

											<div className="flex items-center gap-1 shrink-0">
												{tracking.trainNumber && (
													<Tooltip>
														<TooltipTrigger
															render={
																<button
																	type="button"
																	onClick={(
																		e,
																	) => {
																		e.stopPropagation();
																		const formattedDate =
																			formatTrainDateToYYYYMMDD(
																				tracking.departureDate,
																			);
																		navigate(
																			`/tools/trains?tab=live&trainNumber=${tracking.trainNumber}&date=${formattedDate}`,
																		);
																	}}
																	className="h-6 px-1.5 rounded-md flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
																>
																	<Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
																	<span>
																		Live
																	</span>
																</button>
															}
														/>
														<TooltipContent side="top">
															<p className="text-xs">
																Track live
																status of Train{" "}
																{
																	tracking.trainNumber
																}
															</p>
														</TooltipContent>
													</Tooltip>
												)}

												{/* Stop Tracking Button */}
												<Tooltip>
													<TooltipTrigger
														render={
															<button
																type="button"
																disabled={
																	unsubscribingPnr ===
																	tracking.pnr
																}
																onClick={(e) =>
																	handleStopTracking(
																		e,
																		tracking.pnr,
																	)
																}
																className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
															>
																{unsubscribingPnr ===
																tracking.pnr ? (
																	<Loader2 className="h-3.5 w-3.5 animate-spin" />
																) : (
																	<BellOff className="h-3.5 w-3.5" />
																)}
															</button>
														}
													/>
													<TooltipContent side="top">
														<p className="text-xs">
															{t(
																"tools.pnr_checker.hub.stop_tracking",
																"Stop Tracking",
															)}
														</p>
													</TooltipContent>
												</Tooltip>
											</div>
										</div>

										{/* Bottom Row */}
										<div className="mt-3 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-muted-foreground">
											<div className="flex items-center gap-1">
												<span>
													{tracking.fromCode ||
														tracking.from}
												</span>
												<ArrowRight className="h-2.5 w-2.5 text-muted-foreground/60" />
												<span>
													{tracking.toCode ||
														tracking.to}
												</span>
											</div>

											{nextCheck && (
												<div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
													<Clock className="h-3 w-3" />
													<span>
														{t(
															"tools.pnr_checker.hub.next_check",
															{
																time: nextCheck,
															},
														)}
													</span>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="py-6 text-center text-xs text-muted-foreground">
							<Bell className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
							<p>
								{t(
									"tools.pnr_checker.hub.no_alerts",
									"No active tracking alerts",
								)}
							</p>
						</div>
					)}
				</div>
			</div>
		</TooltipProvider>
	);
};
