import type { Response, NextFunction } from "express";
import Collection from "../models/Collection.js";
import CollectionAccess from "../models/CollectionAccess.js";
import { AppError } from "@/lib/errors.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";

/**
 * Get all collections the user owns or has access to
 * @route GET /api/tools/password-manager/vault/collections
 */
export const getCollections = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const accessList = await CollectionAccess.find({ userId: req.user._id })
			.populate("collectionId")
			.exec();

		const collections = accessList
			.map((access) => {
				const coll = access.collectionId as unknown as { _id: string; name: string; isHidden: boolean; updatedAt: Date };
				if (!coll) return null;
				return {
					id: coll._id,
					name: coll.name,
					isHidden: coll.isHidden,
					role: access.role,
					encryptedCollectionKey: access.encryptedCollectionKey,
					updatedAt: coll.updatedAt,
				};
			})
			.filter(Boolean);

		res.status(200).json({
			success: true,
			data: collections,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Create a new collection
 * @route POST /api/tools/password-manager/vault/collections
 */
export const createCollection = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { name, isHidden, encryptedCollectionKey } = req.body;

		if (!name || !encryptedCollectionKey) {
			return next(
				new AppError("name and encryptedCollectionKey are required", 400)
			);
		}

		const collection = await Collection.create({
			name,
			isHidden: isHidden || false,
			createdBy: req.user._id,
		});

		// Create the owner access row
		const access = await CollectionAccess.create({
			collectionId: collection._id,
			userId: req.user._id,
			encryptedCollectionKey,
			role: "owner",
		});

		res.status(201).json({
			success: true,
			data: {
				id: collection._id,
				name: collection.name,
				isHidden: collection.isHidden,
				role: access.role,
				encryptedCollectionKey: access.encryptedCollectionKey,
				updatedAt: collection.updatedAt,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Delete a collection
 * @route DELETE /api/tools/password-manager/vault/collections/:id
 */
export const deleteCollection = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { id } = req.params;

		const collection = await Collection.findById(id);
		if (!collection) {
			return next(new AppError("Collection not found", 404));
		}

		if (collection.createdBy.toString() !== req.user._id.toString()) {
			return next(new AppError("Only the owner can delete a collection", 403));
		}

		// Delete all access rows
		await CollectionAccess.deleteMany({ collectionId: id });
		
		// Note: The items should also be deleted or orphaned.
		// For now we will rely on client to delete items or server to clean up.
		
		await collection.deleteOne();

		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (error) {
		next(error);
	}
};
