import logger from "@/config/logger.js";
import PasteController from "@/controllers/paste.controller.js";
import PasteService from "@/services/paste.service.js";
import EmailService from "@/services/email.service.js";
import {
	Router,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { protect } from "@/middleware/auth.middleware.js";
const router: Router = Router();

const pasteService = new PasteService();
const emailService = new EmailService();
const pasteController = new PasteController(pasteService, emailService, logger);

router.get(
	"/user/pastes",
	protect,
	async (req: Request, res: Response, next: NextFunction) => {
		return await pasteController.getUserPastes(req, res, next);
	},
);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
	return await pasteController.createPaste(req, res, next);
});
// router.post('/', pasteController.createPaste.bind(pasteService))

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
	return await pasteController.getPaste(req, res, next);
});

router.delete(
	"/:id",
	async (req: Request, res: Response, next: NextFunction) => {
		return await pasteController.deletePaste(req, res, next);
	},
);

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
	return await pasteController.updatePaste(req, res, next);
});

router.post(
	"/:id/verify-password",
	async (req: Request, res: Response, next: NextFunction) => {
		return await pasteController.verifyPassword(req, res, next);
	},
);

router.post(
	"/:id/comment",
	async (req: Request, res: Response, next: NextFunction) => {
		return await pasteController.addComment(req, res, next);
	},
);

export default router;
