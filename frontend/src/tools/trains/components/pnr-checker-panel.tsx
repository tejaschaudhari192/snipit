import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bell, Search, Loader2, Train } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GifLoader } from "@/components/common/gif-loader";
import { useAuth } from "@/context/AuthContext";

import {
	getPnrStatus,
	getPnrPrediction,
	getTrainSchedule,
	getMyPnrTrackings,
	unsubscribePnrTracking,
} from "../api/trains";
import type {
	PnrData,
	TrainScheduleResponse,
	PnrTrackingItem,
} from "../types/trains";
import {
	savePnrToHistory,
	formatTrainDateToYYYYMMDD,
} from "../utils/trains-storage";
import { PnrResultCard } from "./pnr-result-card";
import { PnrAlertsSheet } from "./pnr-alerts-sheet";
import { TrainRouteScheduleModal } from "./train-route-schedule-modal";
import { PnrSearchSuggestions } from "./pnr-search-suggestions";

export const PnrCheckerPanel: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user, loading: authLoading } = useAuth();
	const [searchParams] = useSearchParams();
	const initialPnr = (searchParams.get("pnr") || "")
		.replace(/\D/g, "")
		.slice(0, 10);
	const [pnrInput, setPnrInput] = useState(initialPnr);
	const [loading, setLoading] = useState(false);
	const [predictionLoading, setPredictionLoading] = useState(false);
	const [hasPredicted, setHasPredicted] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<PnrData | null>(null);
	const [scheduleLoading, setScheduleLoading] = useState(false);
	const [scheduleData, setScheduleData] =
		useState<TrainScheduleResponse | null>(null);
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const [hubRefreshKey, setHubRefreshKey] = useState(0);
	const [showRecentSuggestions, setShowRecentSuggestions] = useState(false);
	const [isAlertsSheetOpen, setIsAlertsSheetOpen] = useState(false);
	const [activeTrackings, setActiveTrackings] = useState<PnrTrackingItem[]>(
		[],
	);
	const [trackingsLoading, setTrackingsLoading] = useState(false);
	const [unsubscribingPnr, setUnsubscribingPnr] = useState<string | null>(
		null,
	);

	const inputContainerRef = useRef<HTMLDivElement>(null);
	const autoCheckedPnrRef = useRef<string | null>(null);

	// Fetch active trackings for alerts pill and sheet
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
	}, [authLoading, user, reloadTrackings, hubRefreshKey]);

	const handleStopTracking = async (pnr: string) => {
		setUnsubscribingPnr(pnr);
		try {
			await unsubscribePnrTracking(pnr);
			setActiveTrackings((prev) =>
				prev.filter((item) => item.pnr !== pnr),
			);
			setHubRefreshKey((k) => k + 1);
		} catch (err) {
			console.error("Failed to stop tracking:", err);
		} finally {
			setUnsubscribingPnr(null);
		}
	};

	const fetchSchedule = useCallback(async () => {
		if (!data?.trainNumber) return;
		setScheduleLoading(true);
		setShowScheduleModal(true);
		try {
			const res = await getTrainSchedule(data.trainNumber);
			setScheduleData(res);
		} catch (err: unknown) {
			console.error("Failed to fetch train schedule", err);
		} finally {
			setScheduleLoading(false);
		}
	}, [data]);

	// On-Demand Prediction Trigger
	const handleFetchPrediction = useCallback(async () => {
		if (!data?.pnr) return;
		setPredictionLoading(true);
		setHasPredicted(true);
		try {
			const prediction = await getPnrPrediction(data.pnr);
			if (prediction) {
				setData((prev) => {
					if (!prev || prev.pnr !== data.pnr) return prev;
					const updatedPassengers = prev.passengers.map((pax) => {
						const rPax = prediction.passengerPredictions?.find(
							(rp) => rp.passengerNumber === pax.number,
						);
						return {
							...pax,
							prediction:
								rPax?.probability !== undefined
									? `${Math.round(rPax.probability)}%`
									: pax.prediction,
						};
					});
					return {
						...prev,
						railtcPrediction: prediction,
						passengers: updatedPassengers,
					};
				});
			}
		} catch (err) {
			console.error("Failed to fetch ML prediction:", err);
		} finally {
			setPredictionLoading(false);
		}
	}, [data]);

	const checkPNR = useCallback(
		async (overridePnr?: string | React.MouseEvent | unknown) => {
			const target =
				typeof overridePnr === "string" ? overridePnr : pnrInput;
			const pnr = (target || "").replace(/\D/g, "").trim();
			if (typeof overridePnr === "string") {
				setPnrInput(pnr);
			}

			if (!pnr) {
				setError(t("tools.pnr_checker.enter_pnr"));
				return;
			}

			if (pnr.length !== 10) {
				setError(t("tools.pnr_checker.invalid_pnr"));
				return;
			}

			setLoading(true);
			setPredictionLoading(false);
			setHasPredicted(false);
			setError(null);
			setData(null);

			try {
				// 1. Fetch immediate live PNR ticket and passenger data (~200ms)
				const result = await getPnrStatus(pnr);
				setData(result);
				setLoading(false);

				// Persist rich search query to localStorage and trigger hub refresh
				savePnrToHistory(result);
				setHubRefreshKey((k) => k + 1);

				// If result already had cached prediction attached, mark predicted
				if (result.railtcPrediction) {
					setHasPredicted(true);
				}
			} catch (err: unknown) {
				const axiosErr = err as {
					response?: { data?: { error?: string } };
					message?: string;
				};
				const message =
					axiosErr?.response?.data?.error ||
					axiosErr?.message ||
					t("tools.pnr_checker.api_error");
				setError(message);
				setLoading(false);
			}
		},
		[pnrInput, t],
	);

	useEffect(() => {
		const paramPnr = (searchParams.get("pnr") || "").replace(/\D/g, "");
		if (paramPnr.length === 10 && autoCheckedPnrRef.current !== paramPnr) {
			autoCheckedPnrRef.current = paramPnr;
			setPnrInput(paramPnr);
			checkPNR(paramPnr);
		}
	}, [searchParams, checkPNR]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			checkPNR();
		}
	};

	const handleCheckLiveStatus = useCallback(() => {
		if (!data) return;
		let trainNo = data.trainNumber || "";
		if (!trainNo && data.train) {
			const numMatch = data.train.match(/\b(\d{4,5})\b/);
			if (numMatch) trainNo = numMatch[1];
		}
		if (!trainNo) return;

		const formattedDate = formatTrainDateToYYYYMMDD(
			data.departureDate || data.date,
		);
		navigate(
			`/tools/trains?tab=live&trainNumber=${trainNo}&date=${formattedDate}`,
		);
	}, [data, navigate]);

	return (
		<div className="w-full space-y-6">
			{/* PNR Search Card */}
			<Card className="relative z-30 border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-visible">
				<CardContent className="p-6 space-y-4 overflow-visible">
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label
								htmlFor="pnr"
								className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
							>
								{t("tools.pnr_checker.input_label")}
							</Label>

							{/* Active Alerts Header Pill */}
							{(activeTrackings.length > 0 || user) && (
								<button
									type="button"
									onClick={() => setIsAlertsSheetOpen(true)}
									className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer shadow-2xs"
								>
									<span className="relative flex h-2 w-2">
										{activeTrackings.length > 0 && (
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
										)}
										<span
											className={`relative inline-flex rounded-full h-2 w-2 ${
												activeTrackings.length > 0
													? "bg-emerald-500"
													: "bg-muted-foreground/50"
											}`}
										/>
									</span>
									<Bell className="h-3 w-3" />
									<span>
										{t(
											"tools.pnr_checker.hub.tab_alerts",
											"Active Alerts",
										)}
									</span>
									{activeTrackings.length > 0 && (
										<Badge
											variant="secondary"
											className="h-4 px-1 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
										>
											{activeTrackings.length}
										</Badge>
									)}
								</button>
							)}
						</div>

						<div className="flex gap-2 sm:gap-3">
							<div
								className="relative flex-1"
								ref={inputContainerRef}
							>
								<Input
									id="pnr"
									type="text"
									placeholder={t(
										"tools.pnr_checker.placeholder",
									)}
									value={pnrInput}
									onFocus={() => {
										if (!pnrInput.trim()) {
											setShowRecentSuggestions(true);
										}
									}}
									onChange={(e) => {
										const val = e.target.value
											.replace(/\D/g, "")
											.slice(0, 10);
										setPnrInput(val);
										if (error) setError(null);
										if (!val.trim()) {
											setShowRecentSuggestions(true);
										} else {
											setShowRecentSuggestions(false);
										}
									}}
									onKeyDown={handleKeyDown}
									maxLength={10}
									className="h-11 pl-10 font-mono tracking-widest text-base bg-background/50 border-border/60 focus:border-primary transition-all"
								/>
								<Train className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/60" />

								{/* Dropdown showing recent searches below input when box is empty */}
								<PnrSearchSuggestions
									isOpen={
										showRecentSuggestions &&
										!pnrInput.trim()
									}
									onClose={() =>
										setShowRecentSuggestions(false)
									}
									onSelectPnr={(selectedPnr) => {
										setShowRecentSuggestions(false);
										checkPNR(selectedPnr);
									}}
									currentPnr={data?.pnr}
									refreshTrigger={hubRefreshKey}
								/>
							</div>
							<Button
								onClick={() => checkPNR()}
								disabled={loading}
								className="h-11 px-6 font-semibold shadow-md gap-2 cursor-pointer"
							>
								{loading ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>
											{t("tools.pnr_checker.submit")}
										</span>
									</>
								) : (
									<>
										<Search className="h-4 w-4" />
										<span>
											{t("tools.pnr_checker.submit")}
										</span>
									</>
								)}
							</Button>
						</div>
					</div>

					{error && (
						<div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
							{error}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Large Loading State Below Search Card */}
			{loading && (
				<div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md shadow-sm animate-in fade-in-50 duration-300">
					<GifLoader
						size="lg"
						label={t("tools.pnr_checker.checking_status")}
					/>
				</div>
			)}

			{/* Results View */}
			{!loading && data && (
				<div className="space-y-6 animate-in fade-in-50 duration-300">
					<PnrResultCard
						data={data}
						onViewRoute={fetchSchedule}
						onCheckLiveStatus={handleCheckLiveStatus}
						predictionLoading={predictionLoading}
						onPredict={handleFetchPrediction}
						hasPredicted={hasPredicted}
					/>
				</div>
			)}

			{/* Active Alerts Slide-Over Sheet Drawer */}
			<PnrAlertsSheet
				isOpen={isAlertsSheetOpen}
				onClose={() => setIsAlertsSheetOpen(false)}
				trackings={activeTrackings}
				loading={trackingsLoading}
				onSelectPnr={(selectedPnr) => {
					checkPNR(selectedPnr);
				}}
				onStopTracking={handleStopTracking}
				unsubscribingPnr={unsubscribingPnr}
				currentPnr={data?.pnr}
			/>

			{/* Train Route Schedule Modal */}
			<TrainRouteScheduleModal
				isOpen={showScheduleModal}
				onClose={() => setShowScheduleModal(false)}
				trainTitle={data?.train}
				from={data?.from}
				to={data?.to}
				fromCode={data?.fromCode}
				toCode={data?.toCode}
				loading={scheduleLoading}
				scheduleData={scheduleData}
			/>
		</div>
	);
};
