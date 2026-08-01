import { useState, useCallback, useRef, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { FileService, type FileUploadStatus } from "@/lib/file-service";
import { CONFIG } from "@/configurations";
import type { FileAttachment } from "@/types";

export interface MultiUploadState {
	files: FileUploadStatus[];
	isUploading: boolean;
	error: string | null;
}

export const useFileUpload = () => {
	const [state, setState] = useState<MultiUploadState>({
		files: [],
		isUploading: false,
		error: null,
	});

	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// Keep track of the actual File objects internally
	const pendingFilesRef = useRef<Map<string, File>>(new Map());

	// Update preview URL whenever the first pending file changes
	useEffect(() => {
		const firstFile = Array.from(pendingFilesRef.current.values())[0];
		if (!firstFile) {
			setPreviewUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(firstFile);
		setPreviewUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [state.files]); // Re-run when files list changes (which happens on add/remove)

	const updateFileStatus = useCallback(
		(id: string, updates: Partial<FileUploadStatus>) => {
			setState((prev) => ({
				...prev,
				files: prev.files.map((f) =>
					f.id === id ? { ...f, ...updates } : f,
				),
			}));
		},
		[],
	);

	const uploadSingleFile = useCallback(
		async (id: string, file: File): Promise<FileUploadStatus | null> => {
			updateFileStatus(id, { isUploading: true, error: null });

			// Validation
			const validationError = FileService.validate(file);
			if (validationError) {
				const errorStatus: Partial<FileUploadStatus> = {
					isUploading: false,
					error: validationError,
				};
				updateFileStatus(id, errorStatus);
				return {
					...state.files.find((f) => f.id === id)!,
					...errorStatus,
				};
			}

			// Progress simulation
			let progress = 0;
			const interval = setInterval(() => {
				progress = Math.min(
					95,
					progress + Math.max(1, (95 - progress) / 10),
				);
				updateFileStatus(id, { progress });
			}, CONFIG.ui.uploadProgressInterval);

			const { url, error } = await FileService.upload(file);

			clearInterval(interval);

			if (error) {
				const errorStatus: Partial<FileUploadStatus> = {
					isUploading: false,
					error,
				};
				updateFileStatus(id, errorStatus);
				return {
					...state.files.find((f) => f.id === id)!,
					...errorStatus,
				};
			}

			const successStatus: Partial<FileUploadStatus> = {
				isUploading: false,
				progress: 100,
				fileUrl: url,
			};
			updateFileStatus(id, successStatus);

			// Remove from pending map once uploaded
			pendingFilesRef.current.delete(id);

			return {
				...state.files.find((f) => f.id === id)!,
				...successStatus,
			};
		},
		[updateFileStatus, state.files],
	);

	const addFiles = useCallback((newFiles: File[]) => {
		const newStatuses = newFiles.map((file) => {
			const status = FileService.createStatus(file);
			pendingFilesRef.current.set(status.id, file);
			return status;
		});

		setState((prev) => ({
			...prev,
			files: [...prev.files, ...newStatuses],
			error: null,
		}));
	}, []);

	const uploadAll = useCallback(async () => {
		const pendingToUpload = Array.from(pendingFilesRef.current.entries());
		if (pendingToUpload.length === 0) return state.files;

		setState((prev) => ({ ...prev, isUploading: true }));

		const results = await Promise.all(
			pendingToUpload.map(([id, file]) => uploadSingleFile(id, file)),
		);

		const updatedFiles = results.map((r) => r!).filter(Boolean);

		const hasError = updatedFiles.some((r) => r?.error !== null);
		setState((prev) => ({
			...prev,
			isUploading: false,
			error: hasError ? "Some uploads failed" : null,
		}));

		return updatedFiles;
	}, [state.files, uploadSingleFile]);

	const removeFile = useCallback((id: string) => {
		pendingFilesRef.current.delete(id);
		setState((prev) => ({
			...prev,
			files: prev.files.filter((f) => f.id !== id),
		}));
	}, []);

	const reset = useCallback(() => {
		pendingFilesRef.current.clear();
		setState({
			files: [],
			isUploading: false,
			error: null,
		});
	}, []);

	// Selectors
	const uploadProgress =
		state.files.length > 0
			? Math.round(
					state.files.reduce((acc, f) => acc + f.progress, 0) /
						state.files.length,
				)
			: 0;

	const readyAttachments: FileAttachment[] = state.files
		.map(FileService.toAttachment)
		.filter((a): a is FileAttachment => a !== null);

	const getRawFile = useCallback((id: string): File | undefined => {
		return pendingFilesRef.current.get(id);
	}, []);

	return {
		files: state.files,
		isUploading: state.isUploading,
		progress: uploadProgress,
		error: state.error,
		previewUrl,
		readyAttachments,
		hasPending: pendingFilesRef.current.size > 0,
		addFiles,
		uploadAll,
		removeFile,
		reset,
		isConfigured: isSupabaseConfigured,
		getRawFile,
	};
};
