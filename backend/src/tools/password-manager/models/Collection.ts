import mongoose, { Schema, Document } from "mongoose";

export interface ICollection extends Document {
	name: string;
	createdBy: mongoose.Types.ObjectId;
	isHidden: boolean; // For ad-hoc single-item shares
	createdAt: Date;
	updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>(
	{
		name: {
			type: String,
			required: true,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isHidden: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

const Collection = mongoose.model<ICollection>("Collection", collectionSchema);
export default Collection;
