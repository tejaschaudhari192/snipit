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
	 * Fetch and parse live PNR status from provider
	 */
	public async fetchPnrStatus(pnr: string): Promise<PnrData> {
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

		if (!response.ok) {
			throw new Error(
				`Failed to connect to service (HTTP ${response.status})`,
			);
		}

		const html = await response.text();

		if (!html) {
			throw new Error("Empty response from provider");
		}

		if (html.includes("Invalid PNR") || html.includes("Invalid data")) {
			throw new Error("Invalid PNR or records not found.");
		}

		// Locate state script safely
		let searchStr = "window.App=";
		let startIdx = html.indexOf(searchStr);

		if (startIdx === -1) {
			searchStr = "window.App =";
			startIdx = html.indexOf(searchStr);
		}

		if (startIdx === -1) {
			if (
				html.includes("akam") ||
				html.includes("challenge") ||
				html.includes("Access Denied")
			) {
				throw new Error("Provider bot protection blocked the request.");
			}
			throw new Error("Could not parse application state from provider.");
		}

		const jsonStart = html.indexOf("{", startIdx);
		const scriptEnd = html.indexOf("</script>", jsonStart);

		if (jsonStart === -1 || scriptEnd === -1) {
			throw new Error("Malformed HTML structure in response.");
		}

		let jsonString = html.substring(jsonStart, scriptEnd).trim();
		if (jsonString.endsWith(";")) {
			jsonString = jsonString.slice(0, -1).trim();
		}

		const appState = JSON.parse(jsonString);
		const pnrData = appState?.state?.TrainPnr?.pnrStatusData;

		if (!pnrData || !pnrData.body) {
			throw new Error("PNR details not available for this number.");
		}

		const body = pnrData.body;
		const meta = pnrData.meta || {};

		if (!body.date) {
			throw new Error("Journey date not available for this PNR.");
		}

		// Train info
		const trainName = body.train_name_h5 || body.train_name || "Train";
		const trainNo = body.train_number || "";
		const trainDisplay = trainNo ? `${trainName} (${trainNo})` : trainName;

		// Class & Quota description
		const classCode = body.class || "";
		const quotaCode = body.quota || "";
		const className = meta.classes?.[classCode] || classCode;
		const quotaName = meta.quota?.[quotaCode] || quotaCode;
		const fullClass = className + (quotaName ? ` - ${quotaName}` : "");

		// Stations, Times & Dates
		const boarding = body.boarding_station || {};
		const dest = body.reservation_upto || {};

		const depTime = boarding.departure_time || boarding.time || "";
		const depDate =
			boarding.departure_date || boarding.date || body.date || "";

		const arrTime = dest.arrival_time || dest.time || "";
		const arrDate = dest.arrival_date || dest.date || body.date || "";

		// Dynamic passenger list
		const passengers: Passenger[] = Array.isArray(body.pax_info)
			? body.pax_info.map((pax: PaytmRawPassenger, idx: number) => {
					const status =
						pax.currentStatusDisplayText ||
						pax.currentStatus ||
						pax.bookingStatus ||
						"No Status";
					const booking = pax.bookingStatus
						? `${pax.bookingStatus}${
								pax.bookingBerthNo
									? ` / ${pax.bookingBerthNo}`
									: ""
							}`
						: "";

					return {
						number: idx + 1,
						name: pax.passengerName || `Passenger ${idx + 1}`,
						status,
						bookingStatus: booking,
					};
				})
			: [];

		return {
			pnr: body.pnr_number || pnr,
			trainNumber: trainNo,
			train: trainDisplay,
			class: fullClass,
			date: body.date,
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
			departure: depTime,
			departureDate: depDate,
			arrival: arrTime,
			arrivalDate: arrDate,
			duration: body.journey_duration || "",
			chartStatus: body.chart_prepared
				? "Chart Prepared"
				: "Chart not prepared",
			passengers,
		};
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
}

export const pnrService = new PnrService();
