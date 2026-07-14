import type { Response, NextFunction } from "express";
import VaultItem from "../models/VaultItem.js";
import CollectionAccess from "../models/CollectionAccess.js";
import { AppError } from "@/lib/errors.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import mongoose from "mongoose";

/**
 * Get all vault items for the user (personal + shared)
 * @route GET /api/tools/password-manager/vault/items
 */
export const getVaultItems = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const userId = new mongoose.Types.ObjectId(req.user._id.toString());
		// Use aggregation pipeline to get items the user owns OR has access to via collections
		const items = await VaultItem.aggregate([
			{
				$lookup: {
					from: "collectionaccesses",
					let: { collectionId: "$collectionId" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$collectionId", "$$collectionId"] },
										{ $eq: ["$userId", userId] }
									]
								}
							}
						}
					],
					as: "access"
				}
			},
			{
				$match: {
					$or: [
						{ userId: userId },
						{ "access.0": { $exists: true } }
					]
				}
			}
		]);

		res.status(200).json({
			success: true,
			data: items.map(item => ({
				id: item.id,
				collectionId: item.collectionId,
				encryptedPayload: item.encryptedPayload,
				updatedAt: item.updatedAt
			})),
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Create a new encrypted vault item
 * @route POST /api/tools/password-manager/vault/items
 */
export const createVaultItem = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { id, collectionId, encryptedPayload } = req.body;

		if (!id || !encryptedPayload) {
			return next(new AppError("id and encryptedPayload are required", 400));
		}

		// Check if user has access to collection if provided
		if (collectionId) {
			const access = await CollectionAccess.findOne({
				collectionId,
				userId: req.user._id,
			});
			if (!access || access.role === "viewer") {
				return next(
					new AppError("Not authorized to create items in this collection", 403)
				);
			}
		}

		const item = await VaultItem.create({
			id,
			userId: req.user._id,
			collectionId: collectionId || null,
			encryptedPayload,
		});

		res.status(201).json({
			success: true,
			data: { id: item.id, updatedAt: item.updatedAt },
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Update a vault item
 * @route PUT /api/tools/password-manager/vault/items/:id
 */
export const updateVaultItem = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { id } = req.params;
		const { encryptedPayload, collectionId } = req.body;

		if (!encryptedPayload) {
			return next(new AppError("encryptedPayload is required", 400));
		}

		const userId = new mongoose.Types.ObjectId(req.user._id.toString());
		const [itemData] = await VaultItem.aggregate([
			{ $match: { id } },
			{
				$lookup: {
					from: "collectionaccesses",
					let: { collectionId: "$collectionId" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$collectionId", "$$collectionId"] },
										{ $eq: ["$userId", userId] }
									]
								}
							}
						}
					],
					as: "access"
				}
			}
		]);

		if (!itemData) {
			return next(new AppError("Item not found", 404));
		}

		// Verify permissions
		const isOwner = itemData.userId.toString() === req.user._id.toString();
		const hasAccess = itemData.access && itemData.access.length > 0;
		const accessRole = hasAccess ? itemData.access[0].role : null;

		if (!isOwner) {
			if (!hasAccess || accessRole === "viewer") {
				return next(new AppError("Not authorized to edit this item", 403));
			}
		}

		const item = await VaultItem.findOne({ id });
		if (!item) return next(new AppError("Item not found", 404)); // should not happen

		// If moving to a new collection, verify they have permission to that destination collection
		if (collectionId !== undefined && collectionId !== (item.collectionId ? item.collectionId.toString() : null)) {
			if (collectionId) {
				const destAccess = await CollectionAccess.findOne({
					collectionId,
					userId: req.user._id,
				});
				if (!destAccess || destAccess.role === "viewer") {
					return next(new AppError("Not authorized to move items into this collection", 403));
				}
				item.collectionId = collectionId;
			} else {
				item.collectionId = null;
			}
		}

		item.encryptedPayload = encryptedPayload;
		await item.save();

		res.status(200).json({
			success: true,
			data: { id: item.id, updatedAt: item.updatedAt },
		});


	} catch (error) {
		next(error);
	}
};

/**
 * Delete a vault item
 * @route DELETE /api/tools/password-manager/vault/items/:id
 */
export const deleteVaultItem = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { id } = req.params;

		const [itemData] = await VaultItem.aggregate([
			{ $match: { id } },
			{
				$lookup: {
					from: "collectionaccesses",
					let: { collectionId: "$collectionId" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$collectionId", "$$collectionId"] },
										{ $eq: ["$userId", req.user._id] }
									]
								}
							}
						}
					],
					as: "access"
				}
			}
		]);

		if (!itemData) {
			return next(new AppError("Item not found", 404));
		}

		// Verify permissions
		const isOwner = itemData.userId.toString() === req.user._id.toString();
		const hasAccess = itemData.access && itemData.access.length > 0;
		const accessRole = hasAccess ? itemData.access[0].role : null;

		if (!isOwner) {
			if (!hasAccess || accessRole === "viewer") {
				return next(new AppError("Not authorized to delete this item", 403));
			}
		}

		await VaultItem.deleteOne({ id });

		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (error) {
		next(error);
	}
};
