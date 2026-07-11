import mongoose, { Schema, Document } from "mongoose";

export interface IVault extends Document {
	userId: mongoose.Types.ObjectId;
	encryptedBlob: string;
	version: number;
	updatedAt: Date;
}

const vaultSchema = new Schema<IVault>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		encryptedBlob: {
			type: String,
			required: true,
		},
		version: {
			type: Number,
			default: 0,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

const Vault = mongoose.model<IVault>("Vault", vaultSchema);
export default Vault;
