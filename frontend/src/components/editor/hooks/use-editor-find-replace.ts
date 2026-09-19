import { useState, useMemo, useEffect } from "react";
import { type Editor } from "@tiptap/core";

export function useEditorFindReplace(
	activeEditor: Editor | null,
	isZenMode: boolean,
	setIsZenMode: (val: boolean) => void,
	onStatsUpdate?: (editor: Editor | null) => void,
) {
	const [showFindReplace, setShowFindReplace] = useState(false);
	const [findText, setFindText] = useState("");
	const [replaceText, setReplaceText] = useState("");

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "h" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				setShowFindReplace((prev) => !prev);
			}
			if (e.key === "Escape") {
				if (showFindReplace) setShowFindReplace(false);
				if (isZenMode) setIsZenMode(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [showFindReplace, isZenMode, setIsZenMode]);

	const matchCount = useMemo(() => {
		if (!showFindReplace || !activeEditor || !findText.trim()) return 0;
		let count = 0;
		activeEditor.state.doc.descendants((node) => {
			if (node.isText && node.text) {
				let index = 0;
				while (true) {
					index = node.text.indexOf(findText, index);
					if (index === -1) break;
					count++;
					index += findText.length;
				}
			}
		});
		return count;
	}, [showFindReplace, activeEditor, findText]);

	const handleReplace = (all = false) => {
		if (!activeEditor || !findText) return;

		const { state, view } = activeEditor;
		const { doc } = state;

		const occurrences: { from: number; to: number }[] = [];
		doc.descendants((node, pos) => {
			if (node.isText && node.text) {
				let index = 0;
				while (true) {
					index = node.text.indexOf(findText, index);
					if (index === -1) break;
					occurrences.push({
						from: pos + index,
						to: pos + index + findText.length,
					});
					index += findText.length;
				}
			}
		});

		if (occurrences.length === 0) return;

		if (all) {
			let tr = state.tr;
			for (let i = occurrences.length - 1; i >= 0; i--) {
				const { from, to } = occurrences[i];
				tr = tr.insertText(replaceText, from, to);
			}
			view.dispatch(tr);
		} else {
			const { from, to } = occurrences[0];
			const tr = state.tr.insertText(replaceText, from, to);
			view.dispatch(tr);
		}
		onStatsUpdate?.(activeEditor);
	};

	return {
		showFindReplace,
		setShowFindReplace,
		findText,
		setFindText,
		replaceText,
		setReplaceText,
		matchCount,
		handleReplace,
	};
}
