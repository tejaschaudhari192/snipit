import mongoose, { Schema, type Document } from "mongoose";

export interface ICompanionMemory {
	id: string;
	category: "fact" | "preference" | "story" | "inside_joke" | "observation";
	key: string;
	detail: string;
	importance?: number;
	createdAt: Date;
}

export interface ICompanionMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: Date;
}

export interface IUnresolvedThread {
	topic: string;
	dateMentioned: Date;
	resolved: boolean;
}

export interface ICompanionSession extends Document {
	userId: mongoose.Types.ObjectId;
	companionName: string;
	stage: "Discovery" | "Confidant" | "Intimate";
	mood: string;
	metrics: {
		turns: number;
		fondness: number;
		friction: number;
		intimacyScore: number;
	};
	memories: ICompanionMemory[];
	messages: ICompanionMessage[];
	unresolvedThreads: IUnresolvedThread[];
	createdAt: Date;
	updatedAt: Date;
}

const memorySubSchema = new Schema<ICompanionMemory>(
	{
		id: { type: String, required: true },
		category: {
			type: String,
			enum: ["fact", "preference", "story", "inside_joke", "observation"],
			default: "observation",
		},
		key: { type: String, required: true },
		detail: { type: String, required: true },
		importance: { type: Number, default: 1 },
		createdAt: { type: Date, default: Date.now },
	},
	{ _id: false },
);

const messageSubSchema = new Schema<ICompanionMessage>(
	{
		id: { type: String, required: true },
		role: {
			type: String,
			enum: ["user", "assistant", "system"],
			required: true,
		},
		content: { type: String, required: true },
		timestamp: { type: Date, default: Date.now },
	},
	{ _id: false },
);

const threadSubSchema = new Schema<IUnresolvedThread>(
	{
		topic: { type: String, required: true },
		dateMentioned: { type: Date, default: Date.now },
		resolved: { type: Boolean, default: false },
	},
	{ _id: false },
);

const companionSessionSchema = new Schema<ICompanionSession>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
			index: true,
		},
		companionName: {
			type: String,
			default: "",
			trim: true,
		},
		stage: {
			type: String,
			enum: ["Discovery", "Confidant", "Intimate"],
			default: "Discovery",
		},
		mood: {
			type: String,
			default: "Curious & observant",
		},
		metrics: {
			turns: { type: Number, default: 0 },
			fondness: { type: Number, default: 10 },
			friction: { type: Number, default: 0 },
			intimacyScore: { type: Number, default: 0 },
		},
		memories: [memorySubSchema],
		messages: [messageSubSchema],
		unresolvedThreads: [threadSubSchema],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true, versionKey: false },
		toObject: { virtuals: true, versionKey: false },
	},
);

const CompanionSession = mongoose.model<ICompanionSession>(
	"CompanionSession",
	companionSessionSchema,
);

export default CompanionSession;
