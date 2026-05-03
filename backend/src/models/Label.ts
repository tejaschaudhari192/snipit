import mongoose, { Schema, Document } from "mongoose";

export interface ILabel extends Document {
	userId: mongoose.Types.ObjectId;
	pasteId: string;
	labels: string[];
	createdAt: Date;
	updatedAt: Date;
}

const labelSchema = new Schema<ILabel>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		pasteId: {
			type: String,
			required: true,
			index: true,
		},
		labels: {
			type: [String],
			default: [],
		},
	},
	{
		timestamps: true,
	},
);

// Unique constraint per user and paste for scalability and fast lookups
labelSchema.index({ userId: 1, pasteId: 1 }, { unique: true });

const LabelModel = mongoose.model<ILabel>("Label", labelSchema);

export default LabelModel;
