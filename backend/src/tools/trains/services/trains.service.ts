import type {
	Passenger,
	PnrData,
	ScheduleStation,
	TrainScheduleResponse,
	PaytmRawPassenger,
	PaytmRawStation,
	PaytmScheduleApiResponse,
	PaytmScheduleBody,
	TrainSearchResult,
	PaytmTrainsSearchResponse,
	PaytmTrainSearchItem,
	LiveStatusStation,
	TrainLiveStatusResponse,
	PaytmLiveStatusApiResponse,
	PaytmLiveStatusStation,
} from "../types/trains.types.js";

export class PnrService {
	private static PNR_URL = (pnr: string) =>
		`https://tickets.paytm.com/trains/pnr-enquiry/${pnr}/-?pnr_source=PNR`;

	/**
	 * Search train by name or number using Paytm trains-search API
	 */
	public async searchTrainByNameOrNumber(
		query: string,
	): Promise<TrainSearchResult[]> {
		const queryParams = new URLSearchParams({
			designVersion: "v3",
			isH5: "true",
			client: "web",
			deviceIdentifier: "Mozilla Firefox-152.0.0.0",
		});

		const cleanQuery = encodeURIComponent(query.trim());
		const url = `https://travel.paytm.com/api/trains-search/v1/train/${cleanQuery}?${queryParams.toString()}`;

		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
				Accept: "application/json, text/plain, */*",
				"Accept-Language": "en-US,en;q=0.9",
				Referer: "https://tickets.paytm.com/",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to search train (HTTP ${response.status})`);
		}

		const rawData: PaytmTrainsSearchResponse = await response.json();
		const results: TrainSearchResult[] = [];

		if (Array.isArray(rawData.body)) {
			for (const category of rawData.body) {
				if (Array.isArray(category.trains)) {
					for (const tr of category.trains) {
						const rawStations: PaytmRawStation[] =
							tr.schedule || [];
						// Fetch live platform numbers for this train
						const platformMap = new Map<string, string>();
						try {
							const platformUrl = `https://travel.paytm.com/api/trains/v1/platform/locate?designVersion=v3&isH5=true&train_number=${encodeURIComponent(tr.trainNumber || "")}&client=web&deviceIdentifier=Mozilla%20Firefox-152.0.0.0`;
							const pfRes = await fetch(platformUrl, {
								headers: {
									"User-Agent":
										"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
									Accept: "application/json, text/plain, */*",
									"Accept-Language": "en-US,en;q=0.9",
									Referer: "https://tickets.paytm.com/",
								},
							});
							if (pfRes.ok) {
								const pfData = await pfRes.json();
								const pfStations = pfData?.body?.stations || [];
								for (const s of pfStations) {
									const code =
										s.station_code || s.stationCode;
									const pfNo =
										s.platform_number || s.platformNumber;
									if (code && pfNo) {
										platformMap.set(code, String(pfNo));
									}
								}
							}
						} catch {
							// Silent fallback
						}

						const schedule: ScheduleStation[] = rawStations.map(
							(stn: PaytmRawStation, idx: number) => {
								const code =
									stn.stationCode || stn.station_code || "";
								const pfNo =
									stn.platformNumber ||
									stn.platform_number ||
									platformMap.get(code);

								return {
									stationCode: code,
									stationName:
										stn.stationName ||
										stn.station_name ||
										code,
									arrivalTime:
										stn.arrivalTime ||
										stn.arrival_time ||
										"--:--",
									departureTime:
										stn.departureTime ||
										stn.departure_time ||
										"--:--",
									dayCount: Number(stn.dayCount || 1),
									distance: Number(stn.distance || 0),
									haltTime:
										stn.haltTime !== "--"
											? stn.haltTime
											: undefined,
									stoppageNumber: Number(
										stn.stnSerialNumber || idx + 1,
									),
									platformNumber: pfNo
										? String(pfNo)
										: undefined,
								};
							},
						);

