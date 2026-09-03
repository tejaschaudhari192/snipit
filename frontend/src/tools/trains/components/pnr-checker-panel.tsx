import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Train, Search, Clock, FileCheck2 } from "lucide-react";
import { GifLoader } from "@/components/common/gif-loader";

import { getPnrStatus, getTrainSchedule } from "../api/trains";
import type {
	PnrData,
	TrainScheduleResponse,
	ScheduleStation,
} from "../types/trains";

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

	const getStatusVariant = (
		status: string,
	): "default" | "secondary" | "destructive" | "outline" => {
		const s = status.toLowerCase();
		if (s.includes("confirm") || s.includes("cnf")) return "default";
		if (s.includes("rac")) return "secondary";
		if (s.includes("wl") || s.includes("wait")) return "destructive";
		return "outline";
	};

	const formatJourneyDate = (dateStr: string) => {
		if (!dateStr) return "";
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString(undefined, {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<div className="w-full space-y-6">
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
								className="h-11 px-6 font-semibold shadow-md gap-2"
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

			{data && (
				<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
					<CardContent className="p-6 space-y-5">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<Train className="h-5 w-5 text-primary shrink-0" />
									<h2 className="text-xl font-bold text-foreground">
										{data.train}
									</h2>
								</div>
								<div className="flex flex-wrap items-center gap-2 ml-7">
									<Badge
										variant="secondary"
										className="text-xs"
									>
										{data.class}
									</Badge>
									<Badge
										variant="outline"
										className="text-xs font-mono"
									>
										PNR: {data.pnr}
									</Badge>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{formatJourneyDate(data.date)}
									</Badge>
								</div>
							</div>

							<div className="flex items-center gap-2 self-start sm:self-center ml-7 sm:ml-0">
								{data.chartStatus && (
									<div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg">
										<FileCheck2 className="h-4 w-4 text-primary" />
										<span>{data.chartStatus}</span>
									</div>
								)}
								<Button
									variant="outline"
									size="sm"
									className="text-xs h-8 gap-1.5"
									onClick={fetchSchedule}
								>
									<Train className="h-3.5 w-3.5 text-primary" />
									<span>Train Route</span>
								</Button>
							</div>
						</div>

						<Separator />

						<div className="flex justify-between items-center gap-4">
							<div className="flex-1 text-left">
								<div className="text-xl font-black tracking-tight text-foreground">
									{data.from || "Source"}
								</div>
								<div className="flex flex-col text-xs text-muted-foreground mt-0.5 space-y-0.5">
									{data.departureDate && (
										<span className="font-semibold text-foreground/90">
											{formatJourneyDate(
												data.departureDate,
											)}
										</span>
									)}
									<div className="flex items-center gap-1">
										<Clock className="h-3 w-3 text-primary shrink-0" />
										<span>{data.departure || "--:--"}</span>
									</div>
								</div>
							</div>

							<div className="flex flex-col items-center justify-center px-2 shrink-0">
								<span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/40">
									{data.duration || "Route"}
								</span>
								<div className="w-16 h-px bg-border/80 my-1 relative">
									<div className="absolute right-0 -top-0.75 border-y-4 border-y-transparent border-l-[6px] border-l-border/80" />
								</div>
							</div>

							<div className="flex-1 text-right">
								<div className="text-xl font-black tracking-tight text-foreground">
									{data.to || "Destination"}
								</div>
								<div className="flex flex-col items-end text-xs text-muted-foreground mt-0.5 space-y-0.5">
									{data.arrivalDate && (
										<span className="font-semibold text-foreground/90">
											{formatJourneyDate(
												data.arrivalDate,
											)}
										</span>
									)}
									<div className="flex items-center justify-end gap-1">
										<Clock className="h-3 w-3 text-primary shrink-0" />
										<span>{data.arrival || "--:--"}</span>
									</div>
								</div>
							</div>
						</div>

						<Separator />

						<div className="space-y-3">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								{t("tools.pnr_checker.passengers_header")}
							</h3>

							{data.passengers && data.passengers.length > 0 ? (
								<div className="divide-y divide-border/40">
									{data.passengers.map((passenger) => (
										<div
											key={`pax-${passenger.number}`}
											className="flex justify-between items-center py-2.5"
										>
											<div className="flex flex-col">
												<span className="text-sm font-medium text-foreground">
													{passenger.name ||
														t(
															"tools.pnr_checker.passenger",
															{
																number: passenger.number,
															},
														)}
												</span>
												{passenger.bookingStatus && (
													<span className="text-xs text-muted-foreground">
														Booking:{" "}
														{
															passenger.bookingStatus
														}
													</span>
												)}
											</div>
											<Badge
												variant={getStatusVariant(
													passenger.status,
												)}
												className="text-xs font-semibold px-2.5 py-1"
											>
												{passenger.status}
											</Badge>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground italic">
									{t("tools.pnr_checker.no_status")}
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{showScheduleModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
					<Card className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-background border-border shadow-2xl overflow-hidden">
						<div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
							<div className="flex items-center gap-2">
								<Train className="h-5 w-5 text-primary" />
								<div>
									<h3 className="font-bold text-base text-foreground">
										{data?.train || "Train Schedule"}
									</h3>
									<p className="text-xs text-muted-foreground">
										{data?.from} → {data?.to}
									</p>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 rounded-full"
								onClick={() => setShowScheduleModal(false)}
							>
								✕
							</Button>
						</div>

						<CardContent className="p-4 overflow-y-auto space-y-3 flex-1">
							{scheduleLoading ? (
								<div className="py-12 flex flex-col items-center justify-center space-y-3">
									<GifLoader />
									<p className="text-xs text-muted-foreground animate-pulse">
										Fetching train schedule...
									</p>
								</div>
							) : scheduleData?.stations &&
							  scheduleData.stations.length > 0 ? (
								<div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
									{scheduleData.stations.map(
										(stn: ScheduleStation, idx: number) => {
											const isHighlight =
												stn.stationCode ===
													data?.fromCode ||
												stn.stationCode ===
													data?.toCode;

											return (
												<div
													key={stn.stationCode || idx}
													className={`relative flex items-center justify-between text-xs p-2.5 rounded-lg border transition-colors ${
														isHighlight
															? "bg-primary/10 border-primary/40 font-semibold"
															: "bg-muted/20 border-border/40 hover:bg-muted/40"
													}`}
												>
													<div className="absolute -left-[21px] w-3 h-3 rounded-full border-2 border-background bg-primary" />
													<div>
														<div className="font-bold text-sm text-foreground">
															{stn.stationName}{" "}
															{stn.stationCode && (
																<span className="text-muted-foreground font-mono text-xs">
																	(
																	{
																		stn.stationCode
																	}
																	)
																</span>
															)}
														</div>
														<div className="text-muted-foreground text-[11px] mt-0.5">
															Day {stn.dayCount} •
															Distance:{" "}
															{stn.distance} km
														</div>
													</div>
													<div className="text-right space-y-0.5 font-mono">
														<div>
															Arr:{" "}
															<span className="font-bold">
																{
																	stn.arrivalTime
																}
															</span>
														</div>
														<div>
															Dep:{" "}
															<span className="font-bold">
																{
																	stn.departureTime
																}
															</span>
														</div>
													</div>
												</div>
											);
										},
									)}
								</div>
							) : (
								<div className="py-8 text-center text-xs text-muted-foreground">
									No schedule information available.
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};
