import { Router } from "express";
import { cleanupExpiredPastes } from "@/controllers/job.controller.js";

const router: Router = Router();

router.get("/", cleanupExpiredPastes);

export default router;
