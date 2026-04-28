import { Router } from "express";
import authRouter from "./auth.routes.js";
import pasteRouter from "./paste.route.js";
import aiRouter from "./ai.route.js";
import healthRouter from "./health.route.js";
import jobRouter from "./job.route.js";

const router: Router = Router();

// Route mappings
router.use("/auth", authRouter);
router.use("/pastes", pasteRouter);
router.use("/ai", aiRouter);
router.use("/health", healthRouter);
router.use("/jobs", jobRouter);

export default router;
