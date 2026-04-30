import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate =
	(schema: z.ZodTypeAny) =>
	(req: Request, _res: Response, next: NextFunction) => {
		try {
			schema.parse({
				body: req.body,
				query: req.query,
				params: req.params,
			});
			next();
		} catch (error) {
			next(error);
		}
	};

