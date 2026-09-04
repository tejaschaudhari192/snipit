import mongoose, { Schema } from "mongoose";
import type { IPnrTracking } from "../types/pnr-tracking.types.js";

const PassengerSnapshotSchema = new Schema(
	{
		number: { type: Number, required: true },
		name: { type: String },
		status: { type: String, required: true },
		bookingStatus: { type: String },
		confirmTktStatus: { type: String },
		coach: { type: String },
		berth: { type: Schema.Types.Mixed },
	},
	{ _id: false },
);

const PnrStatusSnapshotSchema = new Schema(
	{
		chartStatus: { type: String },
		passengers: { type: [PassengerSnapshotSchema], default: [] },
		coachPosition: { type: String },
		expectedPlatformNo: { type: String },
		capturedAt: { type: Date, default: Date.now },
	},
	{ _id: false },
);

const StatusHistoryEntrySchema = new Schema(
	{
		timestamp: { type: Date, default: Date.now },
		changeSummary: { type: String, required: true },
		changes: { type: [String], default: [] },
		previousStatus: { type: Schema.Types.Mixed },
		newStatus: { type: Schema.Types.Mixed },
	},
	{ _id: false },
);

const PnrTrackingSchema = new Schema<IPnrTracking>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		userEmail: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		pnr: {
			type: String,
			required: true,
			trim: true,
			match: [/^\d{10}$/, "PNR must be exactly 10 digits"],
			index: true,
		},
		trainNumber: { type: String, required: true, trim: true },
		trainName: { type: String, default: "Train", trim: true },
		from: { type: String, default: "", trim: true },
		fromCode: { type: String, trim: true },
		to: { type: String, default: "", trim: true },
		toCode: { type: String, trim: true },
		departureDate: { type: String, default: "", trim: true },
		lastStatus: {
			type: PnrStatusSnapshotSchema,
			required: true,
		},
		statusHistory: {
			type: [StatusHistoryEntrySchema],
			default: [],
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		notifyEmail: {
			type: Boolean,
			default: true,
		},
		lastCheckedAt: {
			type: Date,
		},
		nextCheckAt: {
			type: Date,
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true, versionKey: false },
		toObject: { virtuals: true, versionKey: false },
	},
);

// Compound unique index: A user can only have one tracking record per PNR
PnrTrackingSchema.index({ pnr: 1, userId: 1 }, { unique: true });

// Compound index for high-speed scheduler queries
PnrTrackingSchema.index({ isActive: 1, nextCheckAt: 1 });

export const PnrTracking = mongoose.model<IPnrTracking>(
	"PnrTracking",
	PnrTrackingSchema,
);

export default PnrTracking;
