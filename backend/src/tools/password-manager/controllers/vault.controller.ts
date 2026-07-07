import type { Response, NextFunction } from "express";
import Vault from "../models/Vault.js";
import { AppError } from "@/lib/errors.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";

/**
 * Get the current user's encrypted vault
 * @route GET /api/tools/password-manager/vault
 * @access Private
 */
export const getVault = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const vault = await Vault.findOne({ userId: req.user._id });

		if (!vault) {
			return res.status(200).json({
				success: true,
				data: null,
				message: "No cloud vault found for this user",
			});
		}

		res.status(200).json({
			success: true,
			data: {
				encryptedBlob: vault.encryptedBlob,
				updatedAt: vault.updatedAt,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Update the current user's encrypted vault
 * @route PUT /api/tools/password-manager/vault
 * @access Private
 */
export const updateVault = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { encryptedBlob } = req.body;

		if (!encryptedBlob) {
			return next(new AppError("Encrypted vault blob is required", 400));
		}

		const vault = await Vault.findOneAndUpdate(
			{ userId: req.user._id },
			{
				encryptedBlob,
				updatedAt: new Date(),
			},
			{ new: true, upsert: true }, // Create if it doesn't exist
		);

		res.status(200).json({
			success: true,
			data: {
				updatedAt: vault.updatedAt,
			},
			message: "Vault synced to cloud successfully",
		});
	} catch (error) {
		next(error);
	}
};
