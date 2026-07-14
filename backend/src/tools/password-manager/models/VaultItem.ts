import mongoose, { Schema, Document } from "mongoose";

export interface IVaultItem extends Document {
	id: string; // UUID string
	userId: mongoose.Types.ObjectId;
	collectionId: mongoose.Types.ObjectId | null;
	encryptedPayload: string;
	createdAt: Date;
	updatedAt: Date;
}

const vaultItemSchema = new Schema<IVaultItem>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		collectionId: {
			type: Schema.Types.ObjectId,
			ref: "Collection",
			default: null,
		},
		encryptedPayload: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

// Index for querying by user or collection
vaultItemSchema.index({ userId: 1 });
vaultItemSchema.index({ collectionId: 1 });

const VaultItem = mongoose.model<IVaultItem>("VaultItem", vaultItemSchema);
export default VaultItem;
