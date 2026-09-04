import type { Document, Types } from "mongoose";

export interface IPassengerSnapshot {
	number: number;
	name?: string | undefined;
	status: string;
	bookingStatus?: string | undefined;
	confirmTktStatus?: string | undefined;
	coach?: string | undefined;
	berth?: string | number | undefined;
}

export interface IPnrStatusSnapshot {
	chartStatus?: string | undefined;
	passengers: IPassengerSnapshot[];
	coachPosition?: string | undefined;
	expectedPlatformNo?: string | undefined;
	capturedAt: Date;
}

export interface IStatusHistoryEntry {
	timestamp: Date;
	changeSummary: string;
	changes: string[];
	previousStatus?: Partial<IPnrStatusSnapshot> | undefined;
	newStatus?: Partial<IPnrStatusSnapshot> | undefined;
}

export interface IPnrTracking extends Document {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	userEmail: string;
	pnr: string;
	trainNumber: string;
	trainName: string;
	from: string;
	fromCode?: string | undefined;
	to: string;
	toCode?: string | undefined;
	departureDate: string;
	lastStatus: IPnrStatusSnapshot;
	statusHistory: IStatusHistoryEntry[];
	isActive: boolean;
	notifyEmail: boolean;
	lastCheckedAt?: Date | undefined;
	nextCheckAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface IPnrDiffResult {
	hasChanged: boolean;
	changes: string[];
	changeSummary: string;
	isConfirmed: boolean;
	isChartPrepared: boolean;
}
