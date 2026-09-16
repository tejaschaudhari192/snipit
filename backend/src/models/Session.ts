import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ISession extends Document {
	userId: Types.ObjectId | string;
	deviceName: string;
	browser: string;
	os: string;
	deviceType: "desktop" | "mobile" | "tablet";
	ipAddress: string;
	lastActive: Date;
	expiresAt: Date;
	createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		deviceName: {
			type: String,
			default: "Unknown Device",
		},
		browser: {
			type: String,
			default: "Unknown Browser",
		},
		os: {
			type: String,
			default: "Unknown OS",
		},
		deviceType: {
			type: String,
			enum: ["desktop", "mobile", "tablet"],
			default: "desktop",
		},
		ipAddress: {
			type: String,
			default: "127.0.0.1",
		},
		lastActive: {
			type: Date,
			default: Date.now,
		},
		expiresAt: {
			type: Date,
			required: true,
			index: { expires: 0 }, // MongoDB TTL index to automatically purge expired sessions
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true, versionKey: false },
		toObject: { virtuals: true, versionKey: false },
	},
);

const Session = mongoose.model<ISession>("Session", sessionSchema);
export default Session;
