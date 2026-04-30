import type { IPaste } from "@/types/index.js";
import mongoose, { Schema } from "mongoose";
import {
	CONTENT_MODES,
	VISIBILITIES,
	EDIT_PERMISSIONS,
	ROLES,
} from "@/config/constants.js";

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
		contentMode: {
			type: String,
			enum: CONTENT_MODES,
			default: "text",
		},
		fileUrl: {
			type: String,
			required: false,
		},
		fileName: {
			type: String,
			required: false,
		},
		fileSize: {
			type: Number,
			required: false,
		},
		fileMimeType: {
			type: String,
			required: false,
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
			required: false,
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
			enum: VISIBILITIES,
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
			enum: EDIT_PERMISSIONS,
			default: "owner",
		},
		shareList: [
			{
				_id: false,
				email: { type: String, required: true },
				role: {
					type: String,
					enum: ROLES,
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
