import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Train,
	Calendar,
	MapPin,
	Activity,
	Radio,
	Clock,
	RotateCcw,
} from "lucide-react";
import { GifLoader } from "@/components/common/gif-loader";

import {
	searchTrains,
	getTrainLiveStatus,
	getTrainSchedule,
} from "../api/trains";
import type {
	TrainSearchResult,
	TrainLiveStatusResponse,
	ScheduleStation,
} from "../types/trains";
import { TrainSearchSuggestions } from "./train-search-suggestions";
import { LiveStatusStationRow } from "./live-status-station-row";
import { SlidingTrainRake } from "./sliding-train-rake";
import { useTrainJourneyAnimation } from "../hooks/use-train-journey-animation";
import {
	calculateOriginDepartureDate,
	generateDateOptions,
} from "../utils/train-date-calculations";

export const TrainLiveStatusPanel: React.FC = () => {
	const { t } = useTranslation();

	// Train Search State (Only selectable from suggestions)
	const [trainSearchInput, setTrainSearchInput] = useState("");
	const [selectedTrain, setSelectedTrain] =
		useState<TrainSearchResult | null>(null);
	const [suggestions, setSuggestions] = useState<TrainSearchResult[]>([]);
	const [suggestionsLoading, setSuggestionsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);

	// Stations for searchable selection
	const [availableStations, setAvailableStations] = useState<
		ScheduleStation[]
	>([]);
	const [selectedStationCode, setSelectedStationCode] = useState<string>("");
	const [stationSearchInput, setStationSearchInput] = useState("");
	const [showStationSuggestions, setShowStationSuggestions] = useState(false);
	const stationContainerRef = useRef<HTMLDivElement>(null);

	// Boarding Date Options
	const dateOptions = useMemo(() => generateDateOptions(), []);

	// Default to today
	const [selectedDate, setSelectedDate] = useState<string>(() => {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");
		return `${yyyy}${mm}${dd}`;
	});

	// Result State
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [liveStatus, setLiveStatus] =
		useState<TrainLiveStatusResponse | null>(null);

	const containerRef = useRef<HTMLDivElement>(null);
	const tableContainerRef = useRef<HTMLDivElement>(null);

	// Componentized UX Animation Hook: Smooth bird's-eye train tracking on track
	const { trainPos, animatedStationIdx, isAnimating, replayJourney } =
		useTrainJourneyAnimation({ liveStatus, tableContainerRef });

	// Filter available stations based on search query
	const filteredStations = useMemo(() => {
		const q = stationSearchInput.trim().toLowerCase();
		if (!q) return availableStations;
		return availableStations.filter(
			(stn) =>
				stn.stationCode.toLowerCase().includes(q) ||
				stn.stationName.toLowerCase().includes(q),
		);
	}, [availableStations, stationSearchInput]);

	// Autocomplete listener for train
	useEffect(() => {
		const query = trainSearchInput.trim();
		if (query.length < 2) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		const timer = setTimeout(async () => {
			setSuggestionsLoading(true);
			try {
				const res = await searchTrains(query);
				setSuggestions(res);
				setShowSuggestions(res.length > 0);
			} catch {
				setSuggestions([]);
			} finally {
				setSuggestionsLoading(false);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [trainSearchInput]);

	// Close suggestions on outside click for both train and station
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setShowSuggestions(false);
			}
			if (
				stationContainerRef.current &&
				!stationContainerRef.current.contains(e.target as Node)
			) {
				setShowStationSuggestions(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Select train from suggestions
	const handleSelectTrain = async (train: TrainSearchResult) => {
		setSelectedTrain(train);
		setTrainSearchInput(`${train.trainName} (${train.trainNumber})`);
		setShowSuggestions(false);
		setSelectedStationCode("");
		setStationSearchInput("");
		setError(null);

		// Populate stations from schedule or suggestions
		if (train.schedule && train.schedule.length > 0) {
			setAvailableStations(train.schedule);
		} else {
			try {
				const schedule = await getTrainSchedule(train.trainNumber);
				setAvailableStations(schedule.stations || []);
			} catch {
				setAvailableStations([]);
			}
		}
	};

	// Select station from suggestions
	const handleSelectStation = (stn: ScheduleStation | null) => {
		if (!stn) {
			setSelectedStationCode("");
			setStationSearchInput("");
		} else {
			setSelectedStationCode(stn.stationCode);
			setStationSearchInput(`${stn.stationName} (${stn.stationCode})`);
		}
		setShowStationSuggestions(false);
	};

	// Clear selection if user edits input directly
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTrainSearchInput(e.target.value);
		if (
			selectedTrain &&
			e.target.value !==
				`${selectedTrain.trainName} (${selectedTrain.trainNumber})`
		) {
			setSelectedTrain(null);
			setAvailableStations([]);
			setSelectedStationCode("");
			setStationSearchInput("");
		}
	};

	// Fetch live running status
	const handleCheckStatus = async () => {
		if (!selectedTrain) {
			setError(t("tools.pnr_checker.select_train_suggestion_only"));
			return;
		}

		setLoading(true);
		setError(null);
		setLiveStatus(null);

		try {
			// Find the dayCount of the selected boarding station
			const chosenStation = availableStations.find(
				(s) => s.stationCode === selectedStationCode,
			);
			const queryDepartureDate = calculateOriginDepartureDate(
				selectedDate,
				chosenStation?.dayCount,
			);

			const res = await getTrainLiveStatus(
				selectedTrain.trainNumber,
				queryDepartureDate,
			);
			setLiveStatus(res);
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
	};

	return (
		<div className="w-full space-y-6">
			{/* Input Form Card */}
			<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-visible">
				<CardContent className="p-6 space-y-5">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
						{/* 1. Train Selection (Auto-suggest only) */}
						<div
							className="md:col-span-6 space-y-2 relative"
							ref={containerRef}
						>
							<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
								<Train className="w-3.5 h-3.5 text-primary" />
								<span>
									{t(
										"tools.pnr_checker.schedule_input_label",
									)}
								</span>
								<span className="text-destructive">*</span>
							</Label>
							<div className="relative">
								<Input
									type="text"
									placeholder={t(
										"tools.pnr_checker.schedule_placeholder",
									)}
									value={trainSearchInput}
									onChange={handleInputChange}
									onFocus={() => {
										if (suggestions.length > 0)
											setShowSuggestions(true);
									}}
									className="h-11 pl-10 text-sm bg-background/50 border-border/60 focus:border-primary transition-all"
								/>
								<Train className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/60" />
							</div>

							{showSuggestions && (
								<TrainSearchSuggestions
									suggestions={suggestions}
									loading={suggestionsLoading}
									onSelect={handleSelectTrain}
								/>
							)}
						</div>

						{/* 2. Boarding Date (2 days prior and next date) */}
						<div className="md:col-span-3 space-y-2">
							<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
								<Calendar className="w-3.5 h-3.5 text-primary" />
								<span>
									{t("tools.pnr_checker.boarding_date")}
								</span>
							</Label>
							<select
								value={selectedDate}
								onChange={(e) =>
									setSelectedDate(e.target.value)
								}
								className="w-full h-11 px-3 text-sm rounded-md bg-background/50 border border-border/60 text-foreground focus:outline-hidden focus:border-primary transition-all"
							>
								{dateOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						{/* 3. Station Search Selection (Like Train selection) */}
						<div
							className="md:col-span-3 space-y-2 relative"
							ref={stationContainerRef}
						>
							<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
								<MapPin className="w-3.5 h-3.5 text-primary" />
								<span>
									{t("tools.pnr_checker.boarding_station")}
								</span>
							</Label>
							<div className="relative">
								<Input
									type="text"
									placeholder={t(
										"tools.pnr_checker.station_search_placeholder",
									)}
									value={stationSearchInput}
									disabled={availableStations.length === 0}
									onChange={(e) => {
										setStationSearchInput(e.target.value);
										setSelectedStationCode("");
										setShowStationSuggestions(true);
									}}
									onFocus={() => {
										if (availableStations.length > 0)
											setShowStationSuggestions(true);
									}}
									className="h-11 pl-10 text-sm bg-background/50 border-border/60 focus:border-primary disabled:opacity-50 transition-all"
								/>
								<MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/60" />
							</div>

							{showStationSuggestions &&
								availableStations.length > 0 && (
									<div className="absolute left-0 right-0 top-full mt-2 z-50 bg-background/95 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-border/30 animate-in fade-in-50 duration-200">
										<button
											onClick={() =>
												handleSelectStation(null)
											}
											className="w-full text-left p-3 hover:bg-primary/10 text-xs font-medium text-muted-foreground transition-colors"
										>
											{t(
												"tools.pnr_checker.all_stations",
											)}
										</button>
										{filteredStations.length === 0 ? (
											<div className="p-3 text-xs text-muted-foreground text-center">
												{t(
													"tools.pnr_checker.no_stations_found",
												)}
											</div>
										) : (
											filteredStations.map((stn) => (
												<button
													key={stn.stationCode}
													onClick={() =>
														handleSelectStation(stn)
													}
													className="w-full text-left p-3 hover:bg-primary/10 transition-colors flex items-center justify-between group text-xs"
												>
													<div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
														<Badge
															variant="outline"
															className="font-mono text-[10px] py-0"
														>
															{stn.stationCode}
														</Badge>
														<span className="truncate">
															{stn.stationName}
														</span>
													</div>
													{stn.distance !==
														undefined && (
														<span className="text-[10px] text-muted-foreground font-mono shrink-0">
															{stn.distance} km
														</span>
													)}
												</button>
											))
										)}
									</div>
								)}
						</div>
					</div>

					{/* Action Button */}
					<div className="flex justify-end pt-2 border-t border-border/30">
						<Button
							onClick={handleCheckStatus}
							disabled={loading || !selectedTrain}
							className="h-11 px-6 font-semibold shadow-md gap-2 shrink-0"
						>
							{loading ? (
								<GifLoader />
							) : (
								<>
									<Activity className="h-4 w-4" />
									<span>
										{t(
											"tools.pnr_checker.check_live_status",
										)}
									</span>
								</>
							)}
						</Button>
					</div>

					{error && (
						<div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
							{error}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Live Running Status Result Card */}
			{liveStatus && (
				<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in-50 duration-300">
					{/* Header with Live Status Pulse & Summary */}
					<div className="p-5 border-b border-border/40 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-start gap-3">
							<div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
								<Radio className="h-6 w-6 text-primary animate-pulse" />
							</div>
							<div>
								<div className="flex items-center gap-2 flex-wrap">
									<h2 className="text-lg font-bold text-foreground">
										{liveStatus.trainName ||
											`Train ${liveStatus.trainNumber}`}
									</h2>
									<Badge
										variant="secondary"
										className="font-mono text-xs"
									>
										#{liveStatus.trainNumber}
									</Badge>
									{liveStatus.terminated ? (
										<Badge
											variant="outline"
											className="bg-muted text-muted-foreground text-xs"
										>
											{t(
												"tools.pnr_checker.train_terminated",
											)}
										</Badge>
									) : (
										<Badge
											variant="outline"
											className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs"
										>
											●{" "}
											{t(
												"tools.pnr_checker.train_running",
											)}
										</Badge>
									)}
								</div>

								{liveStatus.trainStatusMessage && (
									<p className="text-sm font-semibold text-primary mt-1 flex items-center gap-1.5">
										<Clock className="h-4 w-4 text-primary" />
										<span>
											{liveStatus.trainStatusMessage}
										</span>
									</p>
								)}

								<div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-1 flex-wrap">
									{liveStatus.currentStation && (
										<span>
											{t(
												"tools.pnr_checker.current_location",
											)}
											:{" "}
											<strong className="text-foreground">
												{liveStatus.currentStation}
											</strong>
										</span>
									)}
									{liveStatus.timeOfAvailability && (
										<span>
											•{" "}
											{t(
												"tools.pnr_checker.last_updated",
												{
													time: liveStatus.timeOfAvailability,
												},
											)}
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Replay Journey button */}
						<Button
							variant="outline"
							size="sm"
							onClick={replayJourney}
							disabled={isAnimating}
							className="shrink-0 gap-1.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all self-start sm:self-center"
						>
							<RotateCcw
								className={`w-3.5 h-3.5 ${isAnimating ? "animate-spin" : ""}`}
							/>
							<span>
								{isAnimating
									? "Tracking Train..."
									: "Replay Journey"}
							</span>
						</Button>
					</div>

					{/* Live Stations Table - 3-Column Split Matching WhereIsMyTrain */}
					<CardContent className="p-0">
						<div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 bg-muted/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
							<div className="col-span-3 text-left">
								{t("tools.pnr_checker.arrival")}
							</div>
							<div className="col-span-6 text-left">
								{t("tools.pnr_checker.station_info")}
							</div>
							<div className="col-span-3 text-right">
								{t("tools.pnr_checker.departure")}
							</div>
						</div>

						<div
							ref={tableContainerRef}
							className="relative divide-y divide-border/20"
						>
							{/* Continuous Top-Down Sliding Train on Railway Track */}
							{trainPos && (
								<SlidingTrainRake
									x={trainPos.x}
									y={trainPos.y}
									visible={true}
								/>
							)}

							{liveStatus.stations.map((stn, idx) => {
								const isFirst = idx === 0;
								const isLast =
									idx === liveStatus.stations.length - 1;
								const prevStn =
									idx > 0
										? liveStatus.stations[idx - 1]
										: null;
								const isNewDay =
									!prevStn ||
									stn.dayCount !== prevStn.dayCount;
								const isCurrentStation =
									liveStatus.currentStation ===
									stn.stationCode;
								const isSelectedStation =
									selectedStationCode === stn.stationCode;
								const isPassedTrack = idx <= animatedStationIdx;

								return (
									<LiveStatusStationRow
										key={stn.stationCode || idx}
										stn={stn}
										idx={idx}
										isFirst={isFirst}
										isLast={isLast}
										isNewDay={isNewDay}
										isCurrentStation={isCurrentStation}
										isSelectedStation={isSelectedStation}
										isPassedTrack={isPassedTrack}
									/>
								);
							})}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
