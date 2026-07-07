import { Router } from "express";
import authRouter from "./auth.routes.js";
import pasteRouter from "./paste.route.js";
import aiRouter from "./ai.route.js";
import healthRouter from "./health.route.js";
import jobRouter from "./job.route.js";
import labelRouter from "./label.route.js";
import commentRouter from "./comment.route.js";
import collaboratorRouter from "./collaborator.route.js";
import musicRouter from "./music.route.js";
import livekitRouter from "./livekit.routes.js";
import vaultRouter from "../tools/password-manager/routes/vault.route.js";

const router: Router = Router();

// Route mappings
router.use("/auth", authRouter);
router.use("/pastes", pasteRouter);
router.use("/ai", aiRouter);
router.use("/health", healthRouter);
router.use("/jobs", jobRouter);
router.use("/labels", labelRouter);
router.use("/comments", commentRouter);
router.use("/collaborators", collaboratorRouter);
router.use("/music", musicRouter);
router.use("/livekit", livekitRouter);
router.use("/tools/password-manager/vault", vaultRouter);

export default router;
