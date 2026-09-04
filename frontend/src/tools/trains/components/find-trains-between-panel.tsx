import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	Search,
	MapPin,
	Calendar as CalendarIcon,
	ArrowRightLeft,
	Clock,
	IndianRupee,
	Train,
	AlertCircle,
	Receipt,
	X,
	ChevronDown,
	ChevronUp,
	Loader2,
	Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	searchTrainsBetweenStations,
	getTrainFareCalculation,
	searchStations,
} from "../api/trains";
import type {
	SearchTrainsResponse,
	TrainSearchResultItem,
	TrainFareResponse,
	StationSuggestion,
} from "../types/trains";
import { generateDateOptions } from "../utils/train-date-calculations";
import { StationSearchSuggestions } from "./station-search-suggestions";

export const FindTrainsBetweenPanel: React.FC = () => {
	const { t } = useTranslation();

	// Search parameters
	const [source, setSource] = useState("");
	const [destination, setDestination] = useState("");
	const [sourceCode, setSourceCode] = useState("");
	const [destCode, setDestCode] = useState("");
	const dateOptions = useMemo(() => generateDateOptions(), []);

	// Station Autocomplete State
	const [sourceSuggestions, setSourceSuggestions] = useState<
		StationSuggestion[]
	>([]);
	const [destSuggestions, setDestSuggestions] = useState<StationSuggestion[]>(
		[],
	);
	const [sourceLoading, setSourceLoading] = useState(false);
	const [destLoading, setDestLoading] = useState(false);
	const [showSourceDropdown, setShowSourceDropdown] = useState(false);
	const [showDestDropdown, setShowDestDropdown] = useState(false);

	const sourceContainerRef = useRef<HTMLDivElement>(null);
	const destContainerRef = useRef<HTMLDivElement>(null);

	// Helper to extract clean station code from string like "MAS - Chennai" or "MAS"
	const extractCode = (str: string): string => {
		const trimmed = str.trim();
		if (!trimmed) return "";
		if (trimmed.includes(" - ")) {
			return trimmed.split(" - ")[0].trim().toUpperCase();
		}
		const parts = trimmed.split(/\s+/);
		return parts[0].toUpperCase();
	};

	// Debounced station search for source
	useEffect(() => {
		const query = extractCode(source);
		if (!query || query.length < 2) {
			setSourceSuggestions([]);
			return;
		}

		const timer = setTimeout(async () => {
			setSourceLoading(true);
			try {
				const list = await searchStations(query);
				setSourceSuggestions(list);
			} catch {
				setSourceSuggestions([]);
			} finally {
				setSourceLoading(false);
			}
		}, 250);

		return () => clearTimeout(timer);
	}, [source]);

	// Debounced station search for destination
	useEffect(() => {
		const query = extractCode(destination);
		if (!query || query.length < 2) {
			setDestSuggestions([]);
			return;
		}

		const timer = setTimeout(async () => {
			setDestLoading(true);
			try {
				const list = await searchStations(query);
				setDestSuggestions(list);
			} catch {
				setDestSuggestions([]);
			} finally {
				setDestLoading(false);
			}
		}, 250);

		return () => clearTimeout(timer);
	}, [destination]);

	// Click outside listener to close dropdowns
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				sourceContainerRef.current &&
				!sourceContainerRef.current.contains(e.target as Node)
			) {
				setShowSourceDropdown(false);
			}
			if (
				destContainerRef.current &&
				!destContainerRef.current.contains(e.target as Node)
			) {
				setShowDestDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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
	const [searchResult, setSearchResult] =
		useState<SearchTrainsResponse | null>(null);

	// Inline Fare Calculation State
	const [expandedTrainNumber, setExpandedTrainNumber] = useState<
		string | null
	>(null);
	const [selectedClass, setSelectedClass] = useState<string>("SL");
	const [fareLoadingKey, setFareLoadingKey] = useState<string | null>(null);
	const [fareData, setFareData] = useState<TrainFareResponse | null>(null);
	const [fareError, setFareError] = useState<string | null>(null);
	// Cache calculated total fares map: `${trainNumber}-${classCode}` -> number
	const [fareCache, setFareCache] = useState<Record<string, number>>({});

	const handleSwap = () => {
		const tempSource = source;
		const tempCode = sourceCode;
		setSource(destination);
		setSourceCode(destCode);
		setDestination(tempSource);
		setDestCode(tempCode);
	};

	const handleSearch = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const cleanSrc = sourceCode || extractCode(source);
		const cleanDest = destCode || extractCode(destination);
		if (!cleanSrc || !cleanDest) {
			setError("Please enter both source and destination station codes.");
			return;
		}

		setLoading(true);
		setError(null);
		setExpandedTrainNumber(null);
		setFareData(null);
		setFareCache({});
		try {
			const res = await searchTrainsBetweenStations(
				cleanSrc,
				cleanDest,
				selectedDate,
			);
			setSearchResult(res);

			// 1. Populate cache with known fares from search result availability
			const initialCache: Record<string, number> = {};
			const pendingItems: Array<{
				trainNumber: string;
				classCode: string;
			}> = [];

			for (const train of res.trains || []) {
				const availMap = new Map<string, number>();
				for (const av of train.availability || []) {
					if (av.code && typeof av.fare === "number") {
						const code = av.code.toUpperCase().trim();
						availMap.set(code, av.fare);
						initialCache[`${train.trainNumber}-${code}`] = av.fare;
					}
				}

				// Find classes missing fares that need lazy-loading
				const allClasses = Array.from(
					new Set([
						...Array.from(availMap.keys()),
						...(train.classes || []).map((c) =>
							c.toUpperCase().trim(),
						),
					]),
				);

				for (const cls of allClasses) {
					if (!availMap.has(cls)) {
						pendingItems.push({
							trainNumber: train.trainNumber,
							classCode: cls,
						});
					}
				}
			}
			setFareCache(initialCache);

			// 2. Fetch missing fares asynchronously in parallel
			if (pendingItems.length > 0) {
				Promise.allSettled(
					pendingItems.map(async ({ trainNumber, classCode }) => {
						try {
							const fareRes = await getTrainFareCalculation(
								trainNumber,
								cleanSrc,
								cleanDest,
								classCode,
								selectedDate,
							);
							if (
								fareRes &&
								typeof fareRes.totalFare === "number"
							) {
								setFareCache((prev) => ({
									...prev,
									[`${trainNumber}-${classCode}`]:
										fareRes.totalFare,
								}));
							}
						} catch {
							// Ignore individual fare calculation failures
						}
					}),
				);
			}
		} catch (err: unknown) {
			const axiosErr = err as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			setError(
				axiosErr?.response?.data?.error ||
					axiosErr?.message ||
					"Failed to search trains. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClassClick = async (
		trainNumber: string,
		classCode: string,
		e: React.MouseEvent,
	) => {
		e.stopPropagation();
		setSelectedClass(classCode);
		const cleanSrc = sourceCode || extractCode(source);
		const cleanDest = destCode || extractCode(destination);

		// If this train is already expanded with this class, collapse it
		if (
			expandedTrainNumber === trainNumber &&
			selectedClass === classCode
		) {
			setExpandedTrainNumber(null);
			return;
		}

		setExpandedTrainNumber(trainNumber);
		setFareLoadingKey(`${trainNumber}-${classCode}`);
		setFareError(null);

		try {
			const res = await getTrainFareCalculation(
				trainNumber,
				cleanSrc,
				cleanDest,
				classCode,
				selectedDate,
			);
			setFareData(res);
			if (res && typeof res.totalFare === "number") {
				setFareCache((prev) => ({
					...prev,
					[`${trainNumber}-${classCode}`]: res.totalFare,
				}));
			}
		} catch (err: unknown) {
			const axiosErr = err as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			setFareError(
				axiosErr?.response?.data?.error ||
					axiosErr?.message ||
					t("tools.pnr_checker.failed_calculate_fare"),
			);
		} finally {
			setFareLoadingKey(null);
		}
	};

	const formatIsoDate = (isoString?: string) => {
		if (!isoString) return "";
		try {
			const date = new Date(isoString);
			if (isNaN(date.getTime())) return "";
			return date.toLocaleDateString(undefined, {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
			});
		} catch {
			return "";
		}
	};

	const formatIsoTime = (isoString?: string) => {
		if (!isoString) return "--:--";
		try {
			const date = new Date(isoString);
			if (isNaN(date.getTime())) return isoString;
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			});
		} catch {
			return isoString;
		}
	};

	return (
		<div className="w-full space-y-6">
			{/* Search Card */}
			<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden">
				<CardHeader className="pb-3 border-b border-border/40">
					<CardTitle className="text-base font-bold flex items-center gap-2">
						<Search className="w-4 h-4 text-primary" />
						<span>{t("tools.pnr_checker.find_trains_title")}</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<form onSubmit={handleSearch} className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
							{/* Source Station */}
							<div
								ref={sourceContainerRef}
								className="sm:col-span-5 relative"
							>
								<label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
									{t("tools.pnr_checker.from_station")}
								</label>
								<div className="relative">
									<MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
									<Input
										value={source}
										onChange={(e) => {
											setSource(e.target.value);
											setSourceCode("");
											setShowSourceDropdown(true);
										}}
										onFocus={() =>
											setShowSourceDropdown(true)
										}
										placeholder="Station code or name (e.g. MAS, Chennai)"
										className="pl-9 text-sm font-semibold"
									/>
								</div>
								{showSourceDropdown && (
									<StationSearchSuggestions
										suggestions={sourceSuggestions}
										loading={sourceLoading}
										onSelect={(stn) => {
											setSource(
												`${stn.code} - ${stn.name}`,
											);
											setSourceCode(stn.code);
											setShowSourceDropdown(false);
										}}
									/>
								)}
							</div>

							{/* Swap Button */}
							<div className="sm:col-span-2 flex items-end justify-center pb-0.5">
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={handleSwap}
									className="rounded-full shrink-0 hover:bg-primary/10 hover:text-primary transition-all"
									title="Swap Stations"
								>
									<ArrowRightLeft className="w-4 h-4" />
								</Button>
							</div>

							{/* Destination Station */}
							<div
								ref={destContainerRef}
								className="sm:col-span-5 relative"
							>
								<label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
									{t("tools.pnr_checker.to_station")}
								</label>
								<div className="relative">
									<MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
									<Input
										value={destination}
										onChange={(e) => {
											setDestination(e.target.value);
											setDestCode("");
											setShowDestDropdown(true);
										}}
										onFocus={() =>
											setShowDestDropdown(true)
										}
										placeholder="Station code or name (e.g. BSL, Bhusaval)"
										className="pl-9 text-sm font-semibold"
									/>
								</div>
								{showDestDropdown && (
									<StationSearchSuggestions
										suggestions={destSuggestions}
										loading={destLoading}
										onSelect={(stn) => {
											setDestination(
												`${stn.code} - ${stn.name}`,
											);
											setDestCode(stn.code);
											setShowDestDropdown(false);
										}}
									/>
								)}
							</div>
						</div>

						{/* Date Selection & Submit */}
						<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
							<div className="sm:col-span-8">
								<label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
									{t("tools.pnr_checker.departure_date")}
								</label>
								<div className="relative">
									<CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
									<select
										value={selectedDate}
										onChange={(e) =>
											setSelectedDate(e.target.value)
										}
										className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-3 text-xs font-semibold text-foreground shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
									>
										{dateOptions.map((opt) => (
											<option
												key={opt.value}
												value={opt.value}
											>
												{opt.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="sm:col-span-4">
								<Button
									type="submit"
									disabled={loading}
									className="w-full font-bold gap-2 text-xs"
								>
									{loading ? (
										<span>
											{t(
												"tools.pnr_checker.searching_trains",
											)}
										</span>
									) : (
										<>
											<Search className="w-3.5 h-3.5" />
											<span>
												{t(
													"tools.pnr_checker.find_trains",
												)}
											</span>
										</>
									)}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Error Alert */}
			{error && (
				<div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2">
					<AlertCircle className="w-4 h-4 shrink-0" />
					<span>{error}</span>
				</div>
			)}

			{/* Loading State: Skeleton Cards */}
			{loading && (
				<div className="space-y-4 animate-in fade-in duration-300">
					<div className="flex items-center justify-between px-1">
						<Skeleton className="h-5 w-48" />
						<Skeleton className="h-4 w-32" />
					</div>
					{[1, 2, 3].map((n) => (
						<Card
							key={n}
							className="border-border/60 p-4 space-y-4"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Skeleton className="w-8 h-8 rounded-lg" />
									<div className="space-y-1.5">
										<Skeleton className="h-4 w-44" />
										<Skeleton className="h-3 w-28" />
									</div>
								</div>
								<Skeleton className="h-5 w-20" />
							</div>
							<div className="grid grid-cols-12 gap-2 py-2">
								<div className="col-span-4 space-y-1">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-3 w-24" />
								</div>
								<div className="col-span-4 flex flex-col items-center gap-1">
									<Skeleton className="h-3 w-12" />
									<Skeleton className="h-1 w-full" />
								</div>
								<div className="col-span-4 flex flex-col items-end space-y-1">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40">
								{[1, 2, 3, 4].map((c) => (
									<Skeleton
										key={c}
										className="h-14 rounded-lg"
									/>
								))}
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Search Results */}
			{!loading && searchResult && (
				<div className="space-y-4">
					<div className="flex items-center justify-between px-1">
						<div>
							<h3 className="text-base font-bold text-foreground">
								{t("tools.pnr_checker.available_trains", {
									count: searchResult.trains.length,
								})}
							</h3>
							<p className="text-xs text-muted-foreground">
								{searchResult.sourceName || searchResult.source}{" "}
								→{" "}
								{searchResult.destinationName ||
									searchResult.destination}
							</p>
						</div>
					</div>

					{searchResult.trains.length === 0 ? (
						<Card className="p-8 text-center text-xs text-muted-foreground">
							{t("tools.pnr_checker.no_trains_found")}
						</Card>
					) : (
						<div className="space-y-3">
							{searchResult.trains.map(
								(tr: TrainSearchResultItem, idx: number) => {
									// Build merged list of all classes, combining availability data where available
									const availMap = new Map<
										string,
										NonNullable<
											TrainSearchResultItem["availability"]
										>[number]
									>();
									for (const av of tr.availability || []) {
										const code = (av.code || "")
											.toUpperCase()
											.trim();
										if (code && !availMap.has(code)) {
											availMap.set(code, av);
										}
									}

									// Combine classes from availability and tr.classes
									const allClassCodes = Array.from(
										new Set([
											...Array.from(availMap.keys()),
											...(tr.classes || []).map((c) =>
												c.toUpperCase().trim(),
											),
										]),
									).filter(Boolean);

									const isExpanded =
										expandedTrainNumber === tr.trainNumber;

									return (
										<Card
											key={`${tr.trainNumber}-${idx}`}
											className={`border transition-all duration-200 shadow-sm overflow-hidden bg-card/75 backdrop-blur-sm ${
												isExpanded
													? "border-primary/60 shadow-lg ring-2 ring-primary/20 bg-card"
													: "border-border/60 hover:border-primary/40 hover:shadow-md"
											}`}
										>
											<CardContent className="p-4 sm:p-5 space-y-4">
												{/* Header: Train Number, Name & Least Price */}
												<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
													<div className="flex items-center gap-3">
														<div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-inner">
															<Train className="w-5 h-5" />
														</div>
														<div>
															<h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
																<span>
																	{
																		tr.trainName
																	}
																</span>
																<span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted font-bold text-muted-foreground border border-border/40">
																	#
																	{
																		tr.trainNumber
																	}
																</span>
															</h4>
															{tr.runsOnText && (
																<div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
																	<span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
																	<span>
																		{
																			tr.runsOnText
																		}
																	</span>
																</div>
															)}
														</div>
													</div>

													{tr.leastPrice && (
														<div className="text-right bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
															<div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
																{t(
																	"tools.pnr_checker.starts_at",
																)}
															</div>
															<div className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-end">
																<IndianRupee className="w-4 h-4" />
																<span>
																	{
																		tr.leastPrice
																	}
																</span>
															</div>
														</div>
													)}
												</div>

												{/* Timing & Duration Split */}
												<div className="grid grid-cols-12 gap-3 items-center py-2 px-3 rounded-xl bg-muted/25 border border-border/30">
													{/* Departure */}
													<div className="col-span-4 text-left">
														<div className="text-sm sm:text-base font-black text-foreground tracking-tight">
															{formatIsoTime(
																tr.departure,
															)}
														</div>
														{formatIsoDate(
															tr.departure,
														) && (
															<div className="text-[11px] font-medium text-foreground/80">
																{formatIsoDate(
																	tr.departure,
																)}
															</div>
														)}
														<div
															className="text-xs font-semibold text-muted-foreground truncate"
															title={
																tr.sourceName ||
																tr.source
															}
														>
															{tr.sourceName ||
																tr.source}
														</div>
													</div>

													{/* Journey Duration */}
													<div className="col-span-4 text-center flex flex-col items-center">
														<div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 font-mono">
															<Clock className="w-3.5 h-3.5 text-primary" />
															<span>
																{tr.duration}
															</span>
														</div>
														<div className="w-full flex items-center gap-1.5 my-1.5">
															<div className="h-0.5 flex-1 bg-border/80 rounded-full" />
															<div className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20" />
															<div className="h-0.5 flex-1 bg-border/80 rounded-full" />
														</div>
													</div>

													{/* Arrival */}
													<div className="col-span-4 text-right">
														<div className="text-sm sm:text-base font-black text-foreground tracking-tight">
															{formatIsoTime(
																tr.arrival,
															)}
														</div>
														{formatIsoDate(
															tr.arrival,
														) && (
															<div className="text-[11px] font-medium text-foreground/80">
																{formatIsoDate(
																	tr.arrival,
																)}
															</div>
														)}
														<div
															className="text-xs font-semibold text-muted-foreground truncate"
															title={
																tr.destinationName ||
																tr.destination
															}
														>
															{tr.destinationName ||
																tr.destination}
														</div>
													</div>
												</div>

												{/* Seat Classes: Displayed directly on card */}
												{allClassCodes.length > 0 && (
													<div className="space-y-2 pt-1">
														<div className="flex items-center justify-between">
															<span className="text-xs font-bold text-foreground">
																{t(
																	"tools.pnr_checker.select_class",
																)}
																:
															</span>
															{isExpanded && (
																<span className="text-xs text-primary font-bold flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
																	<Sparkles className="w-3.5 h-3.5" />
																	Class{" "}
																	{
																		selectedClass
																	}{" "}
																	Breakdown
																</span>
															)}
														</div>
														<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
															{allClassCodes.map(
																(code) => {
																	const av =
																		availMap.get(
																			code,
																		);
																	const isSelected =
																		isExpanded &&
																		selectedClass ===
																			code;
																	const cachedFare =
																		fareCache[
																			`${tr.trainNumber}-${code}`
																		];
																	const displayFare =
																		av?.fare ??
																		cachedFare;
																	const isLoadingThisClass =
																		fareLoadingKey ===
																		`${tr.trainNumber}-${code}`;

																	return (
																		<button
																			key={
																				code
																			}
																			type="button"
																			onClick={(
																				e,
																			) =>
																				handleClassClick(
																					tr.trainNumber,
																					code,
																					e,
																				)
																			}
																			className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer relative shadow-xs ${
																				isSelected
																					? "bg-primary/15 border-primary shadow-md ring-2 ring-primary/40 text-foreground"
																					: "bg-muted/40 hover:bg-muted/70 border-border/60 hover:border-primary/40 hover:shadow-xs"
																			}`}
																		>
																			<div className="flex items-center justify-between text-xs font-bold w-full">
																				<span
																					className={`text-sm font-black tracking-wider ${
																						isSelected
																							? "text-primary"
																							: "text-foreground"
																					}`}
																				>
																					{
																						code
																					}
																				</span>
																				{isSelected ? (
																					<ChevronUp className="w-3.5 h-3.5 text-primary shrink-0" />
																				) : (
																					<ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
																				)}
																			</div>
																			<div className="mt-1.5 flex items-center justify-between">
																				{isLoadingThisClass ? (
																					<span className="text-[11px] text-primary flex items-center gap-1 font-medium">
																						<Loader2 className="w-3 h-3 animate-spin" />
																						<span>
																							Loading...
																						</span>
																					</span>
																				) : displayFare !==
																				  undefined ? (
																					<span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-black flex items-center">
																						<IndianRupee className="w-3 h-3 inline" />
																						{
																							displayFare
																						}
																					</span>
																				) : (
																					<span className="inline-block h-3.5 w-12 bg-muted/70 rounded-sm animate-pulse" />
																				)}
																			</div>
																		</button>
																	);
																},
															)}
														</div>
													</div>
												)}

												{/* Inline Fare Breakdown (No Modal required) */}
												{isExpanded && (
													<div className="mt-3 p-4 rounded-xl border border-border/60 bg-card/95 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
														<div className="flex items-center justify-between border-b border-border/40 pb-2.5">
															<div className="flex items-center gap-2">
																<Receipt className="w-4 h-4 text-primary" />
																<span className="text-xs font-bold text-foreground">
																	Detailed
																	Fare
																	Breakdown
																	for Class{" "}
																	{
																		selectedClass
																	}
																</span>
															</div>
															<Button
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground"
																onClick={() =>
																	setExpandedTrainNumber(
																		null,
																	)
																}
															>
																<X className="w-3.5 h-3.5" />
															</Button>
														</div>

														{fareLoadingKey ? (
															<div className="py-4 flex flex-col items-center justify-center text-xs text-muted-foreground space-y-2">
																<Loader2 className="w-5 h-5 animate-spin text-primary" />
																<span>
																	Loading
																	detailed
																	fare
																	breakdown...
																</span>
															</div>
														) : fareError ? (
															<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
																{fareError}
															</div>
														) : fareData ? (
															<div className="space-y-3">
																{/* Total Fare Card */}
																<div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
																	<div>
																		<span className="text-xs text-muted-foreground font-semibold">
																			{t(
																				"tools.pnr_checker.total_fare",
																				{
																					classCode:
																						fareData.classCode,
																				},
																			)}
																		</span>
																		<div className="text-xs font-medium text-foreground">
																			{t(
																				"tools.pnr_checker.general_quota_adult",
																			)}
																		</div>
																	</div>
																	<div className="text-xl font-black text-primary flex items-center">
																		<IndianRupee className="w-4 h-4" />
																		<span>
																			{
																				fareData.totalFare
																			}
																		</span>
																	</div>
																</div>

																{/* Itemized Fare List */}
																{fareData.fareBreakup && (
																	<div className="rounded-lg border border-border/40 divide-y divide-border/20 text-xs overflow-hidden">
																		{fareData
																			.fareBreakup
																			.baseFare !==
																			undefined && (
																			<div className="p-2 flex justify-between">
																				<span className="text-muted-foreground">
																					{t(
																						"tools.pnr_checker.base_fare",
																					)}
																				</span>
																				<span className="font-semibold text-foreground font-mono">
																					₹
																					{
																						fareData
																							.fareBreakup
																							.baseFare
																					}
																				</span>
																			</div>
																		)}

																		{fareData
																			.fareBreakup
																			.reservationCharge !==
																			undefined && (
																			<div className="p-2 flex justify-between">
																				<span className="text-muted-foreground">
																					{t(
																						"tools.pnr_checker.reservation_charge",
																					)}
																				</span>
																				<span className="font-semibold text-foreground font-mono">
																					₹
																					{
																						fareData
																							.fareBreakup
																							.reservationCharge
																					}
																				</span>
																			</div>
																		)}

																		{fareData
																			.fareBreakup
																			.superfastCharge !==
																			undefined && (
																			<div className="p-2 flex justify-between">
																				<span className="text-muted-foreground">
																					{t(
																						"tools.pnr_checker.superfast_charge",
																					)}
																				</span>
																				<span className="font-semibold text-foreground font-mono">
																					₹
																					{
																						fareData
																							.fareBreakup
																							.superfastCharge
																					}
																				</span>
																			</div>
																		)}

																		{fareData
																			.fareBreakup
																			.cateringCharge !==
																			undefined &&
																			fareData
																				.fareBreakup
																				.cateringCharge >
																				0 && (
																				<div className="p-2 flex justify-between">
																					<span className="text-muted-foreground">
																						{t(
																							"tools.pnr_checker.catering_charge",
																						)}
																					</span>
																					<span className="font-semibold text-foreground font-mono">
																						₹
																						{
																							fareData
																								.fareBreakup
																								.cateringCharge
																						}
																					</span>
																				</div>
																			)}

																		{fareData
																			.fareBreakup
																			.serviceTax !==
																			undefined &&
																			fareData
																				.fareBreakup
																				.serviceTax >
																				0 && (
																				<div className="p-2 flex justify-between">
																					<span className="text-muted-foreground">
																						{t(
																							"tools.pnr_checker.service_tax",
																						)}
																					</span>
																					<span className="font-semibold text-foreground font-mono">
																						₹
																						{
																							fareData
																								.fareBreakup
																								.serviceTax
																						}
																					</span>
																				</div>
																			)}

																		{fareData
																			.fareBreakup
																			.dynamicFare !==
																			undefined &&
																			fareData
																				.fareBreakup
																				.dynamicFare >
																				0 && (
																				<div className="p-2 flex justify-between">
																					<span className="text-muted-foreground">
																						{t(
																							"tools.pnr_checker.dynamic_fare",
																						)}
																					</span>
																					<span className="font-semibold text-foreground font-mono">
																						₹
																						{
																							fareData
																								.fareBreakup
																								.dynamicFare
																						}
																					</span>
																				</div>
																			)}

																		<div className="p-2 bg-muted/30 flex justify-between font-bold text-foreground">
																			<span>
																				{t(
																					"tools.pnr_checker.total_amount",
																				)}
																			</span>
																			<span className="text-primary font-mono font-black">
																				₹
																				{
																					fareData.totalFare
																				}
																			</span>
																		</div>
																	</div>
																)}
															</div>
														) : null}
													</div>
												)}
											</CardContent>
										</Card>
									);
								},
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};
