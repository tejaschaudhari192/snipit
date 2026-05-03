import LabelModel from "@/models/Label.js";
import pasteModel from "@/models/Paste.js";
import mongoose from "mongoose";

export class LabelService {
	/**
	 * Private helper to fetch snippets with their associated labels for a specific user.
	 * This centralizes the aggregation logic for scalability and easier maintenance.
	 */
	private static async getSnippetsWithLabels(
		userId: string,
		matchQuery: any,
	) {
		return await pasteModel.aggregate([
			{ $match: matchQuery },
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: "labels",
					let: { paste_id: "$id" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$pasteId", "$$paste_id"] },
										{
											$eq: [
												"$userId",
												new mongoose.Types.ObjectId(
													userId,
												),
											],
										},
									],
								},
							},
						},
					],
					as: "labelData",
				},
			},
			{
				$addFields: {
					labels: {
						$ifNull: [
							{ $arrayElemAt: ["$labelData.labels", 0] },
							[],
						],
					},
				},
			},
			{ $project: { labelData: 0 } },
		]);
	}

	static async getLabelsForSnippet(userId: string, pasteId: string) {
		const labelDoc = await LabelModel.findOne({ userId, pasteId });
		return labelDoc?.labels || [];
	}

	static async updateLabelsForSnippet(
		userId: string,
		pasteId: string,
		labels: string[],
	) {
		const snippet = await pasteModel.findOne({ id: pasteId });
		if (!snippet) throw new Error("Snippet not found");

		const labelDoc = await LabelModel.findOneAndUpdate(
			{ userId, pasteId },
			{ labels: labels.map((l) => l.trim().toLowerCase()) }, // Sanitize
			{ upsert: true, new: true },
		);

		return labelDoc.labels;
	}

	static async getAllUserLabels(userId: string) {
		return await LabelModel.distinct("labels", { userId });
	}

	static async getSnippetsByLabel(userId: string, label: string) {
		const labelDocs = await LabelModel.find({ userId, labels: label });
		const pasteIds = labelDocs.map((doc) => doc.pasteId);
		return LabelService.getSnippetsWithLabels(userId, {
			id: { $in: pasteIds },
		});
	}

	static async getSavedSnippets(userId: string) {
		const labelDocs = await LabelModel.find({ userId });
		const pasteIds = labelDocs.map((doc) => doc.pasteId);

		return LabelService.getSnippetsWithLabels(userId, {
			id: { $in: pasteIds },
			owner: { $ne: userId },
		});
	}

	static async saveSnippet(userId: string, pasteId: string) {
		const existing = await LabelModel.findOne({ userId, pasteId });

		if (existing) {
			await LabelModel.findOneAndDelete({ userId, pasteId });
			return { saved: false };
		} else {
			await LabelModel.create({ userId, pasteId, labels: [] });
			return { saved: true };
		}
	}
}
