export interface Passenger {
	number: number;
	name: string;
	status: string;
	bookingStatus?: string | undefined;
}

export interface PnrData {
	pnr: string;
	trainNumber?: string | undefined;
	train: string;
	class: string;
	date: string;
	from: string;
	fromCode?: string | undefined;
	to: string;
	toCode?: string | undefined;
	departure: string;
	departureDate?: string | undefined;
	arrival: string;
	arrivalDate?: string | undefined;
	duration?: string | undefined;
	chartStatus?: string | undefined;
	passengers: Passenger[];
	error?: string | undefined;
}

export interface ScheduleStation {
	stationCode: string;
	stationName: string;
	arrivalTime: string;
	departureTime: string;
	dayCount: number;
	distance: number;
	haltTime?: string | undefined;
	stoppageNumber?: number | undefined;
	platformNumber?: string | undefined;
}

export interface TrainScheduleResponse {
	trainNumber: string;
	trainName: string;
	stations: ScheduleStation[];
	origin?: string | undefined;
	destination?: string | undefined;
	runningOn?: string | undefined;
	journeyClasses?: string[] | undefined;
}

export interface PaytmRawPassenger {
	passengerName?: string;
	currentStatusDisplayText?: string;
	currentStatus?: string;
	bookingStatus?: string;
	bookingBerthNo?: string | number;
}

export interface PaytmRawStation {
	stationCode?: string;
	station_code?: string;
	stationName?: string;
	station_name?: string;
	arrivalTime?: string;
	arrival_time?: string;
	departureTime?: string;
	departure_time?: string;
	dayCount?: string | number;
	distance?: string | number;
	haltTime?: string;
	stnSerialNumber?: string | number;
	status?: string;
	routeNumber?: string | number;
	boardingDisabled?: string | boolean;
	platform_number?: string;
	platformNumber?: string;
}

export interface PaytmScheduleBody {
	trainName?: string;
	trainNumber?: string;
	stationList?: PaytmRawStation[];
	stations?: PaytmRawStation[];
	schedule?: PaytmRawStation[];
	stationFrom?: string;
	stationTo?: string;
	origin?: string;
	destination?: string;
}

export interface PaytmScheduleApiResponse {
	body?: PaytmScheduleBody | PaytmScheduleBody[];
	error?: string | null;
	code?: number;
}

export interface TrainSearchResult {
	trainNumber: string;
	trainName: string;
	origin: string;
	destination: string;
	stationFrom: string;
	stationTo: string;
	runningOn: string;
	journeyClasses: string[];
	schedule: ScheduleStation[];
}

export interface PaytmTrainSearchItem {
	trainNumber?: string;
	trainName?: string;
	origin?: string;
	destination?: string;
	stationFrom?: string;
	stationTo?: string;
	runningOn?: string;
	journeyClasses?: string[];
	schedule?: PaytmRawStation[];
}

export interface PaytmTrainSearchCategory {
	title?: string;
	trains?: PaytmTrainSearchItem[];
}

export interface PaytmTrainsSearchResponse {
	body?: PaytmTrainSearchCategory[];
	meta?: {
		server_timestamp_ist?: string;
	};
}

export interface LiveStatusStation {
	stationCode: string;
	stationName: string;
	arrivalTime: string;
	departureTime: string;
	haltTime?: string | undefined;
	distance: number;
	dayCount: number;
	stoppageNumber?: number | undefined;
	status?: string | undefined;
	actualArrivalDate?: string | undefined;
	actualDepartureDate?: string | undefined;
	actualArrivalTime?: string | undefined;
	actualDepartureTime?: string | undefined;
	expectedPlatform?: string | undefined;
	delayArrivalMinutes?: number | undefined;
	delayDepartureMinutes?: number | undefined;
}

export interface TrainLiveStatusResponse {
	trainNumber: string;
	trainName: string;
	currentStation?: string | undefined;
	terminated?: boolean | undefined;
	trainStatusMessage?: string | undefined;
	timeOfAvailability?: string | undefined;
	serverTimestamp?: string | undefined;
	stations: LiveStatusStation[];
}

export interface PaytmLiveStatusStation {
	stationCode?: string;
	stationName?: string;
	arrivalTime?: string;
	departureTime?: string;
	haltTime?: string;
	distance?: string | number;
	dayCount?: string | number;
	stnSerialNumber?: string | number;
	boardingDisabled?: string | boolean;
	status?: string;
	actual_arrival_date?: string;
	actual_departure_date?: string;
	actual_arrival_time?: string;
	actual_departure_time?: string;
	expected_platform?: string;
	delay_arrival_minutes?: number;
	delay_departure_minutes?: number;
}

export interface PaytmLiveStatusBody {
	train_number?: string;
	train_name?: string;
	time_of_availability?: string;
	current_station?: string;
	terminated?: boolean;
	server_timestamp?: string;
	train_status_message?: string;
	stations?: PaytmLiveStatusStation[];
}

export interface PaytmLiveStatusApiResponse {
	error?: string | null;
	status?: {
		result?: string;
		message?: {
			title?: string;
			message?: string;
		};
	};
	body?: PaytmLiveStatusBody;
	code?: number;
}
