import { useState, useCallback } from "react";
import type { editor } from "monaco-editor";
import type { Monaco } from "@monaco-editor/react";

export const useAiEnhance = () => {
	const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
	const [selectedText, setSelectedText] = useState("");
	const [editorInstance, setEditorInstance] =
		useState<editor.IStandaloneCodeEditor | null>(null);

	const setupAiAction = useCallback(
		(ed: editor.IStandaloneCodeEditor, monaco: Monaco) => {
			setEditorInstance(ed);

			// Add "AI Enhance" action to the context menu
			ed.addAction({
				id: "ai-enhance-action",
				label: "✨ AI Enhance Selection...",
				keybindings: [
					monaco.KeyMod.CtrlCmd |
						monaco.KeyMod.Shift |
						monaco.KeyCode.KeyE,
				],
				contextMenuGroupId: "navigation",
				contextMenuOrder: 1,
				run: (editor) => {
					const selection = editor.getSelection();
					if (selection && !selection.isEmpty()) {
						const text = editor
							.getModel()
							?.getValueInRange(selection);
						if (text) {
							setSelectedText(text);
							setIsAiDialogOpen(true);
						}
					} else {
						// Fallback to warning if no selection, although normally context menu items can be conditionally enabled.
						// But Monaco `precondition` can be complex, so handling it here is fine.
					}
				},
			});
		},
		[],
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

	return {
		isAiDialogOpen,
		setIsAiDialogOpen,
		selectedText,
		setupAiAction,
		applyEnhancedText,
	};
};
