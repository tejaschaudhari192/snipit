import type { Response, NextFunction } from "express";
import Vault, { type IVault } from "../models/Vault.js";
import User from "@/models/User.js";
import { AppError } from "@/lib/errors.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import VaultItem from "../models/VaultItem.js";
import Collection from "../models/Collection.js";
import CollectionAccess from "../models/CollectionAccess.js";

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

		// We also want to return the user's public and encrypted private key
		const user = await User.findById(req.user._id);

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
				encryptedPersonalKey: vault.encryptedPersonalKey,
				encryptedSettings: vault.encryptedSettings,
				updatedAt: vault.updatedAt,
				version: vault.version,
				salt: vault.salt,
				publicKey: user?.publicKey,
				encryptedPrivateKey: user?.encryptedPrivateKey,
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

		const { encryptedPersonalKey, encryptedSettings, publicKey, encryptedPrivateKey, salt } = req.body;

		const updateData: Partial<IVault> = {
			updatedAt: new Date(),
		};
		if (encryptedPersonalKey) {
			updateData.encryptedPersonalKey = encryptedPersonalKey;
		}
		if (salt) {
			updateData.salt = salt;
		}
		if (encryptedSettings !== undefined) {
			updateData.encryptedSettings = encryptedSettings;
		}

		const vault = await Vault.findOneAndUpdate(
			{ userId: req.user._id },
			updateData,
			{ new: true, upsert: true }, // Create if it doesn't exist
		);

		// If public/private keys are provided (initial setup), update user
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

		const userId = req.user._id;

		// 1. Delete all vault items
		await VaultItem.deleteMany({ userId });

		// 2. Delete all collections created by the user
		await Collection.deleteMany({ createdBy: userId });

		// 3. Delete all collection accesses for the user
		await CollectionAccess.deleteMany({ userId });

		// 4. Delete the vault itself
		await Vault.deleteOne({ userId });

		// 5. Unset the user's public and private keys
		await User.findByIdAndUpdate(userId, {
			$unset: { publicKey: "", encryptedPrivateKey: "" },
		});

		res.status(200).json({
			success: true,
			message: "Vault and all associated data deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};

