import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { OnMount, Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { isSnipitDrawing } from "@/utils";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import type { ContentMode } from "@/types";

interface UsePasteHandlersProps {
	isSubmitting: boolean;
	isUploading: boolean;
	contentType: ContentMode;
	setContentType: (type: ContentMode) => void;
	setPendingFile: (file: File | null) => void;
	setFileUpload: (file: File | null) => void;
	setLanguage: (lang: string) => void;
	textValue: string;
	setupAiAction: (
		editor: editor.IStandaloneCodeEditor,
		monaco: Monaco,
	) => void;
	setupAutocomplete: (
		editor: editor.IStandaloneCodeEditor,
		monaco: Monaco,
	) => void;
}

export const usePasteHandlers = ({
	isSubmitting,
	isUploading,
	contentType,
	setContentType,
	setPendingFile,
	setFileUpload,
	setLanguage,
	textValue,
	setupAiAction,
	setupAutocomplete,
}: UsePasteHandlersProps) => {
	const { t } = useTranslation();
	const { detectLanguage, isDetecting } = useLanguageDetection();
	const hasDetectedRef = useRef(false);
	const previousLengthRef = useRef(0);
	const valueRef = useRef("");

	useEffect(() => {
		previousLengthRef.current = valueRef.current.trim().length;
		valueRef.current = textValue;
	}, [textValue]);

	const handleLanguageDetection = useCallback(
		async (content: string) => {
			if (hasDetectedRef.current) return;

			if (isSnipitDrawing(content)) {
				hasDetectedRef.current = true;
				setContentType("draw");
				return;
			}

			hasDetectedRef.current = true;
			const result = await detectLanguage(content);
			if (result) {
				setLanguage(result.language);
				if (result.isCode) {
					setContentType("code");
				} else {
					setContentType("text");
				}
			}
		},
		[detectLanguage, setContentType, setLanguage],
	);

	const handlePaste = useCallback(
		(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
			if (valueRef.current.trim() !== "") return;
			handleLanguageDetection(
				e.clipboardData.getData("text/plain") ||
					e.clipboardData.getData("text"),
			);
		},
		[handleLanguageDetection],
	);

	const handleEditorMount: OnMount = useCallback(
		(editor, monaco) => {
			setupAiAction(editor, monaco);
			setupAutocomplete(editor, monaco);
			editor.onDidPaste(() => {
				const value = editor.getValue();
				if (previousLengthRef.current === 0) {
					handleLanguageDetection(value);
				}
			});
		},
		[handleLanguageDetection, setupAiAction, setupAutocomplete],
	);

	useEffect(() => {
		const handleGlobalPaste = (e: ClipboardEvent) => {
			if (isSubmitting || isUploading) return;

			const textData =
				e.clipboardData?.getData("text/plain") ||
				e.clipboardData?.getData("text");

			if (textData && isSnipitDrawing(textData)) {
				if (contentType !== "draw") setContentType("draw");
				return;
			}

			if (contentType === "draw") return;

			const items = e.clipboardData?.items;
			if (!items) return;

			for (const item of items) {
				if (item.kind === "file") {
					const file = item.getAsFile();
					if (file) {
						setContentType("file");
						setPendingFile(file);
						setFileUpload(file);
						toast.success(
							t(
								"home.file_selected_via_paste",
								"File selected via paste!",
							),
						);
						break;
					}
				}
			}
		};

		document.addEventListener("paste", handleGlobalPaste);
		return () => {
			document.removeEventListener("paste", handleGlobalPaste);
		};
	}, [
		isSubmitting,
		isUploading,
		contentType,
		t,
		setFileUpload,
		setContentType,
		setPendingFile,
	]);

	return {
		handlePaste,
		handleEditorMount,
		handleLanguageDetection,
		isDetecting,
		hasDetectedRef,
		previousLengthRef,
		valueRef,
	};
};
