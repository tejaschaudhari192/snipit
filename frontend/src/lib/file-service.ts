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

export interface UploadProgressEvent {
	percentage: number;
	loaded: number;
	total: number;
	stage: "uploading" | "processing";
}

export interface UploadOptions {
	onProgress?: (progress: UploadProgressEvent) => void;
	signal?: AbortSignal;
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
	 * Uploads a single file to Supabase storage with real byte-level progress reporting
	 */
	upload: async (
		file: File,
		options?: UploadOptions,
	): Promise<{ url: string | null; error: string | null }> => {
		try {
			const sanitizedName = sanitizeFileName(file.name);
			const filePath = `${Date.now()}-${sanitizedName}`;
			const uploadUrl = `${CONFIG.supabaseUrl}/storage/v1/object/${CONFIG.supabaseStorageBucket}/${filePath}`;

			const formData = new FormData();
			formData.append("cacheControl", "3600");
			formData.append("", file);

			return await new Promise((resolve) => {
				const xhr = new XMLHttpRequest();
				xhr.open("POST", uploadUrl);

				xhr.setRequestHeader("apikey", CONFIG.supabaseAnonKey);
				xhr.setRequestHeader(
					"Authorization",
					`Bearer ${CONFIG.supabaseAnonKey}`,
				);
				xhr.setRequestHeader("x-upsert", "true");

				if (options?.signal) {
					if (options.signal.aborted) {
						resolve({ url: null, error: "Upload cancelled" });
						return;
					}
					options.signal.addEventListener(
						"abort",
						() => xhr.abort(),
						{
							once: true,
						},
					);
				}

				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable && event.total > 0) {
						const percentage = Math.round(
							(event.loaded / event.total) * 100,
						);
						const stage =
							percentage >= 100 ? "processing" : "uploading";
						options?.onProgress?.({
							percentage: Math.min(percentage, 99),
							loaded: event.loaded,
							total: event.total,
							stage,
						});
					}
				};

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						options?.onProgress?.({
							percentage: 100,
							loaded: file.size,
							total: file.size,
							stage: "processing",
						});

						const {
							data: { publicUrl },
						} = supabase!.storage
							.from(CONFIG.supabaseStorageBucket)
							.getPublicUrl(filePath);

						resolve({ url: publicUrl, error: null });
					} else {
						let errorMessage = `Upload failed (${xhr.status})`;
						try {
							const responseJson = JSON.parse(xhr.responseText);
							errorMessage =
								responseJson.message ||
								responseJson.error ||
								errorMessage;
						} catch {
							// Use default status error if not JSON
						}
						resolve({ url: null, error: errorMessage });
					}
				};

				xhr.onerror = () => {
					resolve({
						url: null,
						error: "Network error during upload",
					});
				};

				xhr.onabort = () => {
					resolve({ url: null, error: "Upload cancelled" });
				};

				xhr.send(formData);
			});
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
