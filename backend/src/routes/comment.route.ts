import { Router } from "express";
import CommentController from "@/controllers/comment.controller.js";
import PasteService from "@/services/paste.service.js";
import EmailService from "@/services/email.service.js";
import PermissionService from "@/services/permission.service.js";
import { optionalProtect } from "@/middleware/auth.middleware.js";
import { catchAsync } from "@/lib/errors.js";

const router: Router = Router();

const emailService = new EmailService();
const pasteService = new PasteService(emailService);
const permissionService = new PermissionService();
const commentController = new CommentController(
	pasteService,
	permissionService,
);

router.post(
	"/:id",
	optionalProtect,
	catchAsync(commentController.addComment.bind(commentController)),
);

router.get(
	"/:id",
	optionalProtect,
	catchAsync(commentController.getComments.bind(commentController)),
);

export default router;
