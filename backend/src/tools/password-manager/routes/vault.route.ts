import { Router } from "express";
import { getVault, updateVault } from "../controllers/vault.controller.js";
import { protect } from "@/middleware/auth.middleware.js";

const router: Router = Router();

// Protect all vault routes
router.use(protect);

router.route("/").get(getVault).put(updateVault);

export default router;
