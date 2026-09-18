import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Train, Search, History, Loader2 } from "lucide-react";
import { GifLoader } from "@/components/common/gif-loader";

import { getTrainSchedule, searchTrains } from "../api/trains";
import type { TrainScheduleResponse, TrainSearchResult } from "../types/trains";
import { TrainSearchSuggestions } from "./train-search-suggestions";
import { ScheduleTimetableTable } from "./schedule-timetable-table";
import {
	loadTrainSearchHistory,
	saveTrainSearchToHistory,
	type TrainSearchHistoryItem,
} from "../utils/trains-storage";

export const TrainSchedulePanel: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [trainInput, setTrainInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [scheduleData, setScheduleData] =
		useState<TrainScheduleResponse | null>(null);
	const [trainHistory, setTrainHistory] = useState<TrainSearchHistoryItem[]>(
		[],
	);
	const autoLoadedRef = useRef<string | null>(null);

	const [suggestions, setSuggestions] = useState<TrainSearchResult[]>([]);
	const [suggestionsLoading, setSuggestionsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setTrainHistory(loadTrainSearchHistory());
	}, []);

	useEffect(() => {
		const query = trainInput.trim();
		if (query.length < 2) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		const timer = setTimeout(async () => {
			setSuggestionsLoading(true);
			try {
				const results = await searchTrains(query);
				setSuggestions(results);
				setShowSuggestions(results.length > 0);
			} catch {
				setSuggestions([]);
			} finally {
				setSuggestionsLoading(false);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [trainInput]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setShowSuggestions(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleQuickSelectTrain = useCallback(
		async (trainNo: string) => {
			setTrainInput(trainNo);
			setShowSuggestions(false);
			setLoading(true);
			setError(null);
			setScheduleData(null);

			try {
				const res = await getTrainSchedule(trainNo);
				setScheduleData(res);
				setTrainInput(`${res.trainName} (${res.trainNumber})`);
				saveTrainSearchToHistory(
					res.trainNumber,
					res.trainName,
					res.origin,
					res.destination,
				);
				setTrainHistory(loadTrainSearchHistory());
			} catch (err: unknown) {
				const axiosErr = err as {
					response?: { data?: { error?: string } };
					message?: string;
				};
				setError(
					axiosErr?.response?.data?.error ||
						axiosErr?.message ||
						t("tools.pnr_checker.api_error"),
				);
			} finally {
				setLoading(false);
			}
		},
		[t],
	);

	// Auto load from searchParams
	useEffect(() => {
		const paramTrain =
			searchParams.get("trainNumber") || searchParams.get("train");
		if (paramTrain && autoLoadedRef.current !== paramTrain) {
			autoLoadedRef.current = paramTrain;
			handleQuickSelectTrain(paramTrain);
		}
	}, [searchParams, handleQuickSelectTrain]);

	const selectTrain = (train: TrainSearchResult) => {
		const trainNo = train.trainNumber;
		setTrainInput(`${train.trainName} (${trainNo})`);
		setShowSuggestions(false);
		setLoading(true);
		setError(null);
		setScheduleData(null);

		getTrainSchedule(trainNo)
			.then((res) => {
				setScheduleData(res);
				saveTrainSearchToHistory(
					res.trainNumber,
					res.trainName,
					res.origin,
					res.destination,
				);
				setTrainHistory(loadTrainSearchHistory());
			})
			.catch((err: unknown) => {
				const axiosErr = err as {
					response?: { data?: { error?: string } };
					message?: string;
				};
				const message =
					axiosErr?.response?.data?.error ||
					axiosErr?.message ||
					t("tools.pnr_checker.api_error");
				setError(message);
			})
			.finally(() => setLoading(false));
	};

	const fetchSchedule = useCallback(async () => {
		const query = trainInput.trim();
		if (!query) {
			setError(t("tools.pnr_checker.schedule_error_empty"));
			return;
		}

		setShowSuggestions(false);
		setLoading(true);
		setError(null);
		setScheduleData(null);

		try {
			const res = await getTrainSchedule(query);
			setScheduleData(res);
			saveTrainSearchToHistory(
				res.trainNumber,
				res.trainName,
				res.origin,
				res.destination,
			);
			setTrainHistory(loadTrainSearchHistory());
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
	}, [trainInput, t]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			fetchSchedule();
		}
	};

	return (
		<div className="w-full space-y-6">
			<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-visible">
				<CardContent className="p-6 space-y-4">
					<div className="space-y-2 relative" ref={containerRef}>
						<Label
							htmlFor="trainNumber"
							className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
						>
							{t("tools.pnr_checker.schedule_input_label")}
						</Label>
						<div className="flex gap-2 sm:gap-3">
							<div className="relative flex-1">
								<Input
									id="trainNumber"
									type="text"
									placeholder={t(
										"tools.pnr_checker.schedule_placeholder",
									)}
									value={trainInput}
									onChange={(e) =>
										setTrainInput(e.target.value)
									}
									onFocus={() => {
										if (suggestions.length > 0)
											setShowSuggestions(true);
									}}
									onKeyDown={handleKeyDown}
									className="h-11 pl-10 text-base bg-background/50 border-border/60 focus:border-primary transition-all"
								/>
								<Train className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/60" />
							</div>
							<Button
								onClick={fetchSchedule}
								disabled={loading}
								className="h-11 px-6 font-semibold shadow-md gap-2 cursor-pointer"
							>
								{loading ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>
											{t(
												"tools.pnr_checker.searching_trains",
											)}
										</span>
									</>
								) : (
									<>
										<Search className="h-4 w-4" />
										<span>
											{t(
												"tools.pnr_checker.schedule_search",
											)}
										</span>
									</>
								)}
							</Button>
						</div>

						{/* Live Search Suggestions Dropdown */}
						{showSuggestions && (
							<TrainSearchSuggestions
								suggestions={suggestions}
								loading={suggestionsLoading}
								onSelect={selectTrain}
							/>
						)}

						{/* Recent Train Searches Chips */}
						{trainHistory.length > 0 && (
							<div className="flex items-center gap-1.5 flex-wrap pt-1">
								<span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
									<History className="h-3 w-3" /> Recent:
								</span>
								{trainHistory.slice(0, 5).map((tItem) => (
									<button
										key={tItem.trainNumber}
										type="button"
										onClick={() =>
											handleQuickSelectTrain(
												tItem.trainNumber,
											)
										}
										className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted border border-border/60 hover:border-primary/50 text-foreground transition-all cursor-pointer"
									>
										{tItem.trainNumber}{" "}
										{tItem.trainName
											? `(${tItem.trainName.slice(0, 14)})`
											: ""}
									</button>
								))}
							</div>
						)}
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
						label={t("tools.pnr_checker.searching_trains")}
					/>
				</div>
			)}

			{!loading && scheduleData && scheduleData.stations && (
				<ScheduleTimetableTable
					scheduleData={scheduleData}
					onTrackLive={() =>
						navigate(
							`/tools/trains?tab=live&trainNumber=${scheduleData.trainNumber}`,
						)
					}
				/>
			)}
		</div>
	);
};
