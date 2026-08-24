import { useState, useEffect, useCallback } from "react";
import { localStore } from "@/utils/storage";
import { useIsMobile } from "@/hooks/use-mobile";

export type EditorEngine = "monaco" | "native";

const STORAGE_KEY = "snipit_editor_engine";

export function useEditorEngine() {
	const isMobile = useIsMobile();
	const [editorEngine, setEngineState] = useState<EditorEngine>(() => {
		if (typeof window !== "undefined") {
			const saved = localStore.getItem(STORAGE_KEY);
			if (saved === "monaco" || saved === "native") {
				return saved;
			}
		}
		return isMobile ? "native" : "monaco";
	});

	// If no explicit preference stored, track mobile breakpoint changes
	useEffect(() => {
		const saved = localStore.getItem(STORAGE_KEY);
		if (!saved) {
			setEngineState(isMobile ? "native" : "monaco");
		}
	}, [isMobile]);

	const setEditorEngine = useCallback((newEngine: EditorEngine) => {
		setEngineState(newEngine);
		localStore.setItem(STORAGE_KEY, newEngine);
	}, []);

	const toggleEditorEngine = useCallback(() => {
		const next: EditorEngine =
			editorEngine === "monaco" ? "native" : "monaco";
		setEditorEngine(next);
		return next;
	}, [editorEngine, setEditorEngine]);

	return {
		editorEngine,
		setEditorEngine,
		toggleEditorEngine,
		isMobile,
	};
}
