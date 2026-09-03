export interface Passenger {
	number: number;
	name: string;
	status: string;
	bookingStatus?: string;
	prediction?: string;
	confirmTktStatus?: string;
	coach?: string;
	berth?: string | number;
}

export interface PnrIntelligenceBenefit {
	type?: string;
	text?: string;
	unlockedText?: string;
	color?: string;
}

export interface PnrData {
	pnr: string;
	trainNumber?: string;
	train: string;
	class: string;
	date: string;
	from: string;
	fromCode?: string;
	to: string;
	toCode?: string;
	departure: string;
	departureDate?: string;
	arrival: string;
	arrivalDate?: string;
	duration?: string;
	chartStatus?: string;
	passengers: Passenger[];
	coachPosition?: string;
	expectedPlatformNo?: string;
	ticketFare?: string | number;
	ratings?: {
		overall?: number;
		cleanliness?: number;
		punctuality?: number;
		food?: number;
	};
	benefits?: PnrIntelligenceBenefit[];
	error?: string;
}

export interface ScheduleStation {
	stationCode: string;
	stationName: string;
	arrivalTime: string;
	departureTime: string;
	dayCount: number;
	distance: number;
	haltTime?: string;
	stoppageNumber?: number;
	platformNumber?: string;
}

export interface TrainScheduleResponse {
	trainNumber: string;
	trainName: string;
	stations: ScheduleStation[];
	origin?: string;
	destination?: string;
	runningOn?: string;
	journeyClasses?: string[];
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

export interface LiveStatusStation {
	stationCode: string;
	stationName: string;
	arrivalTime: string;
	departureTime: string;
	haltTime?: string;
	distance: number;
	dayCount: number;
	stoppageNumber?: number;
	status?: string;
	actualArrivalDate?: string;
	actualDepartureDate?: string;
	actualArrivalTime?: string;
	actualDepartureTime?: string;
	expectedPlatform?: string;
	delayArrivalMinutes?: number;
	delayDepartureMinutes?: number;
}

export interface TrainLiveStatusResponse {
	trainNumber: string;
	trainName: string;
	currentStation?: string;
	terminated?: boolean;
	trainStatusMessage?: string;
	timeOfAvailability?: string;
	serverTimestamp?: string;
	stations: LiveStatusStation[];
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
	runsOnText?: string;
	availability?: {
		code: string;
		name: string;
		status: string;
		statusShortform?: string;
		availableFlag: boolean;
		fare?: number;
		timeOfAvailability?: string;
	}[];
	leastPrice?: number;
}

export interface SearchTrainsResponse {
	source: string;
	destination: string;
	sourceName: string;
	destinationName: string;
	trains: TrainSearchResultItem[];
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

export interface TrainFareResponse {
	trainNumber: string;
	trainName: string;
	from: string;
	to: string;
	classCode: string;
	quota: string;
	totalFare: number;
	fareBreakup?: {
		baseFare?: number;
		cateringCharge?: number;
		reservationCharge?: number;
		serviceTax?: number;
		superfastCharge?: number;
		dynamicFare?: number;
	};
	availableClasses?: {
		code: string;
		name: string;
		default?: boolean;
	}[];
	fareDetails?: PaytmFareDetailsItem[];
}

export interface StationSuggestion {
	code: string;
	name: string;
	displayName: string;
	state?: string;
}
