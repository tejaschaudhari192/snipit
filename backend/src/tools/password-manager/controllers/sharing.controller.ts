import type { Response, NextFunction } from "express";
import User from "@/models/User.js";
import Collection from "../models/Collection.js";
import CollectionAccess from "../models/CollectionAccess.js";
import { AppError } from "@/lib/errors.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import EmailService from "@/services/email.service.js";
import configurations from "@/config/configurations.js";
import mongoose from "mongoose";
import VaultItem from "../models/VaultItem.js";

/**
 * Lookup a user's public key by email
 * @route POST /api/tools/password-manager/vault/share/lookup
 */
export const lookupUserPublicKey = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { email } = req.body;
		if (!email) {
			return next(new AppError("Email is required", 400));
		}

		const targetUser = await User.findOne({ email: email.toLowerCase() });
		if (!targetUser) {
			return next(new AppError("User not found", 404));
		}
		if (!targetUser.publicKey) {
			return next(new AppError("User has not set up their secure vault", 400));
		}

		res.status(200).json({
			success: true,
			data: {
				userId: targetUser._id,
				email: targetUser.email,
				publicKey: targetUser.publicKey,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Share a collection with a user
 * @route POST /api/tools/password-manager/vault/share
 */
export const shareCollection = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { collectionId, targetUserId, encryptedCollectionKey, role } = req.body;

		if (!collectionId || !targetUserId || !encryptedCollectionKey || !role) {
			return next(new AppError("Missing required fields", 400));
		}

		// Verify owner
		const collection = await Collection.findById(collectionId);
		if (!collection) {
			return next(new AppError("Collection not found", 404));
		}
		if (collection.createdBy.toString() !== req.user._id.toString()) {
			return next(new AppError("Only the owner can share a collection", 403));
		}

		// Upsert access
		const access = await CollectionAccess.findOneAndUpdate(
			{ collectionId, userId: targetUserId },
			{
				encryptedCollectionKey,
				role,
			},
			{ new: true, upsert: true }
		);


		res.status(200).json({
			success: true,
			data: access,
		});

		// Send email notification in the background
		try {
			const targetUserDoc = await User.findById(targetUserId);
			if (targetUserDoc && targetUserDoc.email) {
				const emailService = new EmailService();
				const collectionUrl = `${configurations.domain}/tools/password-manager`;
				await emailService.sendVaultAccessGrantedEmail(
					targetUserDoc.email,
					role as "viewer" | "editor" | "admin",
					collection.name || "Shared Collection",
					collectionUrl
				);
			}
		} catch (emailError) {
			console.error("Failed to send share notification email:", emailError);
		}
	} catch (error) {
		next(error);
	}
};

/**
 * Share a single item (creates hidden collection, accesses, and item)
 * @route POST /api/tools/password-manager/vault/share/item
 */
export const shareItem = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const {
			targetUserId,
			encryptedCollectionKeyForOwner,
			encryptedCollectionKeyForRecipient,
			role,
			itemId,
			encryptedPayload,
			itemTitle,
		} = req.body;

		if (
			!targetUserId ||
			!encryptedCollectionKeyForOwner ||
			!encryptedCollectionKeyForRecipient ||
			!role ||
			!itemId ||
			!encryptedPayload
		) {
			return next(new AppError("Missing required fields", 400));
		}

		// 1. Create hidden collection
		const collection = await Collection.create({
			name: itemTitle || "Shared Item",
			isHidden: true,
			createdBy: req.user._id,
		});

		// 2. Create access for owner
		await CollectionAccess.create({
			collectionId: collection._id,
			userId: req.user._id,
			encryptedCollectionKey: encryptedCollectionKeyForOwner,
			role: "owner",
		});

		// 3. Create access for recipient
		await CollectionAccess.create({
			collectionId: collection._id,
			userId: targetUserId,
			encryptedCollectionKey: encryptedCollectionKeyForRecipient,
			role,
		});

		// 4. Upsert the VaultItem (it might already exist as a personal item)
		const vaultItem = await VaultItem.findOneAndUpdate(
			{ id: itemId },
			{
				userId: req.user._id,
				collectionId: collection._id,
				encryptedPayload,
			},
			{ new: true, upsert: true }
		);



		res.status(201).json({
			success: true,
			data: { collectionId: collection._id, itemId: vaultItem.id },
		});

		// Send email notification
		try {
			const targetUserDoc = await User.findById(targetUserId);
			if (targetUserDoc && targetUserDoc.email) {
				const emailService = new EmailService();
				const collectionUrl = `${configurations.domain}/tools/password-manager`;
				await emailService.sendVaultAccessGrantedEmail(
					targetUserDoc.email,
					role as "viewer" | "editor" | "admin",
					itemTitle || "a password",
					collectionUrl
				);
			}
		} catch (emailError) {
			console.error("Failed to send share notification email:", emailError);
		}
	} catch (error) {
		next(error);
	}
};

