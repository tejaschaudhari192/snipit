import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Train, Search } from "lucide-react";
import { GifLoader } from "@/components/common/gif-loader";

import { getTrainSchedule, searchTrains } from "../api/trains";
import type { TrainScheduleResponse, TrainSearchResult } from "../types/trains";
import { TrainSearchSuggestions } from "./train-search-suggestions";
import { ScheduleTimetableTable } from "./schedule-timetable-table";

export const TrainSchedulePanel: React.FC = () => {
	const { t } = useTranslation();
	const [trainInput, setTrainInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [scheduleData, setScheduleData] =
		useState<TrainScheduleResponse | null>(null);

	const [suggestions, setSuggestions] = useState<TrainSearchResult[]>([]);
	const [suggestionsLoading, setSuggestionsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

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

	const selectTrain = (train: TrainSearchResult) => {
		const trainNo = train.trainNumber;
		setTrainInput(`${train.trainName} (${trainNo})`);
		setShowSuggestions(false);
		setLoading(true);
		setError(null);
		setScheduleData(null);

		getTrainSchedule(trainNo)
			.then((res) => setScheduleData(res))
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
								className="h-11 px-6 font-semibold shadow-md gap-2"
							>
								{loading ? (
									<GifLoader />
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
					</div>

					{error && (
						<div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
							{error}
						</div>
					)}
				</CardContent>
			</Card>

			{scheduleData && scheduleData.stations && (
				<ScheduleTimetableTable scheduleData={scheduleData} />
			)}
		</div>
	);
};
