import { useState, useEffect, useCallback } from "react";
import { localStore } from "@/utils/storage";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/toast";
import { CONFIG } from "@/configurations";
import type { EditorEngine, ContentMode } from "@/types";

export type { EditorEngine };

export interface UseEditorEngineOptions {
	contentType?: ContentMode;
	isEdit?: boolean;
}

export function useEditorEngine(options?: UseEditorEngineOptions) {
	const isMobile = useIsMobile();
	const contentType = options?.contentType;
	const isEdit = options?.isEdit ?? false;

	// Plaintext on Home and Display screen in view mode (!isEdit) defaults to Simple Editor ("native").
	// Display screen in edit mode (isEdit === true) defaults to Monaco.
	const isPlaintextSimpleDefault = contentType === "text" && !isEdit;

	const storageKey = isPlaintextSimpleDefault
		? (CONFIG.storageKeys.plaintextEditorMode ??
			"snipit-plaintext-editor-mode")
		: CONFIG.storageKeys.editorEngine;

	const computeInitialEngine = useCallback((): EditorEngine => {
		if (typeof window !== "undefined") {
			const saved = localStore.getItem(storageKey);
			if (saved === "monaco" || saved === "native") {
				return saved;
			}
		}
		if (isPlaintextSimpleDefault) {
			return "native";
		}
		return isMobile ? "native" : "monaco";
	}, [storageKey, isPlaintextSimpleDefault, isMobile]);

	const [editorEngine, setEngineState] =
		useState<EditorEngine>(computeInitialEngine);

	// Synchronize engine state when contentType or isEdit changes
	useEffect(() => {
		setEngineState(computeInitialEngine());
	}, [computeInitialEngine]);

	// If no explicit preference stored, track mobile breakpoint changes for non-plaintext simple modes
	useEffect(() => {
		const saved = localStore.getItem(storageKey);
		if (!saved && !isPlaintextSimpleDefault) {
			setEngineState(isMobile ? "native" : "monaco");
		}
	}, [isMobile, storageKey, isPlaintextSimpleDefault]);

	// Synchronize engine state across components and storage
	useEffect(() => {
		const handleCustomChange = (e: Event) => {
			const detail = (
				e as CustomEvent<
					EditorEngine | { engine: EditorEngine; key?: string }
				>
			).detail;
			if (typeof detail === "string") {
				if (detail === "monaco" || detail === "native") {
					setEngineState(detail);
				}
			} else if (detail && typeof detail === "object") {
				if (!detail.key || detail.key === storageKey) {
					setEngineState(detail.engine);
				}
			}
		};

		const handleStorage = (e: StorageEvent) => {
			if (
				e.key === storageKey &&
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
	}, [storageKey]);

	const setEditorEngine = useCallback(
		(newEngine: EditorEngine) => {
			setEngineState(newEngine);
			localStore.setItem(storageKey, newEngine);

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
							new CustomEvent(
								CONFIG.events.transliterationChange,
								{
									detail: false,
								},
							),
						);
						toast.add({
							title: "Switched to Simple editor (Multilingual keyboard disabled)",
							type: "info",
						});
					}

					const isAiAutocompleteEnabled =
						localStore.getItem(
							CONFIG.storageKeys.aiAutocomplete,
						) === "true";
					if (isAiAutocompleteEnabled) {
						localStore.setItem(
							CONFIG.storageKeys.aiAutocomplete,
							"false",
						);
						window.dispatchEvent(
							new CustomEvent(
								CONFIG.events.aiAutocompleteChange,
								{
									detail: false,
								},
							),
						);
						toast.add({
							title: "Switched to Simple editor (AI Autocomplete disabled)",
							type: "info",
						});
					}
				}

				window.dispatchEvent(
					new CustomEvent<{ engine: EditorEngine; key: string }>(
						CONFIG.events.editorEngineChange,
						{
							detail: { engine: newEngine, key: storageKey },
						},
					),
				);
			}
		},
		[storageKey],
	);

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
