export interface Passenger {
	number: number;
	name: string;
	status: string;
	bookingStatus?: string | undefined;
	prediction?: string | undefined;
	confirmTktStatus?: string | undefined;
	coach?: string | undefined;
	berth?: string | number | undefined;
}

export interface PnrIntelligenceBenefit {
	type?: string | undefined;
	text?: string | undefined;
	unlockedText?: string | undefined;
	color?: string | undefined;
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
	coachPosition?: string | undefined;
	expectedPlatformNo?: string | undefined;
	ticketFare?: string | number | undefined;
	ratings?:
		| {
				overall?: number | undefined;
				cleanliness?: number | undefined;
				punctuality?: number | undefined;
				food?: number | undefined;
		  }
		| undefined;
	benefits?: PnrIntelligenceBenefit[] | undefined;
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

// Paytm Search Trains Between Stations API Types
export interface PaytmTrainAvailabilityClass {
	code: string;
	name: string;
	status: string;
	status_shortform?: string;
	available_flag: boolean | string;
	fare: number | string;
	time_of_availability?: string;
	colour?: string;
	quota?: string;
	pnr_prediction?: {
		value?: number;
		color?: string;
	};
}

export interface PaytmSearchTrainItem {
	departure: string;
	arrival: string;
	trainName: string;
	trainNumber: string;
	source: string;
	destination: string;
	source_name: string;
	destination_name: string;
	duration: string;
	classes: string[];
	runs_on?: {
		text?: string;
		color?: string;
	};
	availability?: PaytmTrainAvailabilityClass[];
	least_price?: number | string;
	max_price?: number | string;
}

export interface PaytmSearchTrainsBody {
	trains: PaytmSearchTrainItem[];
	search_source?: string;
	search_destination?: string;
	search_source_name?: string;
	search_destination_name?: string;
}

export interface PaytmSearchTrainsApiResponse {
	error?: string | null;
	status?: {
		result?: string;
		message?: {
			title?: string;
			message?: string;
		};
	};
	body?: PaytmSearchTrainsBody;
	code?: number;
}

export interface TrainSearchResultItem {
	departure: string;
	arrival: string;
	trainName: string;
	trainNumber: string;
	source: string;
	destination: string;
	sourceName: string;
	destinationName: string;
	duration: string;
	classes: string[];
	runsOnText?: string | undefined;
	availability?: {
		code: string;
		name: string;
		status: string;
		statusShortform?: string | undefined;
		availableFlag: boolean;
		fare?: number | undefined;
		timeOfAvailability?: string | undefined;
	}[];
	leastPrice?: number | undefined;
}

export interface SearchTrainsResponse {
	source: string;
	destination: string;
	sourceName: string;
	destinationName: string;
	trains: TrainSearchResultItem[];
}

export interface PaytmFareBreakup {
	base_fare?: string | number;
	cateringCharge?: string | number;
	reservationCharge?: string | number;
	serviceTax?: string | number;
	superfastCharge?: string | number;
	dynamicFare?: string | number;
}

export interface PaytmFareDetailsItem {
	key: number;
	displayName: {
		text: string;
		alignment?: string;
		text_type?: string;
	}[];
	value: {
		text: string;
		alignment?: string;
		text_type?: string;
		amount?: boolean;
	}[];
	type: string;
	visibility: boolean;
}

export interface PaytmFareCalculateApiResponse {
	error?: string | null;
	status?: {
		result?: string;
		message?: {
			title?: string;
			message?: string;
		};
	};
	body?: {
		train_details?: {
			fare?: {
				total_fare: string;
				fare_breakup?: PaytmFareBreakup;
			};
			trainName?: string;
			trainNumber?: string;
			source?: string;
			destination?: string;
			timeStamp?: string;
		};
		available_classes?: {
			name: string;
			code: string;
			default: boolean;
		}[];
		available_quotas?: {
			name: string;
			code: string;
			default: boolean;
		}[];
		fare_details?: PaytmFareDetailsItem[];
	};
	meta?: {
		train_number?: string;
		train_name?: string;
		from?: string;
		to?: string;
		quota?: string;
		class?: string;
		category?: string;
		total_fare?: number;
		timestamp?: string;
	};
	code?: number;
}

export interface TrainFareResponse {
	trainNumber: string;
	trainName: string;
	from: string;
	to: string;
	classCode: string;
	quota: string;
	totalFare: number;
	fareBreakup?:
		| {
				baseFare?: number | undefined;
				cateringCharge?: number | undefined;
				reservationCharge?: number | undefined;
				serviceTax?: number | undefined;
				superfastCharge?: number | undefined;
				dynamicFare?: number | undefined;
		  }
		| undefined;
	availableClasses?:
		| {
				code: string;
				name: string;
				default?: boolean | undefined;
		  }[]
		| undefined;
	fareDetails?: PaytmFareDetailsItem[] | undefined;
}

export interface StationSuggestion {
	code: string;
	name: string;
	displayName: string;
	state?: string | undefined;
}

export interface PaytmStationData {
	code?: string;
	name?: string;
	display_name?: string;
	display_location?: string;
	name_hi?: string;
	display_name_hi?: string;
}

export interface PaytmStationResultItem {
	data?: PaytmStationData;
	type?: string;
}

export interface PaytmStationCategory {
	title?: string;
	stations?: PaytmStationResultItem[];
	queryText?: string;
}

export interface PaytmStationApiResponse {
	body?: PaytmStationCategory[];
	error?: string | null;
	status?: {
		result?: string;
		message?: {
			title?: string;
			message?: string;
		};
	};
	code?: number;
}
