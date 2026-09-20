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

export interface RailTcExplanationDriver {
	key: string;
	label: string;
	effect: "helps" | "hurts";
	points: number;
	detail: string;
}

export interface RailTcExplanation {
	action: string;
	drivers: RailTcExplanationDriver[];
}

export interface RailTcCalibration {
	applied: boolean;
	anchorPct: number;
	anchorSample: number;
	band: string;
	kind: string;
	situationalDelta: number;
	rawProbability: number;
	sourceDate: string;
}

export interface RailTcPredictionFactors {
	currentStatus: string;
	wlNumber: number;
	daysLeft: number;
	quota: string;
	class: string;
	chartStatus: string;
	routeAdjustment: number;
	routeMessage?: string | null;
	decisionSource: "rule_engine" | "ml_live" | string;
	mlLiveSkippedReason?: string | null;
	mlModelName?: string;
	mlBucket?: string;
	mlThresholdSource?: string;
}

export interface RailTcScoreBreakdown {
	baseScore: number;
	wlPenalty: number;
	quotaPenalty: number;
	effectiveQuota: string;
	classPenalty: number;
	daysAdjustment: number;
	routeAdjustment: number;
	calibration?: RailTcCalibration;
}

export interface RailTcPassengerPrediction {
	passengerNumber: number;
	status: string;
	probability: number;
	riskLevel: string;
	message: string;
	breakdown?: RailTcScoreBreakdown;
}

export interface RailTcDailyTrend {
	date: string;
	wlChecked: number;
	wlToRac: number;
	wlToCnf: number;
	confirmedTotal: number;
}

export interface RailTcRouteStats {
	dataScopeLabel: string;
	recentConfirmedCount: number;
	daysSampled: number;
	wlToCnfRate: number;
	wlToRacRate: number;
	racToCnfRate: number;
	typicalClearWindow: string;
	practicalRangeMax: number;
	maxObservedWl: number;
	dailyTrend?: RailTcDailyTrend[];
}

export interface RailTcMlModelInfo {
	modelName: string;
	modelTarget: string;
	modelRole: string;
	probability: number;
	probabilityRaw?: number;
	bucket: string;
	safeThreshold?: number;
	riskyThreshold?: number;
	thresholdSource?: string;
	generatedAt?: string;
}

export interface RailTcPrediction {
	probability: number;
	riskLevel: string;
	message: string;
	predictionBucket: string;
	bucketDisplay: string;
	mediumHint?: string | null;
	factors: RailTcPredictionFactors;
	passengerPredictions: RailTcPassengerPrediction[];
	predictionSource: "rule_engine" | "ml_live" | string;
	predictionSourceReason: string;
	rulePrediction: { probability: number; riskLevel: string };
	explanation: RailTcExplanation;
	breakdown?: RailTcScoreBreakdown;
	mlLive?: RailTcMlModelInfo | null;
	mlShadow?: RailTcMlModelInfo | null;
	routeStats?: RailTcRouteStats;
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
	boardingDayCount?: number;
	arrivalDayCount?: number;
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
	railtcPrediction?: RailTcPrediction;
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
	origin: string;
	destination: string;
	runningOn: string;
	journeyClasses?: string[];
}

export interface TrainSearchResult {
	trainNumber: string;
	trainName: string;
	origin?: string;
	destination?: string;
	stationFrom?: string;
	stationTo?: string;
	runningOn?: string;
	journeyClasses?: string[];
	schedule?: ScheduleStation[];
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

export interface PnrTrackingItem {
	_id: string;
	pnr: string;
	trainNumber: string;
	trainName: string;
	from: string;
	fromCode?: string;
	to: string;
	toCode?: string;
	departureDate: string;
	isActive: boolean;
	notifyEmail: boolean;
	alertRecipients?: string[];
	lastCheckedAt?: string;
	nextCheckAt: string;
	createdAt: string;
	statusHistory?: {
		timestamp: string;
		changeSummary: string;
		changes: string[];
	}[];
}

export interface PnrTrackingStatusResponse {
	isTracked?: boolean;
	isTracking?: boolean;
	tracking?: PnrTrackingItem | null;
}

export interface PnrSharePayload {
	recipients: string[];
	note?: string;
	subscribeAlerts: boolean;
	ticketData?: PnrData;
}

export interface PnrShareResponse {
	success: boolean;
	sentCount: number;
	recipients: string[];
	alertsSubscribed: boolean;
	message: string;
}

export interface PnrRecipientsResponse {
	success: boolean;
	pnr: string;
	isTrackingActive: boolean;
	alertRecipients: string[];
}
