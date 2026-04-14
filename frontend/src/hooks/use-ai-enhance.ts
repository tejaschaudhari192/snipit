import { useState, useCallback } from "react";
import type { Monaco } from "@monaco-editor/react";
import { useTranslation } from "react-i18next";

export const useAiEnhance = () => {
	const { t } = useTranslation();
	const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
	const [selectedText, setSelectedText] = useState("");
	const [editorInstance, setEditorInstance] =
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useState<any | null>(null);

	const setupAiAction = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(ed: any, monaco: Monaco) => {
			setEditorInstance(ed);

			// Add "AI Enhance" action to the context menu
			ed.addAction({
				id: "ai-enhance-action",
				label: t("editor.ai_enhance", "✨ AI Enhance Selection..."),
				keybindings: [
					monaco.KeyMod.CtrlCmd |
						monaco.KeyMod.Shift |
						monaco.KeyCode.KeyE,
				],
				contextMenuGroupId: "navigation",
				contextMenuOrder: 1,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				run: (editor: any) => {
					const selection = editor.getSelection();
					if (selection && !selection.isEmpty()) {
						const text = editor
							.getModel()
							?.getValueInRange(selection);
						if (text) {
							setSelectedText(text);
							setIsAiDialogOpen(true);
						}
					}
				},
			});
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

	return {
		isAiDialogOpen,
		setIsAiDialogOpen,
		selectedText,
		setupAiAction,
		applyEnhancedText,
	};
};
