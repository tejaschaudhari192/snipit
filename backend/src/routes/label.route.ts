import { Router } from "express";
import {
	getLabelsForSnippet,
	updateLabelsForSnippet,
	getAllUserLabels,
	getSnippetsByLabel,
	getSavedSnippets,
	saveSnippet,
} from "@/controllers/label.controller.js";
import { protect } from "@/middleware/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.get("/all", getAllUserLabels);
router.get("/saved", getSavedSnippets);
router.post("/save/:pasteId", saveSnippet);
router.get("/snippet/:pasteId", getLabelsForSnippet);
router.post("/snippet/:pasteId", updateLabelsForSnippet);
router.get("/filter/:label", getSnippetsByLabel);

export default router;
