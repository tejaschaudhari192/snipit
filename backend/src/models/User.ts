import mongoose, { Schema } from "mongoose";
import type { IUser } from "@/types/index.js";

const userSchema = new Schema<IUser>(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: function (this: any) {
				return !this.googleId;
			},
		},
		googleId: {
			type: String,
			required: false,
			unique: true,
			sparse: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		resetPasswordToken: {
			type: String,
			required: false,
		},
		resetPasswordExpires: {
			type: Date,
			required: false,
		},
	},
	{
		toJSON: { virtuals: true, versionKey: false },
		toObject: { virtuals: true, versionKey: false },
	},
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
