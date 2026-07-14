import mongoose, { Schema, Document } from "mongoose";

export interface ICollectionAccess extends Document {
	collectionId: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	encryptedCollectionKey: string;
	role: "owner" | "editor" | "viewer";
	createdAt: Date;
	updatedAt: Date;
}

const collectionAccessSchema = new Schema<ICollectionAccess>(
	{
		collectionId: {
			type: Schema.Types.ObjectId,
			ref: "Collection",
			required: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		encryptedCollectionKey: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ["owner", "editor", "viewer"],
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

// A user can only have one access entry per collection
collectionAccessSchema.index({ collectionId: 1, userId: 1 }, { unique: true });
collectionAccessSchema.index({ userId: 1 });

const CollectionAccess = mongoose.model<ICollectionAccess>(
	"CollectionAccess",
	collectionAccessSchema,
);
export default CollectionAccess;
