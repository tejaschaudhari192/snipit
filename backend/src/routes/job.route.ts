import { Router } from "express";
import JobController from "@/controllers/job.controller.js";
import JobService from "@/services/job.service.js";
import { catchAsync } from "@/lib/errors.js";

const router: Router = Router();

const jobService = new JobService();
const jobController = new JobController(jobService);

router.get("/", catchAsync(jobController.cleanupExpiredPastes.bind(jobController)));

export default router;

