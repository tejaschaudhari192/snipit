import { Router } from "express";
import {
	createFolder,
	updateFolder,
	moveFolder,
	deleteFolder,
	getFoldersTree,
	getFolderContents,
} from "@/controllers/folder.controller.js";
import { protect } from "@/middleware/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.post("/", createFolder);
router.get("/tree", getFoldersTree);
router.get("/contents/:id", getFolderContents);
router.patch("/:id", updateFolder);
router.patch("/:id/move", moveFolder);
router.delete("/:id", deleteFolder);

export default router;
