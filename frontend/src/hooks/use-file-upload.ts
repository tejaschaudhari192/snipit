import { useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CONFIG } from "@/configurations";

export interface UploadState {
	isUploading: boolean;
	progress: number;
	error: string | null;
	fileUrl: string | null;
	fileName: string | null;
	fileSize: number | null;
	fileMimeType: string | null;
}

export const useFileUpload = () => {
	const [uploadState, setUploadState] = useState<UploadState>({
		isUploading: false,
		progress: 0,
		error: null,
		fileUrl: null,
		fileName: null,
		fileSize: null,
		fileMimeType: null,
	});

	const uploadFile = useCallback(async (file: File): Promise<UploadState> => {
		if (!isSupabaseConfigured || !supabase) {
			const errorState: UploadState = {
				isUploading: false,
				progress: 0,
				error: "File upload is not configured",
				fileUrl: null,
				fileName: null,
				fileSize: null,
				fileMimeType: null,
			};
			setUploadState(errorState);
			return errorState;
		}

		if (file.size > CONFIG.DEFAULTS.MAX_FILE_SIZE) {
			const errorState: UploadState = {
				isUploading: false,
				progress: 0,
				error: `File size exceeds ${CONFIG.DEFAULTS.MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
				fileUrl: null,
				fileName: null,
				fileSize: null,
				fileMimeType: null,
			};
			setUploadState(errorState);
			return errorState;
		}

		setUploadState({
			isUploading: true,
			progress: 0,
			error: null,
			fileUrl: null,
			fileName: file.name,
			fileSize: file.size,
			fileMimeType: file.type,
		});

		// Simulate progress for perceived performance
		const progressInterval = setInterval(() => {
			setUploadState((prev) => {
				if (!prev.isUploading || prev.progress >= 95) return prev;
				// Slowly increase progress up to 95%
				const increment = Math.max(0.5, (95 - prev.progress) / 15);
				return {
					...prev,
					progress: Math.min(95, prev.progress + increment),
				};
			});
		}, 200);

		try {
			const timestamp = Date.now();
			const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
			const filePath = `${timestamp}_${sanitizedName}`;

			const { error: uploadError } = await supabase.storage
				.from(CONFIG.SUPABASE_STORAGE_BUCKET)
				.upload(filePath, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type,
				});

			clearInterval(progressInterval);

			if (uploadError) {
				const errorState: UploadState = {
					isUploading: false,
					progress: 0,
					error: uploadError.message || "Upload failed",
					fileUrl: null,
					fileName: null,
					fileSize: null,
					fileMimeType: null,
				};
				setUploadState(errorState);
				return errorState;
			}

			const {
				data: { publicUrl },
			} = supabase.storage
				.from(CONFIG.SUPABASE_STORAGE_BUCKET)
				.getPublicUrl(filePath);

			const successState: UploadState = {
				isUploading: false,
				progress: 100,
				error: null,
				fileUrl: publicUrl,
				fileName: file.name,
				fileSize: file.size,
				fileMimeType: file.type,
			};
			setUploadState(successState);
			return successState;
		} catch (error) {
			clearInterval(progressInterval);
			const errorState: UploadState = {
				isUploading: false,
				progress: 0,
				error: (error as Error).message || "Failed to upload file",
				fileUrl: null,
				fileName: null,
				fileSize: null,
				fileMimeType: null,
			};
			setUploadState(errorState);
			return errorState;
		}
	}, []);

	const setFile = useCallback((file: File) => {
		setUploadState((prev) => ({
			...prev,
			fileName: file.name,
			fileSize: file.size,
			fileMimeType: file.type,
			error: null,
			fileUrl: null,
			progress: 0,
		}));
	}, []);

	const reset = useCallback(() => {
		setUploadState({
			isUploading: false,
			progress: 0,
			error: null,
			fileUrl: null,
			fileName: null,
			fileSize: null,
			fileMimeType: null,
		});
	}, []);

	return {
		...uploadState,
		uploadFile,
		setFile,
		reset,
		isConfigured: isSupabaseConfigured,
	};
};
