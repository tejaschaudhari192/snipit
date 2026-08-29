import { useState, useCallback, useRef } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTranslation } from "react-i18next";

export const useAiEnhance = () => {
	const { t } = useTranslation();
	const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
	const [isAiWriterDialogOpen, setIsAiWriterDialogOpen] = useState(false);
	const [selectedText, setSelectedText] = useState("");
	const [editorInstance, setEditorInstance] =
		useState<editor.IStandaloneCodeEditor | null>(null);
	const nativeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

	const [prefillInstruction, setPrefillInstruction] = useState("");

	const setupAiAction = useCallback(
		(ed: editor.IStandaloneCodeEditor, monaco: Monaco) => {
			setEditorInstance(ed);

			const registerAiAction = (
				id: string,
				label: string,
				instruction: string,
				keybinding?: number,
			) => {
				ed.addAction({
					id,
					label,
					keybindings: keybinding ? [keybinding] : undefined,
					contextMenuGroupId: "navigation",
					contextMenuOrder: 1,
					run: (editor: editor.IStandaloneCodeEditor) => {
						const selection = editor.getSelection();
						if (selection && !selection.isEmpty()) {
							const text = editor
								.getModel()
								?.getValueInRange(selection);
							if (text) {
								setSelectedText(text);
								setPrefillInstruction(instruction);
								setIsAiDialogOpen(true);
							}
						}
					},
				});
			};

			registerAiAction(
				"ai-enhance-action",
				t("editor.ai_enhance"),
				"",
				monaco.KeyMod.CtrlCmd |
					monaco.KeyMod.Shift |
					monaco.KeyCode.KeyE,
			);

			registerAiAction(
				"ai-explain-action",
				t("editor.ai_explain"),
				"Explain this code logic simply but thoroughly.",
			);

			registerAiAction(
				"ai-refactor-action",
				t("editor.ai_refactor"),
				"Refactor this code to be more clean, efficient, and readable.",
			);

			registerAiAction(
				"ai-fix-action",
				t("editor.ai_fix"),
				"Identify and fix any potential bugs or edge cases in this code.",
			);
		},
		[t],
	);

	const applyEnhancedText = useCallback(
		(newText: string) => {
			if (!editorInstance) return;
			const selection = editorInstance.getSelection();
			if (selection) {
				editorInstance.executeEdits("ai-enhance", [
					{
						range: selection,
						text: newText,
						forceMoveMarkers: true,
					},
				]);
				editorInstance.focus();
			}
		},
		[editorInstance],
	);

	const applyWriterTextNative = useCallback((newText: string) => {
		const textarea = nativeTextareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const currentValue = textarea.value;

		const newValue =
			currentValue.slice(0, start) + newText + currentValue.slice(end);

		textarea.value = newValue;
		textarea.selectionStart = textarea.selectionEnd =
			start + newText.length;
		textarea.focus();

		// Trigger input event for React state updates
		const event = new Event("input", { bubbles: true });
		textarea.dispatchEvent(event);
	}, []);

	const applyWriterText = useCallback(
		(newText: string, editorEngine?: "monaco" | "native") => {
			if (editorEngine === "native") {
				applyWriterTextNative(newText);
				return;
			}
			if (!editorInstance) return;
			const position = editorInstance.getPosition();
			if (position) {
				editorInstance.executeEdits("ai-writer", [
					{
						range: {
							startLineNumber: position.lineNumber,
							startColumn: position.column,
							endLineNumber: position.lineNumber,
							endColumn: position.column,
						},
						text: newText,
						forceMoveMarkers: true,
					},
				]);
				editorInstance.focus();
			}
		},
		[editorInstance, applyWriterTextNative],
	);

	const setNativeTextareaRef = useCallback(
		(ref: HTMLTextAreaElement | null) => {
			nativeTextareaRef.current = ref;
		},
		[],
	);

	return {
		isAiDialogOpen,
		setIsAiDialogOpen,
		isAiWriterDialogOpen,
		setIsAiWriterDialogOpen,
		selectedText,
		setSelectedText,
		prefillInstruction,
		setupAiAction,
		applyEnhancedText,
		applyWriterText,
		setNativeTextareaRef,
	};
};
