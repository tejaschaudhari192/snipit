import { useState, useEffect, useCallback } from "react";
import { localStore } from "@/utils/storage";
import { useIsMobile } from "@/hooks/use-mobile";

export type EditorEngine = "monaco" | "native";

const STORAGE_KEY = "snipit_editor_engine";
const CHANGE_EVENT = "snipit_editor_engine_change";

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

	// Synchronize engine state across components and storage
	useEffect(() => {
		const handleCustomChange = (e: Event) => {
			const detail = (e as CustomEvent<EditorEngine>).detail;
			if (detail === "monaco" || detail === "native") {
				setEngineState(detail);
			}
		};

		const handleStorage = (e: StorageEvent) => {
			if (
				e.key === STORAGE_KEY &&
				(e.newValue === "monaco" || e.newValue === "native")
			) {
				setEngineState(e.newValue);
			}
		};

		window.addEventListener(CHANGE_EVENT, handleCustomChange);
		window.addEventListener("storage", handleStorage);
		return () => {
			window.removeEventListener(CHANGE_EVENT, handleCustomChange);
			window.removeEventListener("storage", handleStorage);
		};
	}, []);

	const setEditorEngine = useCallback((newEngine: EditorEngine) => {
		setEngineState(newEngine);
		localStore.setItem(STORAGE_KEY, newEngine);
		if (typeof window !== "undefined") {
			window.dispatchEvent(
				new CustomEvent<EditorEngine>(CHANGE_EVENT, {
					detail: newEngine,
				}),
			);
		}
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
