import { useState, useRef } from "react";
import { type Editor } from "@tiptap/core";
import { FileService } from "@/lib/file-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export function useEditorDragDrop(
	activeEditor: Editor | null,
	readOnly: boolean,
) {
	const [isDragging, setIsDragging] = useState(false);
	const dragCounter = useRef(0);

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		dragCounter.current++;
		if (e.dataTransfer.types.includes("Files")) {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		dragCounter.current--;
		if (dragCounter.current === 0) {
			setIsDragging(false);
		}
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		dragCounter.current = 0;
		setIsDragging(false);

		if (!activeEditor || readOnly) return;
		const files = Array.from(e.dataTransfer.files);
		if (files.length === 0) return;

		for (const file of files) {
			if (file.type.startsWith("image/")) {
				try {
					let targetUrl: string | null = null;
					if (isSupabaseConfigured) {
						const { url } = await FileService.upload(file);
						if (url) targetUrl = url;
					}
					if (!targetUrl) {
						targetUrl = await new Promise<string>(
							(resolve, reject) => {
								const reader = new FileReader();
								reader.onload = () =>
									resolve(reader.result as string);
								reader.onerror = reject;
								reader.readAsDataURL(file);
							},
						);
					}
					if (targetUrl) {
						activeEditor
							.chain()
							.focus()
							.setImage({ src: targetUrl })
							.run();
					}
				} catch (err) {
					console.error("Failed to insert dropped image:", err);
				}
			}
		}
	};

	return {
		isDragging,
		handleDragEnter,
		handleDragLeave,
		handleDrop,
	};
}
