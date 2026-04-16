import { z } from "zod";
export const createPasteSchema = z.object({
	content: z.string().min(1, { message: "Content can not be Empty" }),
	expiresAt: z.date().nullable(),
	idType: z.enum(["system", "dynamic"]).optional().default("dynamic"),
	customId: z.string().optional(),
	contentMode: z
		.enum(["text", "code", "link", "file", "draw"])
		.optional()
		.default("text"),
	fileUrl: z.string().optional(),
	fileName: z.string().optional(),
	fileSize: z.number().optional(),
	fileMimeType: z.string().optional(),
	redirectUrl: z.boolean().optional().default(false),
	language: z.string().optional().default("text"),
	burnAfterRead: z.boolean().optional(),
	expiresTime: z.string().optional(),
	visibility: z
		.enum(["public", "private", "shared"])
		.optional()
		.default("public"),
	allowedUsers: z.array(z.string()).optional(),
	password: z.string().optional(),
	editPermission: z
		.enum(["owner", "shared", "public"])
		.optional()
		.default("owner"),
	shareList: z
		.array(
			z.object({
				email: z.string().email(),
				role: z.enum(["viewer", "editor", "admin", "commenter"]),
			}),
		)
		.optional(),
	publicRole: z
		.enum(["viewer", "editor", "commenter"])
		.optional()
		.default("viewer"),
	allowComments: z.boolean().optional().default(false),
});

export const updatePasteSchema = createPasteSchema.partial().extend({
	newId: z.string().optional(),
});
