import type { Response, NextFunction } from "express";
import { AppError } from "@/lib/errors.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import { passwordManagerService } from "../services/password-manager.service.js";

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

		const items = await passwordManagerService.getItemsForUser(
			req.user._id.toString(),
		);

		res.status(200).json({
			success: true,
			data: items,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Create a single vault item
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

		const item = await passwordManagerService.createItem(
			req.user._id.toString(),
			req.body,
		);

		res.status(201).json({
			success: true,
			data: item,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Update a single vault item
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
		if (!id || typeof id !== "string") {
			return next(new AppError("Invalid or missing item ID", 400));
		}

		const updated = await passwordManagerService.syncItems(
			req.user._id.toString(),
			[{ ...req.body, _id: id }],
		);

		res.status(200).json({
			success: true,
			data: updated,
			message: "Item updated successfully",
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Batch sync vault items
 * @route POST /api/tools/password-manager/vault/items/sync
 */
export const syncVaultItems = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || !req.user._id) {
			return next(new AppError("User not authenticated", 401));
		}

		const { items } = req.body;
		if (!Array.isArray(items)) {
			return next(new AppError("Items array is required", 400));
		}

		const syncedIds = await passwordManagerService.syncItems(
			req.user._id.toString(),
			items,
		);

		res.status(200).json({
			success: true,
			data: syncedIds,
			message: "Items synced successfully",
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
		if (!id || typeof id !== "string") {
			return next(new AppError("Invalid or missing item ID", 400));
		}

		const deleted = await passwordManagerService.deleteItem(
			req.user._id.toString(),
			id,
		);

		if (!deleted) {
			return next(new AppError("Item not found or unauthorized", 404));
		}

		res.status(200).json({
			success: true,
			message: "Item deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};
