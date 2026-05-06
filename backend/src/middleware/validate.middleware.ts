import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate =
	(schema: z.ZodTypeAny) =>
	(req: Request, _res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body);
			next();
		} catch (error) {
			next(error);
		}
	};
