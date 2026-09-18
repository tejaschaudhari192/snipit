import React from "react";
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
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import type { PnrTrackingItem } from "../types/trains";
import { formatTrainDateToYYYYMMDD } from "../utils/trains-storage";

interface PnrAlertsSheetProps {
	isOpen: boolean;
	onClose: () => void;
	trackings: PnrTrackingItem[];
	loading: boolean;
	onSelectPnr: (pnr: string) => void;
	onStopTracking: (pnr: string) => Promise<void>;
	unsubscribingPnr: string | null;
	currentPnr?: string;
}

export const PnrAlertsSheet: React.FC<PnrAlertsSheetProps> = ({
	isOpen,
	onClose,
	trackings,
	loading,
	onSelectPnr,
	onStopTracking,
	unsubscribingPnr,
	currentPnr,
}) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { user } = useAuth();

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<SheetContent
				side="right"
				className="w-full sm:max-w-md p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/60"
			>
				{/* Sheet Header */}
				<div className="p-5 border-b border-border/50 bg-muted/20">
					<SheetHeader className="space-y-1.5 text-left">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
								<Bell className="h-4 w-4" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<SheetTitle className="text-base font-bold text-foreground">
										{t(
											"tools.pnr_checker.hub.tab_alerts",
											"Active Tracking Alerts",
										)}
									</SheetTitle>
									{trackings.length > 0 && (
										<Badge
											variant="secondary"
											className="h-4 px-1.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
										>
											{trackings.length}
										</Badge>
									)}
								</div>
								<SheetDescription className="text-xs text-muted-foreground mt-0.5">
									{t(
										"tools.pnr_checker.hub.live_sync",
										"Hourly Live Sync",
									)}{" "}
									•{" "}
									{t(
										"tools.pnr_checker.hub.email_notifications",
										"Email notifications",
									)}
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>
				</div>

				{/* Content List */}
				<div className="flex-1 overflow-y-auto p-4 space-y-3">
					<TooltipProvider delay={200}>
						{loading ? (
							<div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
								<Loader2 className="h-5 w-5 animate-spin text-primary" />
								<span>
									{t(
										"tools.pnr_checker.hub.loading_alerts",
										"Loading active tracking alerts...",
									)}
								</span>
							</div>
						) : !user ? (
							<div className="py-8 px-4 text-center rounded-2xl bg-muted/20 border border-border/40 space-y-3">
								<Bell className="h-8 w-8 mx-auto text-primary/70" />
								<div className="space-y-1 max-w-xs mx-auto">
									<p className="text-sm font-semibold text-foreground">
										{t(
											"tools.pnr_checker.hub.login_to_view_alerts",
											"Sign in to view hourly PNR alerts",
										)}
									</p>
									<p className="text-xs text-muted-foreground">
										{t(
											"tools.pnr_checker.hub.alerts_desc",
											"Hourly email alerts notify you whenever your berth, RAC, or chart changes.",
										)}
									</p>
								</div>
								<Link
									to="/auth/login"
									onClick={onClose}
									className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium gap-1.5 shadow-xs hover:bg-primary/90 transition-colors"
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
						) : trackings.length > 0 ? (
							<div className="space-y-3">
								{trackings.map((tracking) => {
									const isSelected =
										currentPnr === tracking.pnr;
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
											onClick={() => {
												onSelectPnr(tracking.pnr);
												onClose();
											}}
											role="button"
											tabIndex={0}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													onSelectPnr(tracking.pnr);
													onClose();
												}
											}}
											className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
												isSelected
													? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/30"
													: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-sm"
											}`}
										>
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0 space-y-1">
													<div className="flex items-center gap-1.5">
														<span className="font-mono text-sm font-bold text-foreground tracking-wider group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
															{tracking.pnr}
														</span>
														<Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 font-semibold gap-1">
															<span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
															<span>
																{t(
																	"tools.pnr_checker.train_running",
																	"Active",
																)}
															</span>
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

												<div className="flex items-center gap-1.5 shrink-0">
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
																			onClose();
																			const formattedDate =
																				formatTrainDateToYYYYMMDD(
																					tracking.departureDate,
																				);
																			navigate(
																				`/tools/trains?tab=live&trainNumber=${tracking.trainNumber}&date=${formattedDate}`,
																			);
																		}}
																		className="h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
																	>
																		<Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
																		<span>
																			{t(
																				"tools.pnr_checker.live_status",
																				"Live",
																			)}
																		</span>
																	</button>
																}
															/>
															<TooltipContent side="top">
																<p className="text-xs">
																	{t(
																		"tools.pnr_checker.hub.track_live_status",
																		{
																			train: tracking.trainNumber,
																			defaultValue: `Track live status of Train ${tracking.trainNumber}`,
																		},
																	)}
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
																	onClick={(
																		e,
																	) => {
																		e.stopPropagation();
																		onStopTracking(
																			tracking.pnr,
																		);
																	}}
																	className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
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
											<div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-xs text-muted-foreground">
												<div className="flex items-center gap-1 font-medium">
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
													<div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
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
							<div className="py-12 text-center text-xs text-muted-foreground space-y-2">
								<Bell className="h-8 w-8 mx-auto text-muted-foreground/30" />
								<p className="font-medium text-foreground/80">
									{t(
										"tools.pnr_checker.hub.no_alerts",
										"No active tracking alerts",
									)}
								</p>
								<p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
									{t(
										"tools.pnr_checker.hub.empty_tracking_hint",
										'Search any PNR ticket and click "Enable Tracking" to receive hourly updates on your chart & confirmation status.',
									)}
								</p>
							</div>
						)}
					</TooltipProvider>
				</div>
			</SheetContent>
		</Sheet>
	);
};