						results.push({
							trainNumber: tr.trainNumber || "",
							trainName: tr.trainName || "",
							origin: tr.origin || "",
							destination: tr.destination || "",
							stationFrom: tr.stationFrom || "",
							stationTo: tr.stationTo || "",
							runningOn: tr.runningOn || "",
							journeyClasses: tr.journeyClasses || [],
							schedule,
						});
					}
				}
			}
		}

		return results;
	}

	/**
	 * Fetch PNR data, prediction, coach position & intelligence from ConfirmTkt
	 */
	public async fetchConfirmTktPnr(pnr: string): Promise<{
		pnrResponse?: Record<string, any>;
		ctProResponse?: Record<string, any>;
	} | null> {
		try {
			const url = `https://cttrainsapi.confirmtkt.com/api/v2/ctpro/mweb/${encodeURIComponent(pnr)}?querysource=ct-web&locale=en&getHighChanceText=false&livePnr=false`;
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
					Accept: "*/*",
					"Content-Type": "application/json",
					Referer: "https://www.confirmtkt.com/",
				},
				body: JSON.stringify({ proPlanName: "DEFAULT" }),
			});

			if (!response.ok) return null;
			const json = await response.json();
			return json?.data || null;
		} catch {
			return null;
		}
	}

	/**
	 * Fetch and parse live PNR status from provider, enriched with ConfirmTkt prediction
	 */
	public async fetchPnrStatus(pnr: string): Promise<PnrData> {
		// Run ConfirmTkt prediction in parallel with Paytm PNR fetch
		const confirmTktPromise = this.fetchConfirmTktPnr(pnr);

		let paytmData: PnrData | null = null;
		let paytmError: Error | null = null;

		try {
			const url = PnrService.PNR_URL(pnr);
			const response = await fetch(url, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
					Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
					"Accept-Language": "en-US,en;q=0.9",
					Referer: "https://tickets.paytm.com/",
				},
			});

			if (response.ok) {
				const html = await response.text();
				if (
					html &&
					!html.includes("Invalid PNR") &&
					!html.includes("Invalid data")
				) {
					let searchStr = "window.App=";
					let startIdx = html.indexOf(searchStr);
					if (startIdx === -1) {
						searchStr = "window.App =";
						startIdx = html.indexOf(searchStr);
					}

					if (startIdx !== -1) {
						const jsonStart = html.indexOf("{", startIdx);
						const scriptEnd = html.indexOf("</script>", jsonStart);

						if (jsonStart !== -1 && scriptEnd !== -1) {
							let jsonString = html
								.substring(jsonStart, scriptEnd)
								.trim();
							if (jsonString.endsWith(";")) {
								jsonString = jsonString.slice(0, -1).trim();
							}
							const appState = JSON.parse(jsonString);
							const pnrData =
								appState?.state?.TrainPnr?.pnrStatusData;

							if (pnrData?.body) {
								const body = pnrData.body;
								const meta = pnrData.meta || {};
								const trainName =
									body.train_name_h5 ||
									body.train_name ||
									"Train";
								const trainNo = body.train_number || "";
								const trainDisplay = trainNo
									? `${trainName} (${trainNo})`
									: trainName;
								const classCode = body.class || "";
								const quotaCode = body.quota || "";
								const className =
									meta.classes?.[classCode] || classCode;
								const quotaName =
									meta.quota?.[quotaCode] || quotaCode;
								const fullClass =
									className +
									(quotaName ? ` - ${quotaName}` : "");
								const boarding = body.boarding_station || {};
								const dest = body.reservation_upto || {};

								const passengers: Passenger[] = Array.isArray(
									body.pax_info,
								)
									? body.pax_info.map(
											(
												pax: PaytmRawPassenger,
												idx: number,
											) => {
												const status =
													pax.currentStatusDisplayText ||
													pax.currentStatus ||
													pax.bookingStatus ||
													"No Status";
												const booking =
													pax.bookingStatus
														? `${pax.bookingStatus}${
																pax.bookingBerthNo
																	? ` / ${pax.bookingBerthNo}`
																	: ""
															}`
														: "";
												return {
													number: idx + 1,
													name:
														pax.passengerName ||
														`Passenger ${idx + 1}`,
													status,
													bookingStatus: booking,
												};
											},
										)
									: [];

								paytmData = {
									pnr: body.pnr_number || pnr,
									trainNumber: trainNo,
									train: trainDisplay,
									class: fullClass,
									date: body.date || "",
									from:
										boarding.station_name_h5 ||
										boarding.station_name ||
										boarding.station_code ||
										"",
									fromCode: boarding.station_code || "",
									to:
										dest.station_name_h5 ||
										dest.station_name ||
										dest.station_code ||
										"",
									toCode: dest.station_code || "",
									departure:
										boarding.departure_time ||
										boarding.time ||
										"",
									departureDate:
										boarding.departure_date ||
										boarding.date ||
										body.date ||
										"",
									arrival:
										dest.arrival_time || dest.time || "",
									arrivalDate:
										dest.arrival_date ||
										dest.date ||
										body.date ||
										"",
									duration: body.journey_duration || "",
									chartStatus: body.chart_prepared
										? "Chart Prepared"
										: "Chart not prepared",
									passengers,
								};
							}
						}
					}
				}
			}
		} catch (err: unknown) {
			paytmError = err instanceof Error ? err : new Error(String(err));
		}

		// Await ConfirmTkt intelligence response
		const ctData = await confirmTktPromise;
		const ctPnr = ctData?.pnrResponse;
		const ctPro = ctData?.ctProResponse;

		// Extract benefits from ConfirmTkt ctPro
		const benefits: import("../types/trains.types.js").PnrIntelligenceBenefit[] =
			[];
		if (Array.isArray(ctPro?.proBenefits)) {
			for (const bGroup of ctPro.proBenefits) {
				for (const item of bGroup.benefitItems || []) {
					benefits.push({
						type: item.featureType || item.type,
						text: (item.text || "").replace(/\n/g, " "),
						unlockedText: (item.unlockedText?.text || "").replace(
							/\n/g,
							" ",
						),
						color: item.unlockedText?.color,
					});
				}
			}
		}

		// If Paytm succeeded, merge ConfirmTkt intelligence (predictions, coach layout, ratings)
		if (paytmData) {
			const ctPaxList = ctPnr?.passengerStatus || [];
			paytmData.passengers = paytmData.passengers.map((pax, idx) => {
				const ctPax =
					ctPaxList[idx] ||
					ctPaxList.find((p: any) => p.number === pax.number);
				return {
					...pax,
					prediction: ctPax?.prediction || undefined,
					confirmTktStatus: ctPax?.confirmTktStatus || undefined,
					coach: ctPax?.coach || ctPax?.currentCoachId || undefined,
					berth: ctPax?.berth || ctPax?.currentBerthNo || undefined,
				};
			});

			if (ctPnr?.coachPosition) {
				paytmData.coachPosition = ctPnr.coachPosition;
			}
			if (ctPnr?.expectedPlatformNo) {
				paytmData.expectedPlatformNo = ctPnr.expectedPlatformNo;
			}
			if (ctPnr?.ticketFare || ctPnr?.bookingFare) {
				paytmData.ticketFare = ctPnr.ticketFare || ctPnr.bookingFare;
			}
			if (ctPnr?.rating) {
				paytmData.ratings = {
					overall: ctPnr.rating,
					cleanliness: ctPnr.cleanlinessRating,
					punctuality: ctPnr.punctualityRating,
					food: ctPnr.foodRating,
				};
			}
			if (benefits.length > 0) {
				paytmData.benefits = benefits;
			}

			return paytmData;
		}

		// Fallback: If Paytm was blocked or failed, use ConfirmTkt as the primary provider
		if (ctPnr && !ctPnr.error) {
			const ctPassengers: Passenger[] = (ctPnr.passengerStatus || []).map(
				(pax: any, idx: number) => ({
					number: pax.number || idx + 1,
					name: `Passenger ${pax.number || idx + 1}`,
					status:
						pax.currentStatus || pax.bookingStatus || "No Status",
					bookingStatus: pax.bookingStatus || undefined,
					prediction: pax.prediction || undefined,
					confirmTktStatus: pax.confirmTktStatus || undefined,
					coach: pax.coach || pax.currentCoachId || undefined,
					berth: pax.berth || pax.currentBerthNo || undefined,
				}),
			);

			return {
				pnr: ctPnr.pnr || pnr,
				trainNumber: ctPnr.trainNo || "",
				train: ctPnr.trainNo
					? `${ctPnr.trainName || "Train"} (${ctPnr.trainNo})`
					: ctPnr.trainName || "Train",
				class: ctPnr.class || "",
				date: ctPnr.doj || "",
				from:
					ctPnr.boardingStationName ||
					ctPnr.sourceName ||
					ctPnr.from ||
					"",
				fromCode: ctPnr.from || "",
				to:
					ctPnr.reservationUptoName ||
					ctPnr.destinationName ||
					ctPnr.to ||
					"",
				toCode: ctPnr.to || "",
				departure: ctPnr.departureTime || "",
				departureDate: ctPnr.sourceDoj || ctPnr.doj || "",
				arrival: ctPnr.arrivalTime || "",
				arrivalDate: ctPnr.destinationDoj || ctPnr.doj || "",
				duration: ctPnr.duration || "",
				chartStatus: ctPnr.chartPrepared
					? "Chart Prepared"
					: "Chart not prepared",
				passengers: ctPassengers,
				coachPosition: ctPnr.coachPosition || undefined,
				expectedPlatformNo: ctPnr.expectedPlatformNo || undefined,
				ticketFare: ctPnr.ticketFare || ctPnr.bookingFare || undefined,
				ratings: ctPnr.rating
					? {
							overall: ctPnr.rating,
							cleanliness: ctPnr.cleanlinessRating,
							punctuality: ctPnr.punctualityRating,
							food: ctPnr.foodRating,
						}
					: undefined,
				benefits: benefits.length > 0 ? benefits : undefined,
			};
		}

		if (paytmError) {
			throw paytmError;
		}

		throw new Error("Invalid PNR or records not found from provider.");
	}

	/**
	 * Fetch train schedule from Paytm API
	 */
	public async fetchTrainSchedule(
		trainNumber: string,
		departureDate?: string,
		source?: string,
	): Promise<TrainScheduleResponse> {
		const formattedDate = departureDate
			? departureDate.replace(/-/g, "")
			: "";
		const queryParams = new URLSearchParams({
			departureDate: formattedDate,
			designVersion: "v3",
			isH5: "true",
			source: source || "",
			trainNumber: trainNumber,
			client: "web",
			deviceIdentifier: "Mozilla Firefox-152.0.0.0",
		});

		const url = `https://travel.paytm.com/api/trains/v1/schedule?${queryParams.toString()}`;

		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
				Accept: "application/json, text/plain, */*",
				"Accept-Language": "en-US,en;q=0.9",
				Referer: "https://tickets.paytm.com/",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch train schedule (HTTP ${response.status})`,
			);
		}

		const rawData: PaytmScheduleApiResponse = await response.json();
		const body: PaytmScheduleBody | undefined = Array.isArray(rawData.body)
			? rawData.body[0]
			: rawData.body;
		const rawStations: PaytmRawStation[] =
			body?.stationList || body?.stations || body?.schedule || [];

		// Try fetching live platform numbers from Paytm platform locate API
		const platformMap = new Map<string, string>();
		try {
			const platformUrl = `https://travel.paytm.com/api/trains/v1/platform/locate?designVersion=v3&isH5=true&train_number=${encodeURIComponent(trainNumber)}&client=web&deviceIdentifier=Mozilla%20Firefox-152.0.0.0`;
			const pfRes = await fetch(platformUrl, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
					Accept: "application/json, text/plain, */*",
					"Accept-Language": "en-US,en;q=0.9",
					Referer: "https://tickets.paytm.com/",
				},
			});
			if (pfRes.ok) {
				const pfData = await pfRes.json();
				const pfStations = pfData?.body?.stations || [];
				for (const s of pfStations) {
					const code = s.station_code || s.stationCode;
					const pfNo = s.platform_number || s.platformNumber;
					if (code && pfNo) {
						platformMap.set(code, String(pfNo));
					}
				}
			}
		} catch {
			// Silent fallback if platform API unavailable
		}

		const stations: ScheduleStation[] = rawStations.map(
			(stn: PaytmRawStation, idx: number) => {
				const code = stn.stationCode || stn.station_code || "";
				const pfNo =
					stn.platformNumber ||
					stn.platform_number ||
					platformMap.get(code);

				return {
					stationCode: code,
					stationName: stn.stationName || stn.station_name || code,
					arrivalTime: stn.arrivalTime || stn.arrival_time || "--:--",
					departureTime:
						stn.departureTime || stn.departure_time || "--:--",
					dayCount: Number(stn.dayCount || 1),
					distance: Number(stn.distance || 0),
					haltTime: stn.haltTime !== "--" ? stn.haltTime : undefined,
					stoppageNumber: Number(stn.stnSerialNumber || idx + 1),
					platformNumber: pfNo ? String(pfNo) : undefined,
				};
			},
		);

		return {
			trainNumber: body?.trainNumber || trainNumber,
			trainName: body?.trainName || "",
			stations,
			origin: body?.origin || body?.stationFrom || undefined,
			destination: body?.destination || body?.stationTo || undefined,
		};
	}

	/**
	 * Fetch train live running status from Paytm API
	 */
	public async fetchTrainLiveStatus(
		trainNumber: string,
		departureDate: string,
	): Promise<TrainLiveStatusResponse> {
		const formattedDate = departureDate.replace(/-/g, "").trim();
		const queryParams = new URLSearchParams({
			departure_date: formattedDate,
			designVersion: "v3",
			isH5: "true",
			train_number: trainNumber.trim(),
			client: "web",
			deviceIdentifier: "Mozilla Firefox-152.0.0.0",
		});

		const url = `https://travel.paytm.com/api/trains/v1/train/status?${queryParams.toString()}`;

		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
				Accept: "application/json, text/plain, */*",
				"Accept-Language": "en-US,en;q=0.9",
				Referer: "https://tickets.paytm.com/",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch train live status (HTTP ${response.status})`,
			);
		}

		const rawData: PaytmLiveStatusApiResponse = await response.json();
		const body = rawData.body;

		const parseDelayMinutes = (
			scheduledTime?: string,
			actualTime?: string,
			providedDelay?: number,
		): number | undefined => {
			if (typeof providedDelay === "number" && !isNaN(providedDelay)) {
				return providedDelay;
			}
			if (
				!scheduledTime ||
				!actualTime ||
				scheduledTime === "--" ||
				actualTime === "--"
			) {
				return undefined;
			}
			try {
				const [sH, sM] = scheduledTime.split(":").map(Number);
				const [aH, aM] = actualTime.split(":").map(Number);
				if (isNaN(sH!) || isNaN(sM!) || isNaN(aH!) || isNaN(aM!))
					return undefined;

				let diff = aH! * 60 + aM! - (sH! * 60 + sM!);
				// Handle midnight rollover (e.g. scheduled 23:50, actual 00:15 => +25m)
				if (diff < -720) diff += 1440;
				else if (diff > 720) diff -= 1440;

				return diff;
			} catch {
				return undefined;
			}
		};

		const stations: LiveStatusStation[] = (body?.stations || []).map(
			(stn: PaytmLiveStatusStation, idx: number) => {
				const schArr =
					stn.arrivalTime !== "--" ? stn.arrivalTime : undefined;
				const actArr =
					stn.actual_arrival_time !== "--"
						? stn.actual_arrival_time
						: undefined;
				const schDep =
					stn.departureTime !== "--" ? stn.departureTime : undefined;
				const actDep =
					stn.actual_departure_time !== "--"
						? stn.actual_departure_time
						: undefined;

				const delayArr = parseDelayMinutes(
					schArr,
					actArr,
					stn.delay_arrival_minutes,
				);
				const delayDep = parseDelayMinutes(
					schDep,
					actDep,
					stn.delay_departure_minutes,
				);

				return {
					stationCode: stn.stationCode || "",
					stationName: stn.stationName || stn.stationCode || "",
					arrivalTime: stn.arrivalTime || "--:--",
					departureTime: stn.departureTime || "--:--",
					haltTime: stn.haltTime !== "--" ? stn.haltTime : undefined,
					distance: Number(stn.distance || 0),
					dayCount: Number(stn.dayCount || 1),
					stoppageNumber: Number(stn.stnSerialNumber || idx + 1),
					status: stn.status || undefined,
					actualArrivalDate: stn.actual_arrival_date || undefined,
					actualDepartureDate: stn.actual_departure_date || undefined,
					actualArrivalTime: actArr,
					actualDepartureTime: actDep,
					expectedPlatform:
						stn.expected_platform !== "-"
							? stn.expected_platform
							: undefined,
					delayArrivalMinutes: delayArr,
					delayDepartureMinutes: delayDep,
				};
			},
		);

		return {
			trainNumber: body?.train_number || trainNumber,
			trainName: body?.train_name || "",
			currentStation: body?.current_station || undefined,
			terminated: body?.terminated ?? false,
			trainStatusMessage: body?.train_status_message || undefined,
			timeOfAvailability: body?.time_of_availability || undefined,
			serverTimestamp: body?.server_timestamp || undefined,
			stations,
		};
	}

	/**
	 * Search trains between source and destination stations for a given departure date
	 * API Endpoint: https://travel.paytm.com/api/trains/v5/search
	 */
	public async fetchTrainsBetweenStations(
		source: string,
		destination: string,
		departureDate: string,
	): Promise<import("../types/trains.types.js").SearchTrainsResponse> {
		const queryParams = new URLSearchParams({
			departureDate: departureDate,
			designVersion: "v3",
			destination: destination.toUpperCase().trim(),
			dimension114: "direct-check_pnr_details",
			isAscOfferEligible: "false",
			isH5: "true",
			quota: "GN",
			show_empty: "true",
			source: source.toUpperCase().trim(),
			client: "web",
			deviceIdentifier: "Mozilla Firefox-152.0.0.0",
		});

		const url = `https://travel.paytm.com/api/trains/v5/search?${queryParams.toString()}`;

		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
				Accept: "application/json, text/plain, */*",
				"Accept-Language": "en-US,en;q=0.9",
				Referer: "https://tickets.paytm.com/",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch trains between ${source} and ${destination} (HTTP ${response.status})`,
			);
		}

		const rawData: import("../types/trains.types.js").PaytmSearchTrainsApiResponse =
			await response.json();

		if (rawData.error) {
			throw new Error(rawData.error);
		}

		const body = rawData.body;
		const rawTrains = body?.trains || [];

		const trains: import("../types/trains.types.js").TrainSearchResultItem[] =
			rawTrains.map((tr) => {
				const seenCodes = new Set<string>();
				const availList: Array<{
					code: string;
					name: string;
					status: string;
					statusShortform?: string | undefined;
					availableFlag: boolean;
					fare?: number | undefined;
					timeOfAvailability?: string | undefined;
				}> = [];

				for (const av of tr.availability || []) {
					const code = (av.code || "").toUpperCase().trim();
					if (!code || seenCodes.has(code)) continue;
					seenCodes.add(code);

					availList.push({
						code,
						name: av.name || av.code || "",
						status: av.status || "AVAILABLE",
						statusShortform: av.status_shortform || undefined,
						availableFlag: Boolean(av.available_flag),
						fare:
							typeof av.fare === "number"
								? av.fare
								: Number(av.fare) || undefined,
						timeOfAvailability:
							av.time_of_availability || undefined,
					});
				}

				// Also deduplicate classes array
				const uniqueClasses = Array.from(
					new Set(
						(tr.classes || []).map((c) => c.toUpperCase().trim()),
					),
				).filter(Boolean);

				return {
					departure: tr.departure || "",
					arrival: tr.arrival || "",
					trainName: tr.trainName || "",
					trainNumber: tr.trainNumber || "",
					source: tr.source || source,
					destination: tr.destination || destination,
					sourceName: tr.source_name || "",
					destinationName: tr.destination_name || "",
					duration: tr.duration || "",
					classes: uniqueClasses,
					runsOnText: tr.runs_on?.text || undefined,
					availability: availList,
					leastPrice:
						typeof tr.least_price === "number"
							? tr.least_price
							: Number(tr.least_price) || undefined,
				};
			});

		return {
			source: body?.search_source || source,
			destination: body?.search_destination || destination,
			sourceName: body?.search_source_name || "",
			destinationName: body?.search_destination_name || "",
			trains,
		};
	}

	/**
	 * Calculate Fare Breakdown for a Train, Class, and Route
	 * API Endpoint: https://travel.paytm.com/api/trains/v1/fare-calculate
	 */
	public async calculateFare(
		trainNumber: string,
		from: string,
		to: string,
		classCode: string = "SL",
		quota: string = "GN",
		category: string = "Adult",
	): Promise<import("../types/trains.types.js").TrainFareResponse> {
		const queryParams = new URLSearchParams({
			category: category,
			class: classCode.toUpperCase().trim(),
			designVersion: "v3",
			from: from.toUpperCase().trim(),
			isH5: "true",
			quota: quota.toUpperCase().trim(),
			to: to.toUpperCase().trim(),
			trainNumber: trainNumber.trim(),
			client: "web",
			deviceIdentifier: "Mozilla Firefox-152.0.0.0",
		});

		const url = `https://travel.paytm.com/api/trains/v1/fare-calculate?${queryParams.toString()}`;

		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
				Accept: "application/json, text/plain, */*",
				"Accept-Language": "en-US,en;q=0.9",
				Referer: "https://tickets.paytm.com/",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to calculate fare for train ${trainNumber} (HTTP ${response.status})`,
			);
		}

		const rawData: import("../types/trains.types.js").PaytmFareCalculateApiResponse =
			await response.json();

		if (rawData.error) {
			throw new Error(rawData.error);
		}

		const body = rawData.body;
		const meta = rawData.meta;
		const fareObj = body?.train_details?.fare;
		const totalFare =
			meta?.total_fare ??
			(fareObj?.total_fare ? Number(fareObj.total_fare) : 0);

		const breakup = fareObj?.fare_breakup;

		return {
			trainNumber: body?.train_details?.trainNumber || trainNumber,
			trainName: body?.train_details?.trainName || meta?.train_name || "",
			from: body?.train_details?.source || from,
			to: body?.train_details?.destination || to,
			classCode: meta?.class || classCode,
			quota: meta?.quota || quota,
			totalFare,
			fareBreakup: breakup
				? {
						baseFare: Number(breakup.base_fare || 0),
						cateringCharge: Number(breakup.cateringCharge || 0),
						reservationCharge: Number(
							breakup.reservationCharge || 0,
						),
						serviceTax: Number(breakup.serviceTax || 0),
						superfastCharge: Number(breakup.superfastCharge || 0),
						dynamicFare: Number(breakup.dynamicFare || 0),
					}
				: undefined,
			availableClasses: (body?.available_classes || []).map((ac) => ({
				code: ac.code,
				name: ac.name,
				default: ac.default,
			})),
			fareDetails: body?.fare_details,
		};
	}

	/**
	 * Search Stations by Query (code or name)
	 * API Endpoint: https://travel.paytm.com/api/trains/v3/station/{query}
	 */
	public async searchStations(
		query: string,
	): Promise<import("../types/trains.types.js").StationSuggestion[]> {
		const cleanQuery = encodeURIComponent(query.trim());
		if (!cleanQuery) return [];

		const url = `https://travel.paytm.com/api/trains/v3/station/${cleanQuery}?designVersion=v3&isH5=true&client=web&deviceIdentifier=Mozilla%20Firefox-152.0.0.0`;

		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
				Accept: "application/json, text/plain, */*",
				"Accept-Language": "en-US,en;q=0.9",
				Referer: "https://tickets.paytm.com/",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Station search failed with HTTP ${response.status}`,
			);
		}

		const rawData: import("../types/trains.types.js").PaytmStationApiResponse =
			await response.json();

		const seenCodes = new Set<string>();
		const stations: import("../types/trains.types.js").StationSuggestion[] =
			[];

		for (const cat of rawData.body || []) {
			for (const item of cat.stations || []) {
				const d = item.data;
				if (!d?.code) continue;
				const code = d.code.toUpperCase().trim();
				if (seenCodes.has(code)) continue;
				seenCodes.add(code);

				stations.push({
					code,
					name: d.name || code,
					displayName:
						d.display_name || `${code} - ${d.name || code}`,
					state: d.display_location || undefined,
				});
			}
		}

		return stations;
	}
}

export const pnrService = new PnrService();
