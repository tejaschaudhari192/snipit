import logger from "@/config/logger.js";
import PasteController from "@/controllers/paste.controller.js";
import PasteService from "@/services/paste.service.js";
import EmailService from "@/services/email.service.js";
import PermissionService from "@/services/permission.service.js";
import { Router } from "express";
import { protect, optionalProtect } from "@/middleware/auth.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import {
	createPasteSchema,
	updatePasteSchema,
} from "@/validators/paste.validators.js";
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

router.post(
	"/",
	optionalProtect,
	validate(createPasteSchema),
	catchAsync(pasteController.createPaste.bind(pasteController)),
);

router.get(
	"/check/:id",
	catchAsync(pasteController.checkIdAvailability.bind(pasteController)),
);

router.get(
	"/generate-word-id",
	catchAsync(pasteController.generateWordId.bind(pasteController)),
);

router.get(
	"/word-categories",
	catchAsync(pasteController.getWordCategories.bind(pasteController)),
);

router.get(
	"/:id",
	optionalProtect,
	catchAsync(pasteController.getPaste.bind(pasteController)),
);

router.delete(
	"/:id",
	optionalProtect,
	catchAsync(pasteController.deletePaste.bind(pasteController)),
);

router.put(
	"/:id",
	optionalProtect,
	validate(updatePasteSchema),
	catchAsync(pasteController.updatePaste.bind(pasteController)),
);

router.post(
	"/:id/verify-password",
	optionalProtect,
	catchAsync(pasteController.verifyPassword.bind(pasteController)),
);

export default router;
