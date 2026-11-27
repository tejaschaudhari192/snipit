import mongoose, { Schema } from "mongoose";
import type { CollaboratorData } from "@/types/index.js";
import { ROLES } from "@/config/constants.js";

export type ICollaborator = mongoose.Document & CollaboratorData;

const collaboratorSchema = new Schema<ICollaborator>(
	{
		pasteId: { type: String, required: false, index: true },
		folderId: {
			type: Schema.Types.ObjectId,
			ref: "Folder",
			required: false,
			index: true,
		},
		resourceType: {
			type: String,
			enum: ["paste", "folder"],
			default: "paste",
			index: true,
		},
		email: { type: String, required: true, index: true },
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: false,
			index: true,
		},
		role: {
			type: String,
			enum: ROLES,
			required: true,
		},
		createdAt: { type: Date, default: Date.now },
	},
	{
		toJSON: { virtuals: true, versionKey: false },
		toObject: { virtuals: true, versionKey: false },
	},
);

// Compound partial unique indexes per resource type
collaboratorSchema.index(
	{ pasteId: 1, email: 1 },
	{
		unique: true,
		partialFilterExpression: { pasteId: { $type: "string" } },
	},
);

collaboratorSchema.index(
	{ folderId: 1, email: 1 },
	{
		unique: true,
		partialFilterExpression: { folderId: { $type: "objectId" } },
	},
);

const collaboratorModel = mongoose.model<ICollaborator>(
	"collaborator",
	collaboratorSchema,
);
export default collaboratorModel;
