import { createClient } from "@supabase/supabase-js";
import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";

const supabaseUrl = configurations.supabase_url;
const supabaseServiceKey = configurations.supabase_service_role_key;

export const supabase =
	supabaseUrl && supabaseServiceKey
		? createClient(supabaseUrl, supabaseServiceKey)
		: null;

export const isSupabaseConfigured = !!supabase;

export const deleteFileFromStorage = async (fileUrl: string) => {
	if (!isSupabaseConfigured || !supabase) {
		logger.warn("Supabase storage deletion skipped: Client not configured");
		return;
	}

	try {
		const bucket = configurations.supabase_storage_bucket;
		if (!bucket) {
			logger.warn(
				"Supabase storage deletion skipped: Bucket not configured",
			);
			return;
		}

		// Extract path from URL
		// URL format: https://[ID].supabase.co/storage/v1/object/public/[BUCKET]/[PATH]
		const urlParts = fileUrl.split(`/${bucket as string}/`);
		if (urlParts.length < 2) {
			logger.warn(`Could not extract file path from URL: ${fileUrl}`);
			return;
		}

		const filePath = urlParts[1]!;
		const { error } = await supabase.storage
			.from(bucket)
			.remove([filePath]);

		if (error) {
			logger.error(`Failed to delete file from storage: ${filePath}`, {
				error,
			});
		} else {
			logger.info(`Successfully deleted file from storage: ${filePath}`);
		}
	} catch (error) {
		logger.error(
			`Error in deleteFileFromStorage for URL ${fileUrl}:`,
			error,
		);
	}
};
