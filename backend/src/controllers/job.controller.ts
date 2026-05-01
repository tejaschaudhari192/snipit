import type { Request, Response } from "express";
import configurations from "@/config/configurations.js";
import type JobService from "@/services/job.service.js";

class JobController {
	constructor(private readonly jobService: JobService) {}

	async cleanupExpiredPastes(req: Request, res: Response) {
		const key =
			(req.query.key as string) ||
			(req.headers["x-job-secret"] as string);

		if (!configurations.job_secret) {
			return res
				.status(500)
				.json({ error: "Server misconfiguration: JOB_SECRET not set" });
		}

		if (!key || key !== configurations.job_secret) {
			return res
				.status(401)
				.json({ error: "Unauthorized: Invalid or missing key" });
		}

		const deletedIds = await this.jobService.cleanupExpiredPastes();

		return res.status(200).json({
			message: "Cleanup job completed successfully",
			deletedCount: deletedIds.length,
			deletedIds,
		});
	}
}

export default JobController;
