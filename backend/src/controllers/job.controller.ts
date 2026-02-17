import type { Request, Response } from "express";
import Paste from "@/models/Paste.js";
import configurations from "@/config/configurations.js";
import { deleteFileFromStorage } from "@/lib/supabase.js";

export const cleanupExpiredPastes = async (req: Request, res: Response) => {
	try {
		const key =
			(req.query.key as string) ||
			(req.headers["x-job-secret"] as string);

		if (!configurations.job_secret) {
			console.error("JOB_SECRET is not configured on the server.");
			return res
				.status(500)
				.json({ error: "Server misconfiguration: JOB_SECRET not set" });
		}

		if (!key || key !== configurations.job_secret) {
			return res
				.status(401)
				.json({ error: "Unauthorized: Invalid or missing key" });
		}

		const now = new Date();
		const expiredPastes = await Paste.find({
			expiresAt: { $lt: now },
		});

		const deletedIds = expiredPastes.map((p) => p.id);

		if (expiredPastes.length > 0) {
			// Delete files from storage
			for (const paste of expiredPastes) {
				if (paste.fileUrl) {
					try {
						await deleteFileFromStorage(paste.fileUrl);
					} catch (storageError) {
						console.error(
							`Error deleting file for paste ${paste.id}:`,
							storageError,
						);
					}
				}
			}

			await Paste.deleteMany({
				_id: { $in: expiredPastes.map((p) => p._id) },
			});
		}

		return res.status(200).json({
			message: "Cleanup job completed successfully",
			deletedCount: deletedIds.length,
			deletedIds,
		});
	} catch (error) {
		console.error("Job error:", error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};
