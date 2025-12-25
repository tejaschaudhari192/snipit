import logger from "@/config/logger.js";
import PasteController from "@/controllers/paste.controller.js";
import PasteService from "@/services/paste.service.js";
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
const router: Router = Router();

const pasteService = new PasteService();
const pasteController = new PasteController(pasteService, logger);

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

export default router;
