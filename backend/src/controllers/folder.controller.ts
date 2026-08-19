import type { Response } from "express";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import { FolderService } from "@/services/folder.service.js";
import {
	createFolderSchema,
	updateFolderSchema,
	moveFolderSchema,
} from "@/validators/folder.validators.js";

const handleRequest = async (
	req: AuthRequest,
	res: Response,
	serviceCall: (userId: string) => Promise<unknown>,
) => {
	try {
		const userId = req.user?._id;
		if (!userId) return res.status(401).json({ error: "Unauthorized" });
		const result = await serviceCall(userId.toString());
		return res.status(200).json(result);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Folder Controller Error: ${message}`);
		return res
			.status(
				message.includes("not found")
					? 404
					: message.includes("Cannot move")
						? 400
						: 500,
			)
			.json({ error: message || "Internal server error" });
	}
};

export const createFolder = (req: AuthRequest, res: Response) => {
	const parsed = createFolderSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error?.issues[0]?.message || "Validation error",
		});
	}
	return handleRequest(req, res, (userId) =>
		FolderService.createFolder(userId, parsed.data!),
	);
};

export const updateFolder = (req: AuthRequest, res: Response) => {
	const parsed = updateFolderSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error?.issues[0]?.message || "Validation error",
		});
	}
	return handleRequest(req, res, (userId) =>
		FolderService.updateFolder(
			userId,
			req.params.id as string,
			parsed.data!,
		),
	);
};

export const moveFolder = (req: AuthRequest, res: Response) => {
	const parsed = moveFolderSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error?.issues[0]?.message || "Validation error",
		});
	}
	return handleRequest(req, res, (userId) =>
		FolderService.moveFolder(
			userId,
			req.params.id as string,
			parsed.data!.newParentId,
		),
	);
};

export const deleteFolder = (req: AuthRequest, res: Response) => {
	return handleRequest(req, res, (userId) =>
		FolderService.deleteFolder(userId, req.params.id as string),
	);
};

export const getFoldersTree = (req: AuthRequest, res: Response) => {
	return handleRequest(req, res, (userId) =>
		FolderService.getFoldersTree(userId).then((folders) => ({ folders })),
	);
};

export const getFolderContents = (req: AuthRequest, res: Response) => {
	const folderId =
		req.params.id === "root" ? null : (req.params.id as string);
	return handleRequest(req, res, (userId) =>
		FolderService.getFolderContents(userId, folderId),
	);
};
