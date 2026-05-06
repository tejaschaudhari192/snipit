import mongoose, { Schema } from "mongoose";
import type { CollaboratorData } from "@/types/index.js";
import { ROLES } from "@/config/constants.js";

export type ICollaborator = mongoose.Document & CollaboratorData;

const collaboratorSchema = new Schema<ICollaborator>(
	{
		pasteId: { type: String, required: true, index: true },
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

// Compound index for unique collaborator per paste
collaboratorSchema.index({ pasteId: 1, email: 1 }, { unique: true });

const collaboratorModel = mongoose.model<ICollaborator>(
	"collaborator",
	collaboratorSchema,
);
export default collaboratorModel;
