import { supabase } from "./supabase";
import { CONFIG } from "@/configurations";
import { sanitizeFileName } from "@/utils";
import type { FileAttachment, PasteData } from "@/types";

export interface FileUploadStatus {
	id: string;
	isUploading: boolean;
	progress: number;
	error: string | null;
	fileUrl: string | null;
	fileName: string;
	fileSize: number;
	fileMimeType: string;
}

export const FileService = {
	/**
	 * Creates a status object for a file before/during upload
	 */
	createStatus: (file: File): FileUploadStatus => ({
		id: Math.random().toString(36).substring(7),
		isUploading: false,
		progress: 0,
		error: null,
		fileUrl: null,
		fileName: file.name,
		fileSize: file.size,
		fileMimeType: file.type || "application/octet-stream",
	}),

	/**
	 * Maps a paste object to an array of FileUploadStatus
	 */
	mapPasteToStatus: (paste: PasteData | null): FileUploadStatus[] => {
		if (!paste) return [];

		if (paste.files && paste.files.length > 0) {
			return paste.files.map((f, i) => ({
				id: `existing-${i}`,
				fileName: f.name,
				fileSize: f.size,
				fileMimeType: f.mimeType,
				fileUrl: f.url,
				isUploading: false,
				progress: 100,
				error: null,
			}));
		}

		if (paste.fileUrl) {
			return [
				{
					id: "existing-legacy",
					fileName: paste.fileName || "File",
					fileSize: paste.fileSize || 0,
					fileMimeType:
						paste.fileMimeType || "application/octet-stream",
					fileUrl: paste.fileUrl,
					isUploading: false,
					progress: 100,
					error: null,
				},
			];
		}

		return [];
	},

	/**
	 * Validates a file before upload
	 */
	validate: (file: File): string | null => {
		if (file.size > CONFIG.defaults.maxFileSize) {
			return `File size exceeds ${CONFIG.defaults.maxFileSize / (1024 * 1024)}MB limit`;
		}
		return null;
	},

	/**
	 * Uploads a single file to Supabase storage
	 */
	upload: async (
		file: File,
	): Promise<{ url: string | null; error: string | null }> => {
		if (!supabase) {
			return { url: null, error: "Cloud storage is not configured" };
		}

		try {
			const sanitizedName = sanitizeFileName(file.name);
			const filePath = sanitizedName;

			// Supabase JS SDK doesn't have a native onProgress for storage.upload yet
			// so we rely on the interval simulation in the hook for now,
			// or we could use the underlying XHR if we needed real progress.

			const { error: uploadError } = await supabase.storage
				.from(CONFIG.supabaseStorageBucket)
				.upload(filePath, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type || "application/octet-stream",
				});

			if (uploadError) {
				return { url: null, error: uploadError.message };
			}

			const {
				data: { publicUrl },
			} = supabase.storage
				.from(CONFIG.supabaseStorageBucket)
				.getPublicUrl(filePath);

			return { url: publicUrl, error: null };
		} catch (err) {
			return {
				url: null,
				error: (err as Error).message || "Upload failed",
			};
		}
	},

	/**
	 * Maps a FileUploadStatus to the backend's FileAttachment format
	 */
	toAttachment: (status: FileUploadStatus): FileAttachment | null => {
		if (!status.fileUrl) return null;
		return {
			url: status.fileUrl,
			name: status.fileName,
			size: status.fileSize,
			mimeType: status.fileMimeType,
		};
	},
};