/**
 * Share a folder with a user (bulk share)
 * @route POST /api/tools/password-manager/vault/share/folder
 */
export const shareFolder = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { targetUserId, encryptedCollectionKeyForOwner, encryptedCollectionKeyForRecipient, role, folderName, items } = req.body;

		if (!targetUserId || !encryptedCollectionKeyForOwner || !encryptedCollectionKeyForRecipient || !role || !folderName || !items) {
			return next(new AppError("Missing required fields", 400));
		}

		// 1. Create a visible Collection for the folder
		const collection = await Collection.create({
			name: folderName,
			createdBy: req.user._id,
			isHidden: false,
		});

		// 2. Create access for owner
		await CollectionAccess.create({
			collectionId: collection._id,
			userId: req.user._id,
			encryptedCollectionKey: encryptedCollectionKeyForOwner,
			role: "owner",
		});

		// 3. Create access for recipient
		await CollectionAccess.create({
			collectionId: collection._id,
			userId: targetUserId,
			encryptedCollectionKey: encryptedCollectionKeyForRecipient,
			role,
		});

		// 4. Bulk Upsert VaultItems
		const ops = items.map((item: { id: string; encryptedPayload: string }) => ({
			updateOne: {
				filter: { id: item.id },
				update: {
					$set: {
						userId: req.user?._id,
						collectionId: collection._id,
						encryptedPayload: item.encryptedPayload,
					}
				},
				upsert: true
			}
		}));

		if (ops.length > 0) {
			await VaultItem.bulkWrite(ops);
		}


		res.status(201).json({
			success: true,
			data: { collectionId: collection._id },
		});

		// Send email notification
		try {
			const targetUserDoc = await User.findById(targetUserId);
			if (targetUserDoc && targetUserDoc.email) {
				const emailService = new EmailService();
				const collectionUrl = `${configurations.domain}/tools/password-manager`;
				await emailService.sendVaultAccessGrantedEmail(
					targetUserDoc.email,
					role as "viewer" | "editor" | "admin",
					folderName,
					collectionUrl
				);
			}
		} catch (emailError) {
			console.error("Failed to send share notification email:", emailError);
		}
	} catch (error) {
		next(error);
	}
};

/**
 * Get access list for a collection
 * @route GET /api/tools/password-manager/vault/share/:collectionId
 */
export const getCollectionAccess = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { collectionId } = req.params;

		// Verify owner
		const collection = await Collection.findById(collectionId);
		if (!collection) {
			return next(new AppError("Collection not found", 404));
		}
		if (collection.createdBy.toString() !== req.user._id.toString()) {
			return next(new AppError("Only the owner can view access list", 403));
		}

		const accessList = await CollectionAccess.aggregate([
			{ $match: { collectionId: new mongoose.Types.ObjectId(collectionId as string) } },
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user"
				}
			},
			{ $unwind: "$user" },
			{
				$project: {
					_id: 1,
					role: 1,
					userId: "$user._id",
					email: "$user.email",
					username: "$user.username"
				}
			}
		]);

		res.status(200).json({
			success: true,
			data: accessList.map(a => ({
				id: a._id,
				userId: a.userId,
				email: a.email,
				username: a.username,
				role: a.role,
			})),
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Revoke access to a collection
 * @route DELETE /api/tools/password-manager/vault/share/:accessId
 */
export const revokeAccess = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { accessId } = req.params;

		const access = await CollectionAccess.findById(accessId);
		if (!access) {
			return next(new AppError("Access record not found", 404));
		}

		if (access.role === "owner") {
			return next(new AppError("Cannot revoke owner access", 400));
		}

		const collection = await Collection.findById(access.collectionId);
		if (!collection || collection.createdBy.toString() !== req.user._id.toString()) {
			return next(new AppError("Only the owner can revoke access", 403));
		}

		await access.deleteOne();

		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (error) {
		next(error);
	}
};
