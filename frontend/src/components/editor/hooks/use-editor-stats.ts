import { useState, useRef, useCallback, useEffect } from "react";
import { type Editor } from "@tiptap/core";

export interface EditorStats {
	words: number;
	characters: number;
	readTime: number;
}

export function useEditorStats(activeEditor: Editor | null) {
	const statsDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const [stats, setStats] = useState<EditorStats>({
		words: 0,
		characters: 0,
		readTime: 0,
	});

	const updateStatsDebounced = useCallback(
		(editorInstance: Editor | null) => {
			if (!editorInstance) return;
			if (statsDebounceTimerRef.current) {
				clearTimeout(statsDebounceTimerRef.current);
			}
			statsDebounceTimerRef.current = setTimeout(() => {
				if (!editorInstance || editorInstance.isDestroyed) return;
				const text = editorInstance.getText();
				const charCount = text.length;
				const wordCount =
					text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
				const readingTime = Math.ceil(wordCount / 200);
				setStats({
					words: wordCount,
					characters: charCount,
					readTime: readingTime,
				});
			}, 150);
		},
		[],
	);

	useEffect(() => {
		updateStatsDebounced(activeEditor);
		return () => {
			if (statsDebounceTimerRef.current) {
				clearTimeout(statsDebounceTimerRef.current);
			}
		};
	}, [activeEditor, updateStatsDebounced]);

	return { stats, updateStatsDebounced };
}
