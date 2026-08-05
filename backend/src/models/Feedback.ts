import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
	type: "bug" | "feature" | "general";
	title: string;
	description: string;
	userEmail?: string;
	userId?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
	{
		type: {
			type: String,
			enum: ["bug", "feature", "general"],
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		userEmail: {
			type: String,
			trim: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	},
);

const FeedbackModel = mongoose.model<IFeedback>("Feedback", feedbackSchema);

export default FeedbackModel;
