import { Router } from "express";
import CollaboratorController from "@/controllers/collaborator.controller.js";
import PasteService from "@/services/paste.service.js";
import EmailService from "@/services/email.service.js";
import PermissionService from "@/services/permission.service.js";
import { protect } from "@/middleware/auth.middleware.js";
import { catchAsync } from "@/lib/errors.js";

const router: Router = Router();

const emailService = new EmailService();
const pasteService = new PasteService(emailService);
const permissionService = new PermissionService();
const collaboratorController = new CollaboratorController(
	pasteService,
	permissionService,
);

router.post(
	"/:id",
	protect,
	catchAsync(
		collaboratorController.addCollaborator.bind(collaboratorController),
	),
);

router.delete(
	"/:id",
	protect,
	catchAsync(
		collaboratorController.removeCollaborator.bind(collaboratorController),
	),
);

router.get(
	"/:id",
	protect,
	catchAsync(
		collaboratorController.getCollaborators.bind(collaboratorController),
	),
);

export default router;
