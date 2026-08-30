import express from "express";
import companionController from "@/controllers/companion.controller.js";
import { optionalProtect, protect } from "@/middleware/auth.middleware.js";
import { catchAsync } from "@/lib/errors.js";

const router: express.Router = express.Router();

router.get(
	"/models",
	optionalProtect,
	catchAsync(companionController.getModels.bind(companionController)),
);

router.post(
	"/extract-memories",
	optionalProtect,
	catchAsync(companionController.extractMemories.bind(companionController)),
);

router.get(
	"/session",
	optionalProtect,
	catchAsync(companionController.getSession.bind(companionController)),
);

router.post(
	"/sync",
	optionalProtect,
	catchAsync(companionController.syncSession.bind(companionController)),
);

router.post(
	"/reset",
	protect,
	catchAsync(companionController.resetSession.bind(companionController)),
);

router.delete(
	"/memory/:memoryId",
	protect,
	catchAsync(companionController.deleteMemory.bind(companionController)),
);

export default router;
