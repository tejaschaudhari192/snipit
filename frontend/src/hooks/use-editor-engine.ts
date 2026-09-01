import { useState, useEffect, useCallback } from "react";
import { localStore } from "@/utils/storage";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/toast";
import { CONFIG } from "@/configurations";
import type { EditorEngine } from "@/types";

export type { EditorEngine };

export function useEditorEngine() {
	const isMobile = useIsMobile();
	const [editorEngine, setEngineState] = useState<EditorEngine>(() => {
		if (typeof window !== "undefined") {
			const saved = localStore.getItem(CONFIG.storageKeys.editorEngine);
			if (saved === "monaco" || saved === "native") {
				return saved;
			}
		}
		return isMobile ? "native" : "monaco";
	});

	// If no explicit preference stored, track mobile breakpoint changes
	useEffect(() => {
		const saved = localStore.getItem(CONFIG.storageKeys.editorEngine);
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
				e.key === CONFIG.storageKeys.editorEngine &&
				(e.newValue === "monaco" || e.newValue === "native")
			) {
				setEngineState(e.newValue);
			}
		};

		window.addEventListener(
			CONFIG.events.editorEngineChange,
			handleCustomChange,
		);
		window.addEventListener("storage", handleStorage);
		return () => {
			window.removeEventListener(
				CONFIG.events.editorEngineChange,
				handleCustomChange,
			);
			window.removeEventListener("storage", handleStorage);
		};
	}, []);

	const setEditorEngine = useCallback((newEngine: EditorEngine) => {
		setEngineState(newEngine);
		localStore.setItem(CONFIG.storageKeys.editorEngine, newEngine);

		if (typeof window !== "undefined") {
			// If switching to native editor while transliteration is active, disable transliteration
			if (newEngine === "native") {
				const isTransliterationEnabled =
					localStore.getItem(
						CONFIG.storageKeys.transliterationEnabled,
					) === "true";
				if (isTransliterationEnabled) {
					localStore.setItem(
						CONFIG.storageKeys.transliterationEnabled,
						"false",
					);
					window.dispatchEvent(
						new CustomEvent(CONFIG.events.transliterationChange, {
							detail: false,
						}),
					);
					toast.add({
						title: "Switched to Simple editor (Multilingual keyboard disabled)",
						type: "info",
					});
				}

				const isAiAutocompleteEnabled =
					localStore.getItem(CONFIG.storageKeys.aiAutocomplete) ===
					"true";
				if (isAiAutocompleteEnabled) {
					localStore.setItem(
						CONFIG.storageKeys.aiAutocomplete,
						"false",
					);
					window.dispatchEvent(
						new CustomEvent(CONFIG.events.aiAutocompleteChange, {
							detail: false,
						}),
					);
					toast.add({
						title: "Switched to Simple editor (AI Autocomplete disabled)",
						type: "info",
					});
				}
			}

			window.dispatchEvent(
				new CustomEvent<EditorEngine>(
					CONFIG.events.editorEngineChange,
					{
						detail: newEngine,
					},
				),
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
