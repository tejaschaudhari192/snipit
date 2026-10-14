import { useState, useCallback } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

export const useAiEnhance = () => {
	const [isAiWriterDialogOpen, setIsAiWriterDialogOpen] = useState(false);
	const [selectedText, setSelectedText] = useState("");
	const [editorInstance, setEditorInstance] =
		useState<editor.IStandaloneCodeEditor | null>(null);

	const setupAiAction = useCallback(
		(ed: editor.IStandaloneCodeEditor, monaco: Monaco) => {
			setEditorInstance(ed);

			// Clean shortcut: Cmd/Ctrl + Shift + E triggers the unified AI Assistant
			ed.addCommand(
				monaco.KeyMod.CtrlCmd |
					monaco.KeyMod.Shift |
					monaco.KeyCode.KeyE,
				() => {
					const selection = ed.getSelection();
					if (selection && !selection.isEmpty()) {
						const text = ed.getModel()?.getValueInRange(selection);
						setSelectedText(text || "");
					} else {
						setSelectedText("");
					}
					setIsAiWriterDialogOpen(true);
				},
			);
		},
		[],
	);

	const applyEnhancedText = useCallback(
		(newText: string) => {
			if (!editorInstance) return;
			const selection = editorInstance.getSelection();
			if (selection) {
				editorInstance.executeEdits("ai-assistant", [
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

	const applyWriterText = useCallback(
		(newText: string) => {
			if (!editorInstance) return;
			const selection = editorInstance.getSelection();
			if (selection && !selection.isEmpty()) {
				editorInstance.executeEdits("ai-assistant", [
					{
						range: selection,
						text: newText,
						forceMoveMarkers: true,
					},
				]);
			} else {
				const position = editorInstance.getPosition();
				if (position) {
					editorInstance.executeEdits("ai-assistant", [
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
				}
			}
			editorInstance.focus();
		},
		[editorInstance],
	);

	return {
		isAiWriterDialogOpen,
		setIsAiWriterDialogOpen,
		selectedText,
		setSelectedText,
		setupAiAction,
		applyEnhancedText,
		applyWriterText,
	};
};
