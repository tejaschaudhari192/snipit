import { useState, useCallback } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTranslation } from "react-i18next";

export const useAiEnhance = () => {
	const { t } = useTranslation();
	const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
	const [selectedText, setSelectedText] = useState("");
	const [editorInstance, setEditorInstance] =
		useState<editor.IStandaloneCodeEditor | null>(null);

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
				t("editor.ai_enhance", "✨ AI Enhance Selection..."),
				"",
				monaco.KeyMod.CtrlCmd |
					monaco.KeyMod.Shift |
					monaco.KeyCode.KeyE,
			);

			registerAiAction(
				"ai-explain-action",
				t("editor.ai_explain", "📖 Explain this Code"),
				"Explain this code logic simply but thoroughly.",
			);

			registerAiAction(
				"ai-refactor-action",
				t("editor.ai_refactor", "🛠️ Refactor Selection"),
				"Refactor this code to be more clean, efficient, and readable.",
			);

			registerAiAction(
				"ai-fix-action",
				t("editor.ai_fix", "🐛 Fix Bugs in Selection"),
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

	return {
		isAiDialogOpen,
		setIsAiDialogOpen,
		selectedText,
		prefillInstruction,
		setupAiAction,
		applyEnhancedText,
	};
};
