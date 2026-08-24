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

/**
 * Extracts storage paths from public URLs for the configured Supabase bucket
 */
export const extractFilePathFromUrl = (fileUrl: string): string | null => {
	const bucket = configurations.supabase_storage_bucket;
	if (!bucket || !fileUrl) return null;

	const urlParts = fileUrl.split(`/${bucket}/`);
	const pathPart = urlParts[1];
	if (urlParts.length >= 2 && pathPart) {
		// Clean any trailing query parameters or quotes
		const cleanPath = pathPart.split("?")[0];
		return cleanPath ? cleanPath.replace(/['")\\]+$/, "") : null;
	}
	return null;
};

/**
 * Extracts any embedded Supabase storage URLs found inside document/HTML/markdown content
 */
export const extractStorageUrlsFromContent = (content?: string): string[] => {
	if (!content || typeof content !== "string") return [];
	const bucket = configurations.supabase_storage_bucket;
	if (!bucket) return [];

	const urls: string[] = [];
	// Matches any Supabase storage URLs pointing to the configured bucket
	const regex = new RegExp(
		`https?://[^"'\\s)]+/storage/v1/object/public/${bucket}/[^"'\\s)]+`,
		"gi",
	);

	let match: RegExpExecArray | null;
	while ((match = regex.exec(content)) !== null) {
		if (match[0]) {
			urls.push(match[0]);
		}
	}

	return Array.from(new Set(urls));
};

/**
 * Deletes a single file from Supabase storage
 */
export const deleteFileFromStorage = async (fileUrl: string) => {
	await deleteFilesFromStorage([fileUrl]);
};

/**
 * Deletes multiple files from Supabase storage in a single batch
 */
export const deleteFilesFromStorage = async (fileUrls: string[]) => {
	if (!isSupabaseConfigured || !supabase || fileUrls.length === 0) {
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

		const filePaths = fileUrls
			.map((url) => extractFilePathFromUrl(url))
			.filter((p): p is string => Boolean(p));

		if (filePaths.length === 0) return;

		const { error } = await supabase.storage.from(bucket).remove(filePaths);

		if (error) {
			logger.error(`Failed to delete files from storage:`, {
				filePaths,
				error,
			});
		} else {
			logger.info(
				`Successfully deleted ${filePaths.length} files from storage bucket ${bucket}`,
				{ filePaths },
			);
		}
	} catch (error) {
		logger.error("Error in deleteFilesFromStorage:", error);
	}
};

/**
 * Comprehensive helper that cleans up all files associated with a paste/document:
 * 1. Attached fileUrl
 * 2. Attached files list
 * 3. Any embedded storage images or files inside rich-text / docs content
 */
export const deletePasteStorageFiles = async (
	paste?: {
		fileUrl?: string | null | undefined;
		files?: Array<{ url: string } | null | undefined> | null | undefined;
		content?: string | null | undefined;
	} | null,
) => {
	if (!paste) return;

	const urlsToDelete: string[] = [];

	if (paste.fileUrl) {
		urlsToDelete.push(paste.fileUrl);
	}

	if (paste.files && paste.files.length > 0) {
		paste.files.forEach((f) => {
			if (f && f.url) urlsToDelete.push(f.url);
		});
	}

	if (paste.content) {
		const embeddedUrls = extractStorageUrlsFromContent(paste.content);
		urlsToDelete.push(...embeddedUrls);
	}

	const uniqueUrls = Array.from(new Set(urlsToDelete));
	if (uniqueUrls.length > 0) {
		await deleteFilesFromStorage(uniqueUrls);
	}
};
