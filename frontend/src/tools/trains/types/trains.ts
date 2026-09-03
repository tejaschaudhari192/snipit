export interface Passenger {
	number: number;
	name: string;
	status: string;
	bookingStatus?: string;
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
