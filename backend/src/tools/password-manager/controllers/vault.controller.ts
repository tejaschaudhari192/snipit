import type { Response, NextFunction } from "express";
import { AppError } from "@/lib/errors.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import { vaultService } from "../services/vault.service.js";
import User from "@/models/User.js";
import Vault from "../models/Vault.js";

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

		const vaultData = await vaultService.getUserVault(String(req.user._id));

		if (!vaultData) {
			return res.status(200).json({
				success: true,
				data: null,
				message: "No cloud vault found for this user",
			});
		}

		res.status(200).json({
			success: true,
			data: vaultData,
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

		const {
			encryptedPersonalKey,
			encryptedSettings,
			publicKey,
			encryptedPrivateKey,
			salt,
		} = req.body;

		const updateData: any = { updatedAt: new Date() };
		if (encryptedPersonalKey)
			updateData.encryptedPersonalKey = encryptedPersonalKey;
		if (salt) updateData.salt = salt;
		if (encryptedSettings !== undefined)
			updateData.encryptedSettings = encryptedSettings;

		const vault = await Vault.findOneAndUpdate(
			{ userId: req.user._id },
			updateData,
			{ new: true, upsert: true },
		);

		if (publicKey && encryptedPrivateKey) {
			await User.findByIdAndUpdate(req.user._id, {
				publicKey,
				encryptedPrivateKey,
			});
		}

		res.status(200).json({
			success: true,
			data: {
				updatedAt: vault.updatedAt,
				version: vault.version,
			},
			message: "Vault synced to cloud successfully",
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Delete the current user's encrypted vault and all associated data
 * @route DELETE /api/tools/password-manager/vault
 * @access Private
 */
export const deleteVault = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		await vaultService.resetUserVault(String(req.user._id));

		res.status(200).json({
			success: true,
			message: "Vault and all associated data deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};
