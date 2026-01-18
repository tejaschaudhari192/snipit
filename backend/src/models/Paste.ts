import type { IPaste } from "@/types/index.js";
import mongoose, { Schema } from "mongoose";

const pasteSchema = new Schema<IPaste>(
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
		redirectUrl: {
			type: Boolean,
			required: false,
			default: false,
		},
		language: {
			type: String,
			default: "text",
		},
		expiresAt: {
			type: Date,
			required: true,
			default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		burnAfterRead: {
			type: Boolean,
			default: false,
		},
		expiresTime: {
			type: String,
			default: "1d",
		},
		views: {
			type: Number,
			default: 0,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
		visibility: {
			type: String,
			enum: ["public", "private", "shared"],
			default: "public",
		},
		allowedUsers: {
			type: [String],
			default: [],
		},
		password: {
			type: String,
			required: false,
		},
		editPermission: {
			type: String,
			enum: ["owner", "shared", "public"],
			default: "owner",
		},
		shareList: [
			{
				_id: false,
				email: { type: String, required: true },
				role: {
					type: String,
					enum: ["viewer", "editor", "admin", "commenter"],
					required: true,
				},
			},
		],
		publicRole: {
			type: String,
			enum: ["viewer", "editor", "commenter"],
			default: "viewer",
		},
		allowComments: {
			type: Boolean,
			default: false,
		},
		comments: [
			{
				_id: false,
				id: { type: String, required: true },
				author: { type: String, required: true },
				content: { type: String, required: true },
				createdAt: { type: Date, default: Date.now },
				userId: {
					type: Schema.Types.ObjectId,
					ref: "User",
					required: false,
				},
			},
		],
	},
	{
		toJSON: { virtuals: true, versionKey: false },
		toObject: { virtuals: true, versionKey: false },
	},
);

const pasteModel = mongoose.model<IPaste>("paste", pasteSchema);
export default pasteModel;
