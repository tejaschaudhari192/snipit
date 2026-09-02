import type { IExpiredPaste } from "@/types/index.js";
import mongoose, { Schema } from "mongoose";

const expiredPasteSchema = new Schema<IExpiredPaste>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		content: {
			type: String,
			required: true,
		},
		contentMode: {
			type: String,
			required: true,
		},
		originalExpiresAt: {
			type: Date,
			required: true,
		},
		originalCreatedAt: {
			type: Date,
			required: true,
		},
		archivedAt: {
			type: Date,
			default: Date.now,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
		visibility: {
			type: String,
			required: false,
		},
		language: {
			type: String,
			required: false,
		},
	},
	{
		toJSON: { virtuals: true, versionKey: false },
		toObject: { virtuals: true, versionKey: false },
	},
);

const expiredPasteModel = mongoose.model<IExpiredPaste>(
	"expired_paste",
	expiredPasteSchema,
);
export default expiredPasteModel;
