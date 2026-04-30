import Paste from "@/models/Paste.js";
import { deleteFileFromStorage } from "@/lib/supabase.js";

class JobService {
	async cleanupExpiredPastes() {
		const now = new Date();
		const expiredPastes = await Paste.find({
			expiresAt: { $lt: now },
		});

		if (expiredPastes.length === 0) return [];

		const deletedIds = expiredPastes.map((p) => p.id);

		for (const paste of expiredPastes) {
			if (paste.fileUrl) {
				try {
					await deleteFileFromStorage(paste.fileUrl);
				} catch (storageError) {
					console.error(`Error deleting file for paste ${paste.id}:`, storageError);
				}
			}
		}

		await Paste.deleteMany({
			_id: { $in: expiredPastes.map((p) => p._id) },
		});

		return deletedIds;
	}
}

export default JobService;
