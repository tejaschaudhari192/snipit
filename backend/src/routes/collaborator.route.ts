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

// Shared discovery endpoint
router.get(
	"/shared",
	protect,
	catchAsync(
		collaboratorController.getSharedItems.bind(collaboratorController),
	),
);

// Update collaborator role (paste or folder)
router.patch(
	"/role/:collaboratorId",
	protect,
	catchAsync(
		collaboratorController.updateCollaboratorRole.bind(
			collaboratorController,
		),
	),
);

// Folder collaborator endpoints
router.get(
	"/folder/:folderId",
	protect,
	catchAsync(
		collaboratorController.getFolderCollaborators.bind(
			collaboratorController,
		),
	),
);

router.post(
	"/folder/:folderId",
	protect,
	catchAsync(
		collaboratorController.addFolderCollaborator.bind(
			collaboratorController,
		),
	),
);

router.delete(
	"/folder/:folderId",
	protect,
	catchAsync(
		collaboratorController.removeFolderCollaborator.bind(
			collaboratorController,
		),
	),
);

// Paste collaborator endpoints
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
