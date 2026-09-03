import api from "@/lib/api";
import type {
	PnrData,
	TrainScheduleResponse,
	TrainSearchResult,
} from "../types/trains";

export const getPnrStatus = async (pnr: string): Promise<PnrData> => {
	const response = await api.get<PnrData>(`/tools/trains/status?pnr=${pnr}`);
	return response.data;
};

export const getTrainSchedule = async (
	query: string,
	departureDate?: string,
	source?: string,
): Promise<TrainScheduleResponse> => {
	const params = new URLSearchParams({
		query,
		trainNumber: query,
		...(departureDate && { departureDate }),
		...(source && { source }),
	});
	const response = await api.get<TrainScheduleResponse>(
		`/tools/trains/schedule?${params.toString()}`,
	);
	return response.data;
};

export const searchTrains = async (
	query: string,
): Promise<TrainSearchResult[]> => {
	const response = await api.get<TrainSearchResult[]>(
		`/tools/trains/search?query=${encodeURIComponent(query)}`,
	);
	return response.data;
};

export const getTrainLiveStatus = async (
	trainNumber: string,
	departureDate: string,
): Promise<import("../types/trains").TrainLiveStatusResponse> => {
	const params = new URLSearchParams({
		trainNumber,
		departureDate,
	});
	const response = await api.get<
		import("../types/trains").TrainLiveStatusResponse
	>(`/tools/trains/live-status?${params.toString()}`);
	return response.data;
};

export const searchTrainsBetweenStations = async (
	source: string,
	destination: string,
	departureDate: string,
): Promise<import("../types/trains").SearchTrainsResponse> => {
	const params = new URLSearchParams({
		source,
		destination,
		departureDate,
	});
	const response = await api.get<
		import("../types/trains").SearchTrainsResponse
	>(`/tools/trains/search-between-stations?${params.toString()}`);
	return response.data;
};

export const getTrainFareCalculation = async (
	trainNumber: string,
	from: string,
	to: string,
	classCode: string = "SL",
	quota: string = "GN",
	category: string = "Adult",
): Promise<import("../types/trains").TrainFareResponse> => {
	const params = new URLSearchParams({
		trainNumber,
		from,
		to,
		class: classCode,
		quota,
		category,
	});
	const response = await api.get<import("../types/trains").TrainFareResponse>(
		`/tools/trains/fare?${params.toString()}`,
	);
	return response.data;
};

export const searchStations = async (
	query: string,
): Promise<import("../types/trains").StationSuggestion[]> => {
	const params = new URLSearchParams({ query });
	const response = await api.get<
		import("../types/trains").StationSuggestion[]
	>(`/tools/trains/stations?${params.toString()}`);
	return response.data;
};
