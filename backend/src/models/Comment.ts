import mongoose, { Schema } from "mongoose";
import type { CommentData } from "@/types/index.js";

export type IComment = mongoose.Document & CommentData & { pasteId: string };

const commentSchema = new Schema<IComment>(
	{
		id: { type: String, required: true, unique: true },
		pasteId: { type: String, required: true, index: true },
		author: { type: String, required: true },
		content: { type: String, required: true },
		createdAt: { type: Date, default: Date.now },
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
	},
	{
		toJSON: { virtuals: true, versionKey: false },
		toObject: { virtuals: true, versionKey: false },
	},
);

const commentModel = mongoose.model<IComment>("comment", commentSchema);
export default commentModel;
