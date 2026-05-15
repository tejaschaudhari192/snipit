import { useCallback } from "react";

interface UseFileDropProps {
	onFileSelect?: (files: File[]) => void;
}

export const useFileDrop = ({ onFileSelect }: UseFileDropProps) => {
	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const files = Array.from(e.dataTransfer.files);
			if (files.length > 0 && onFileSelect) {
				onFileSelect(files);
			}
		},
		[onFileSelect],
	);

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files ? Array.from(e.target.files) : [];
			if (files.length > 0 && onFileSelect) {
				onFileSelect(files);
			}
		},
		[onFileSelect],
	);

	return {
		handleDragOver,
		handleDrop,
		handleFileInputChange,
	};
};
