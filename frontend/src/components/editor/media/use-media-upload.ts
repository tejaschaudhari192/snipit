import { useState, useCallback } from "react";
import { FileService } from "@/lib/file-service";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

interface UseMediaUploadOptions {
	onSuccess?: (url: string, filename: string, filesize: string) => void;
}

export function useMediaUpload({ onSuccess }: UseMediaUploadOptions = {}) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const reset = useCallback(() => {
		setSelectedFile(null);
		setIsUploading(false);
		setUploadProgress(0);
	}, []);

	const selectFile = useCallback((file: File | null) => {
		setSelectedFile(file);
		setUploadProgress(0);
	}, []);

	const upload = useCallback(async () => {
		if (!selectedFile) return;
		try {
			setIsUploading(true);
			setUploadProgress(0);

			let targetUrl: string | null = null;

			// Try cloud storage if configured with real byte-level progress
			if (isSupabaseConfigured) {
				const { url, error } = await FileService.upload(selectedFile, {
					onProgress: (p) => {
						setUploadProgress(p.percentage);
					},
				});
				if (error) {
					throw new Error(error);
				}
				if (url) {
					targetUrl = url;
				}
			}

			// Fallback to client Data URL for seamless local embedding
			if (!targetUrl) {
				targetUrl = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(selectedFile);
				});
			}

			setUploadProgress(100);

			if (targetUrl) {
				const sizeStr =
					selectedFile.size > 1024 * 1024
						? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
						: `${(selectedFile.size / 1024).toFixed(1)} KB`;

				// Short delay so user sees 100% completion before closing
				await new Promise((resolve) => setTimeout(resolve, 250));

				onSuccess?.(targetUrl, selectedFile.name, sizeStr);
				toast.add({
					title: "Embedded successfully!",
					type: "success",
				});
				reset();
			}
		} catch (err) {
			console.error(err);
			toast.add({
				title: "An error occurred during upload",
				type: "error",
			});
			setIsUploading(false);
			setUploadProgress(0);
		}
	}, [selectedFile, onSuccess, reset]);

	return {
		selectedFile,
		isUploading,
		uploadProgress,
		selectFile,
		upload,
		reset,
	};
}
