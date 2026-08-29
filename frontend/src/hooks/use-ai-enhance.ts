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

	const applyEnhancedTextNative = useCallback(
		(newText: string, onContentChange?: (val: string) => void) => {
			const textarea = nativeTextareaRef.current;
			if (!textarea) {
				if (onContentChange) onContentChange(newText);
				return;
			}

			const start = textarea.selectionStart ?? 0;
			const end = textarea.selectionEnd ?? textarea.value.length;
			const currentValue = textarea.value;

			const newValue =
				currentValue.slice(0, start) +
				newText +
				currentValue.slice(end);

			if (onContentChange) {
				onContentChange(newValue);
			} else {
				const nativeSetter = Object.getOwnPropertyDescriptor(
					window.HTMLTextAreaElement.prototype,
					"value",
				)?.set;
				if (nativeSetter) {
					nativeSetter.call(textarea, newValue);
				} else {
					textarea.value = newValue;
				}
				textarea.dispatchEvent(new Event("input", { bubbles: true }));
			}

			requestAnimationFrame(() => {
				textarea.focus();
				const nextPos = start + newText.length;
				textarea.setSelectionRange(nextPos, nextPos);
			});
		},
		[],
	);

	const applyEnhancedText = useCallback(
		(
			newText: string,
			editorEngine?: "monaco" | "native",
			onContentChange?: (val: string) => void,
		) => {
			if (editorEngine === "native") {
				applyEnhancedTextNative(newText, onContentChange);
				return;
			}
			if (!editorInstance) {
				if (onContentChange) onContentChange(newText);
				return;
			}
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
		[editorInstance, applyEnhancedTextNative],
	);

	const applyWriterTextNative = useCallback(
		(newText: string, onContentChange?: (val: string) => void) => {
			const textarea = nativeTextareaRef.current;
			if (!textarea) {
				if (onContentChange) onContentChange(newText);
				return;
			}

			const start = textarea.selectionStart ?? textarea.value.length;
			const end = textarea.selectionEnd ?? textarea.value.length;
			const currentValue = textarea.value;

			const newValue =
				currentValue.slice(0, start) +
				newText +
				currentValue.slice(end);

			if (onContentChange) {
				onContentChange(newValue);
			} else {
				const nativeSetter = Object.getOwnPropertyDescriptor(
					window.HTMLTextAreaElement.prototype,
					"value",
				)?.set;
				if (nativeSetter) {
					nativeSetter.call(textarea, newValue);
				} else {
					textarea.value = newValue;
				}
				textarea.dispatchEvent(new Event("input", { bubbles: true }));
			}

			requestAnimationFrame(() => {
				textarea.focus();
				const nextPos = start + newText.length;
				textarea.setSelectionRange(nextPos, nextPos);
			});
		},
		[],
	);

	const applyWriterText = useCallback(
		(
			newText: string,
			editorEngine?: "monaco" | "native",
			onContentChange?: (val: string) => void,
		) => {
			if (editorEngine === "native") {
				applyWriterTextNative(newText, onContentChange);
				return;
			}
			if (!editorInstance) {
				if (onContentChange) onContentChange(newText);
				return;
			}
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
		nativeTextareaRef,
		setNativeTextareaRef,
	};
};
