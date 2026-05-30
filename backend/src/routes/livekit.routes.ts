import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { generateLiveKitToken } from "../services/livekit.service.js";

const router: Router = Router();

router.post(
	"/token",
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { roomName, identity, isHost } = req.body;
			if (!roomName || !identity) {
				res.status(400).json({
					error: "Missing required parameters: roomName or identity",
				});
				return;
			}

			const token = await generateLiveKitToken(
				roomName,
				identity,
				!!isHost,
			);
			res.status(200).json({ token });
		} catch (error) {
			next(error);
		}
	},
);

export default router;
