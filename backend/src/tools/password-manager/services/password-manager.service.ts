import VaultItem from "../models/VaultItem.js";
import CollectionAccess from "../models/CollectionAccess.js";
import Collection from "../models/Collection.js";
import mongoose from "mongoose";

export class PasswordManagerService {
	/**
	 * Get all items (owned or shared via collections)
	 */
	async getItemsForUser(userIdStr: string) {
		const userId = new mongoose.Types.ObjectId(userIdStr);
		return await VaultItem.aggregate([
			{
				$lookup: {
					from: "collectionaccesses",
					let: { collectionId: "$collectionId" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												"$collectionId",
												"$$collectionId",
											],
										},
										{ $eq: ["$userId", userId] },
									],
								},
							},
						},
					],
					as: "access",
				},
			},
			{
				$match: {
					$or: [
						{ userId: userId },
						{ "access.0": { $exists: true } },
					],
				},
			},
		]);
	}

	/**
	 * Create single vault item
	 */
	async createItem(userId: string, data: any) {
		return await VaultItem.create({
			userId,
			...data,
		});
	}

	/**
	 * Batch upsert items (Sync local to cloud)
	 */
	async syncItems(userId: string, items: any[]) {
		const syncedIds: string[] = [];

		for (const item of items) {
			const filter = item._id
				? { _id: item._id, userId }
				: { itemId: item.itemId, userId };

			const updated = await VaultItem.findOneAndUpdate(
				filter,
				{
					...item,
					userId,
					updatedAt: new Date(),
				},
				{ upsert: true, new: true },
			);
			syncedIds.push(updated._id.toString());
		}

		return syncedIds;
	}

	/**
	 * Delete vault item
	 */
	async deleteItem(userId: string, itemId: string) {
		const item = await VaultItem.findOne({ _id: itemId, userId });
		if (!item) return false;
		await item.deleteOne();
		return true;
	}
}

export const passwordManagerService = new PasswordManagerService();
