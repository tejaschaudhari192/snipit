import logger from "@/config/logger.js";
import PasteController from "@/controllers/paste.controller.js";
import PasteService from "@/services/paste.service.js";
import EmailService from "@/services/email.service.js";
import PermissionService from "@/services/permission.service.js";
import { Router } from "express";
import { protect } from "@/middleware/auth.middleware.js";
import { catchAsync } from "@/lib/errors.js";

const router: Router = Router();

const emailService = new EmailService();
const pasteService = new PasteService(emailService);
const permissionService = new PermissionService();
const pasteController = new PasteController(
	pasteService,
	permissionService,
	logger,
);

router.get(
	"/user/pastes",
	protect,
	catchAsync(pasteController.getUserPastes.bind(pasteController)),
);

router.get(
	"/user/stats",
	protect,
	catchAsync(pasteController.getUserStats.bind(pasteController)),
);

router.post("/", catchAsync(pasteController.createPaste.bind(pasteController)));

router.get("/:id", catchAsync(pasteController.getPaste.bind(pasteController)));

router.delete(
	"/:id",
	catchAsync(pasteController.deletePaste.bind(pasteController)),
);

router.put(
	"/:id",
	catchAsync(pasteController.updatePaste.bind(pasteController)),
);

router.post(
	"/:id/verify-password",
	catchAsync(pasteController.verifyPassword.bind(pasteController)),
);

router.post(
	"/:id/comment",
	catchAsync(pasteController.addComment.bind(pasteController)),
);

export default router;
