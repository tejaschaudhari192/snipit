import mongoose, { Schema } from "mongoose";
import type { IFolder } from "@/types/index.js";

const folderSchema = new Schema<IFolder>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		parentId: {
			type: Schema.Types.ObjectId,
			ref: "Folder",
			default: null,
			index: true,
		},
		path: {
			type: String,
			required: true,
			index: true,
		},
		color: {
			type: String,
			default: null,
		},
		icon: {
			type: String,
			default: null,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		toJSON: { virtuals: true, versionKey: false },
		toObject: { virtuals: true, versionKey: false },
	},
);

const folderModel = mongoose.model<IFolder>("folder", folderSchema);
export default folderModel;
