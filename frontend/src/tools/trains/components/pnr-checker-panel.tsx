import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Train, Search } from "lucide-react";
import { GifLoader } from "@/components/common/gif-loader";

import { getPnrStatus, getTrainSchedule } from "../api/trains";
import type { PnrData, TrainScheduleResponse } from "../types/trains";
import { PnrTrackerCard } from "./pnr-tracker-card";
import { PnrResultCard } from "./pnr-result-card";
import { TrainRouteScheduleModal } from "./train-route-schedule-modal";

export const PnrCheckerPanel: React.FC = () => {
	const { t } = useTranslation();
	const [pnrInput, setPnrInput] = useState("");
	const [loading, setLoading] = useState(false);
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
		setError(null);
		setData(null);

		try {
			const result = await getPnrStatus(pnr);
			setData(result);
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
		} finally {
			setLoading(false);
		}
	}, [pnrInput, t]);

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
									<GifLoader />
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

			{/* Results View */}
			{data && (
				<div className="space-y-6 animate-in fade-in-50 duration-300">
					<PnrTrackerCard pnr={data.pnr} />
					<PnrResultCard data={data} onViewRoute={fetchSchedule} />
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
