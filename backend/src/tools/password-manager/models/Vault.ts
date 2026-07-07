import mongoose, { Schema, Document } from "mongoose";

export interface IVault extends Document {
	userId: mongoose.Types.ObjectId;
	encryptedBlob: string;
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
