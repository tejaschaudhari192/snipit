import type { Response } from "express";
import { LabelService } from "@/services/label.service.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";

const handleRequest = async (
	req: AuthRequest,
	res: Response,
	serviceCall: (userId: string) => Promise<any>,
) => {
	try {
		const userId = req.user?._id;
		if (!userId) return res.status(401).json({ error: "Unauthorized" });
		const result = await serviceCall(userId.toString());
		return res.status(200).json(result);
	} catch (error: any) {
		console.error(`Label Controller Error: ${error.message}`);
		return res
			.status(error.message === "Snippet not found" ? 404 : 500)
			.json({ error: error.message || "Internal server error" });
	}
};

export const getLabelsForSnippet = (req: AuthRequest, res: Response) =>
	handleRequest(req, res, (userId) =>
		LabelService.getLabelsForSnippet(
			userId,
			req.params.pasteId as string,
		).then((labels) => ({ labels })),
	);

export const updateLabelsForSnippet = (req: AuthRequest, res: Response) => {
	if (!Array.isArray(req.body.labels))
		return res.status(400).json({ error: "Labels must be an array" });
	return handleRequest(req, res, (userId) =>
		LabelService.updateLabelsForSnippet(
			userId,
			req.params.pasteId as string,
			req.body.labels,
		).then((labels) => ({ labels })),
	);
};

export const getAllUserLabels = (req: AuthRequest, res: Response) =>
	handleRequest(req, res, (userId) =>
		LabelService.getAllUserLabels(userId).then((labels) => ({ labels })),
	);

export const getSnippetsByLabel = (req: AuthRequest, res: Response) =>
	handleRequest(req, res, (userId) =>
		LabelService.getSnippetsByLabel(
			userId,
			req.params.label as string,
		).then((snippets) => ({ snippets })),
	);

export const getSavedSnippets = (req: AuthRequest, res: Response) =>
	handleRequest(req, res, (userId) =>
		LabelService.getSavedSnippets(userId).then((snippets) => ({
			snippets,
		})),
	);

export const saveSnippet = (req: AuthRequest, res: Response) =>
	handleRequest(req, res, (userId) =>
		LabelService.saveSnippet(userId, req.params.pasteId as string),
	);
