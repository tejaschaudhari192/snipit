import mongoose, { Schema, Document } from "mongoose";

export interface IVault extends Document {
	userId: mongoose.Types.ObjectId;
	encryptedPersonalKey: string;
	encryptedSettings?: string;
	salt: string;
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
		encryptedPersonalKey: {
			type: String,
			required: true,
		},
		encryptedSettings: {
			type: String,
			required: false,
		},
		salt: {
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
