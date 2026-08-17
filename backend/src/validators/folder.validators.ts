import { z } from "zod";

const objectIdSchema = z
	.string()
	.regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid MongoDB ObjectId" });

export const createFolderSchema = z.object({
	name: z
		.string()
		.min(1, { message: "Folder name cannot be empty" })
		.max(100, { message: "Folder name too long" }),
	parentId: objectIdSchema.nullable().optional().default(null),
	color: z.string().nullable().optional().default(null),
	icon: z.string().nullable().optional().default(null),
});

export const updateFolderSchema = z.object({
	name: z
		.string()
		.min(1, { message: "Folder name cannot be empty" })
		.max(100, { message: "Folder name too long" })
		.optional(),
	color: z.string().nullable().optional(),
	icon: z.string().nullable().optional(),
});

export const moveFolderSchema = z.object({
	newParentId: objectIdSchema.nullable(),
});
