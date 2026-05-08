import { useCallback } from "react";

interface UseFileDropProps {
	onFileSelect?: (file: File) => void;
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
			const file = e.dataTransfer.files[0];
			if (file && onFileSelect) {
				onFileSelect(file);
			}
		},
		[onFileSelect],
	);

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file && onFileSelect) {
				onFileSelect(file);
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
