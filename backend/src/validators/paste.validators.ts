import { z } from "zod";
export const createPasteSchema = z.object({
  content: z.string().min(1, { message: "Content can not be Empty" }),
  expiresAt: z.date(),
  idType: z.enum(["system", "dynamic"]).optional().default("dynamic"),
  customId: z.string().optional(),
  redirectUrl: z.boolean().optional().default(false),
});
