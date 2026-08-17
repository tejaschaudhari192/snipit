import folderModel from "@/models/Folder.js";
import pasteModel from "@/models/Paste.js";
import mongoose from "mongoose";

export class FolderService {
	static async createFolder(
		userId: string,
		data: {
			name: string;
			parentId?: string | null | undefined;
			color?: string | null | undefined;
			icon?: string | null | undefined;
		},
	) {
		let path = ",root,";
		const parentId = data.parentId || null;

		if (parentId) {
			const parent = await folderModel.findOne({
				_id: parentId,
				owner: userId,
			});
			if (!parent) {
				throw new Error("Parent folder not found");
			}
			path = `${parent.path}${parent._id},`;
		}

		const folder = new folderModel({
			name: data.name,
			owner: userId,
			parentId,
			path,
			color: data.color || null,
			icon: data.icon || null,
		});

		return await folder.save();
	}

	static async updateFolder(
		userId: string,
		folderId: string,
		data: {
			name?: string | undefined;
			color?: string | null | undefined;
			icon?: string | null | undefined;
		},
	) {
		const folder = await folderModel.findOne({
			_id: folderId,
			owner: userId,
		});
		if (!folder) {
			throw new Error("Folder not found");
		}

		if (data.name !== undefined) folder.name = data.name;
		if (data.color !== undefined) folder.color = data.color;
		if (data.icon !== undefined) folder.icon = data.icon;

		return await folder.save();
	}

	static async moveFolder(
		userId: string,
		folderId: string,
		newParentId: string | null,
	) {
		const folder = await folderModel.findOne({
			_id: folderId,
			owner: userId,
		});
		if (!folder) {
			throw new Error("Folder not found");
		}

		if (newParentId && newParentId.toString() === folderId.toString()) {
			throw new Error("Cannot move a folder into itself");
		}

		let newPath = ",root,";
		if (newParentId) {
			const newParent = await folderModel.findOne({
				_id: newParentId,
				owner: userId,
			});
			if (!newParent) {
				throw new Error("New parent folder not found");
			}

			// Check for circular reference
			const targetPathSegments = newParent.path.split(",");
			if (
				targetPathSegments.includes(folderId.toString()) ||
				newParentId.toString() === folderId.toString()
			) {
				throw new Error("Cannot move folder into its own descendant");
			}

			newPath = `${newParent.path}${newParent._id},`;
		}

		const oldDescendantPathPrefix = `${folder.path}${folder._id},`;
		const newDescendantPathPrefix = `${newPath}${folder._id},`;

		// 1. Update the folder parent and path
		folder.parentId = newParentId
			? new mongoose.Types.ObjectId(newParentId)
			: null;
		folder.path = newPath;
		await folder.save();

		// 2. Update all descendants paths
		const descendants = await folderModel.find({
			owner: userId,
			path: { $regex: `^${oldDescendantPathPrefix}` },
		});

		for (const desc of descendants) {
			desc.path = desc.path.replace(
				oldDescendantPathPrefix,
				newDescendantPathPrefix,
			);
			await desc.save();
		}

		return folder;
	}

	static async deleteFolder(userId: string, folderId: string) {
		const folder = await folderModel.findOne({
			_id: folderId,
			owner: userId,
		});
		if (!folder) {
			throw new Error("Folder not found");
		}

		const descendantPathPrefix = `${folder.path}${folder._id},`;
		const descendants = await folderModel.find({
			owner: userId,
			path: { $regex: `^${descendantPathPrefix}` },
		});

		const folderIds = [folder._id, ...descendants.map((d) => d._id)];

		// 1. Delete all folders in the hierarchy
		await folderModel.deleteMany({ _id: { $in: folderIds } });

		// 2. Orphan all child pastes to root
		await pasteModel.updateMany(
			{ owner: userId, folderId: { $in: folderIds } },
			{ $set: { folderId: null } },
		);

		return { success: true, deletedCount: folderIds.length };
	}

	static async getFoldersTree(userId: string) {
		return await folderModel.find({ owner: userId }).sort({ name: 1 });
	}

	static async getFolderContents(userId: string, folderId: string | null) {
		const fId = folderId ? new mongoose.Types.ObjectId(folderId) : null;
		const subfolders = await folderModel
			.find({ owner: userId, parentId: fId })
			.sort({ name: 1 });
		const snippets = await pasteModel
			.find({ owner: userId, folderId: fId })
			.sort({ createdAt: -1 });
		return { subfolders, snippets };
	}
}
