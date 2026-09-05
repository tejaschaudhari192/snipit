import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Train, Search, Loader2 } from "lucide-react";
import { GifLoader } from "@/components/common/gif-loader";

import {
	getPnrStatus,
	getPnrPrediction,
	getTrainSchedule,
} from "../api/trains";
import type { PnrData, TrainScheduleResponse } from "../types/trains";
import { PnrTrackerCard } from "./pnr-tracker-card";
import { PnrResultCard } from "./pnr-result-card";
import { TrainRouteScheduleModal } from "./train-route-schedule-modal";

export const PnrCheckerPanel: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const initialPnr = searchParams.get("pnr") || "";
	const [pnrInput, setPnrInput] = useState(initialPnr);
	const [loading, setLoading] = useState(false);
	const [predictionLoading, setPredictionLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<PnrData | null>(null);
	const [scheduleLoading, setScheduleLoading] = useState(false);
	const [scheduleData, setScheduleData] =
		useState<TrainScheduleResponse | null>(null);
	const [showScheduleModal, setShowScheduleModal] = useState(false);

	const fetchSchedule = useCallback(async () => {
		if (!data?.trainNumber) return;
		setScheduleLoading(true);
		setShowScheduleModal(true);
		try {
			const res = await getTrainSchedule(
				data.trainNumber,
				data.departureDate || data.date,
				data.fromCode || "",
			);
			setScheduleData(res);
		} catch (err: unknown) {
			console.error("Failed to fetch train schedule", err);
		} finally {
			setScheduleLoading(false);
		}
	}, [data]);

	const checkPNR = useCallback(async () => {
		const pnr = pnrInput.trim();
		if (!pnr) {
			setError(t("tools.pnr_checker.enter_pnr"));
			return;
		}

		if (!/^\d{10}$/.test(pnr)) {
			setError(t("tools.pnr_checker.invalid_pnr"));
			return;
		}

		setLoading(true);
		setPredictionLoading(false);
		setError(null);
		setData(null);

		try {
			// 1. Fetch immediate live PNR ticket and passenger data (~200ms)
			const result = await getPnrStatus(pnr);
			setData(result);
			setLoading(false);

			// Check if all passengers are already confirmed
			const isAllConfirmed =
				result.passengers &&
				result.passengers.length > 0 &&
				result.passengers.every((p) => {
					const s = (p.status || "").toLowerCase();
					return (
						s.includes("cnf") ||
						s.includes("confirm") ||
						Boolean(p.coach && p.berth)
					);
				});

			// 2. Fetch RailTC ML prediction asynchronously in background if not already confirmed
			if (!isAllConfirmed && !result.railtcPrediction) {
				setPredictionLoading(true);
				getPnrPrediction(pnr)
					.then((prediction) => {
						if (prediction) {
							setData((prev) => {
								if (!prev || prev.pnr !== result.pnr)
									return prev;
								const updatedPassengers = prev.passengers.map(
									(pax) => {
										const rPax =
											prediction.passengerPredictions?.find(
												(rp) =>
													rp.passengerNumber ===
													pax.number,
											);
										return {
											...pax,
											prediction:
												rPax?.probability !== undefined
													? `${Math.round(rPax.probability)}%`
													: pax.prediction,
										};
									},
								);
								return {
									...prev,
									railtcPrediction: prediction,
									passengers: updatedPassengers,
								};
							});
						}
					})
					.catch((err) => {
						console.error("Failed to fetch ML prediction:", err);
					})
					.finally(() => {
						setPredictionLoading(false);
					});
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
	}, [pnrInput, t]);

	useEffect(() => {
		const paramPnr = searchParams.get("pnr");
		if (paramPnr && /^\d{10}$/.test(paramPnr)) {
			setPnrInput(paramPnr);
			// Auto check if input matches param
			const timer = setTimeout(() => {
				checkPNR();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [searchParams, checkPNR]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			checkPNR();
		}
	};

	return (
		<div className="w-full space-y-6">
			{/* PNR Search Card */}
			<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden">
				<CardContent className="p-6 space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor="pnr"
							className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
						>
							{t("tools.pnr_checker.input_label")}
						</Label>
						<div className="flex gap-2 sm:gap-3">
							<div className="relative flex-1">
								<Input
									id="pnr"
									type="text"
									placeholder={t(
										"tools.pnr_checker.placeholder",
									)}
									value={pnrInput}
									onChange={(e) =>
										setPnrInput(e.target.value)
									}
									onKeyDown={handleKeyDown}
									maxLength={10}
									className="h-11 pl-10 font-mono tracking-widest text-base bg-background/50 border-border/60 focus:border-primary transition-all"
								/>
								<Train className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/60" />
							</div>
							<Button
								onClick={checkPNR}
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
					<PnrTrackerCard pnr={data.pnr} />
					<PnrResultCard
						data={data}
						onViewRoute={fetchSchedule}
						predictionLoading={predictionLoading}
					/>
				</div>
			)}

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
