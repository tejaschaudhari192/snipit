import { localStore } from "@/utils/storage";
import { useState, useRef, useEffect, useCallback } from "react";
import type { editor } from "monaco-editor";
import { getTransliteratedSuggestions } from "@/utils/transliteration-utils";
import { toast } from "@/components/ui/toast";

export const TRANSLITERATION_CHANGE_EVENT = "snipit_transliteration_change";

export function useTransliteration() {
	const [enabled, setEnabled] = useState(() => {
		if (typeof window !== "undefined") {
			return localStore.getItem("transliteration-enabled") === "true";
		}
		return false;
	});
	const [targetLanguage, setTargetLanguage] = useState(() => {
		if (typeof window !== "undefined") {
			return localStore.getItem("transliteration-lang") || "hi";
		}
		return "hi";
	});

	const providerRef = useRef<import("monaco-editor").IDisposable | null>(
		null,
	);
	const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

	useEffect(() => {
		localStore.setItem("transliteration-enabled", enabled.toString());
		localStore.setItem("transliteration-lang", targetLanguage);
	}, [enabled, targetLanguage]);

	// Synchronize transliteration state across all component hook instances
	useEffect(() => {
		const handleTransliterationChange = (e: Event) => {
			const detail = (e as CustomEvent<boolean>).detail;
			if (typeof detail === "boolean") {
				setEnabled(detail);
			}
		};

		const handleStorage = (e: StorageEvent) => {
			if (e.key === "transliteration-enabled") {
				setEnabled(e.newValue === "true");
			} else if (e.key === "transliteration-lang" && e.newValue) {
				setTargetLanguage(e.newValue);
			}
		};

		window.addEventListener(
			TRANSLITERATION_CHANGE_EVENT,
			handleTransliterationChange,
		);
		window.addEventListener("storage", handleStorage);
		return () => {
			window.removeEventListener(
				TRANSLITERATION_CHANGE_EVENT,
				handleTransliterationChange,
			);
			window.removeEventListener("storage", handleStorage);
		};
	}, []);

	const setupEditor = useCallback(
		(
			_ed: editor.IStandaloneCodeEditor,
			monaco: typeof import("monaco-editor"),
		) => {
			monacoRef.current = monaco;

			if (providerRef.current) {
				providerRef.current.dispose();
			}

			providerRef.current =
				monaco.languages.registerCompletionItemProvider("*", {
					triggerCharacters:
						"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(
							"",
						),
					provideCompletionItems: (model, position) => {
						if (!enabled) return { suggestions: [] };

						const wordInfo = model.getWordUntilPosition(position);
						const word = wordInfo.word;

						if (!word || !/^[a-zA-Z]+$/.test(word)) {
							return { suggestions: [] };
						}

						const indicWords = getTransliteratedSuggestions(
							word,
							targetLanguage,
						);

						const suggestions: import("monaco-editor").languages.CompletionItem[] =
							[];
						const range = new monaco.Range(
							position.lineNumber,
							wordInfo.startColumn,
							position.lineNumber,
							wordInfo.endColumn,
						);

						indicWords.forEach((indicWord, index) => {
							suggestions.push({
								label: indicWord,
								kind: monaco.languages.CompletionItemKind.Text,
								insertText: indicWord,
								range: range,
								sortText: String(index).padStart(2, "0"),
								detail: "Transliteration",
								filterText: wordInfo.word,
							});
						});

						// Always offer the original english word at the end
						suggestions.push({
							label: wordInfo.word,
							kind: monaco.languages.CompletionItemKind.Text,
							insertText: wordInfo.word,
							range: range,
							sortText: "99",
							detail: "Original",
							filterText: wordInfo.word,
						});

						return { suggestions };
					},
				});
		},
		[enabled, targetLanguage],
	);

	useEffect(() => {
		if (monacoRef.current) {
			if (providerRef.current) {
				providerRef.current.dispose();
			}

			const monaco = monacoRef.current;
			providerRef.current =
				monaco.languages.registerCompletionItemProvider("*", {
					triggerCharacters:
						"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(
							"",
						),
					provideCompletionItems: (model, position) => {
						if (!enabled) return { suggestions: [] };

						const wordInfo = model.getWordUntilPosition(position);
						const word = wordInfo.word;

						if (!word || !/^[a-zA-Z]+$/.test(word)) {
							return { suggestions: [] };
						}

						const indicWords = getTransliteratedSuggestions(
							word,
							targetLanguage,
						);

						const suggestions: import("monaco-editor").languages.CompletionItem[] =
							[];
						const range = new monaco.Range(
							position.lineNumber,
							wordInfo.startColumn,
							position.lineNumber,
							wordInfo.endColumn,
						);

						indicWords.forEach((indicWord, index) => {
							suggestions.push({
								label: indicWord,
								kind: monaco.languages.CompletionItemKind.Text,
								insertText: indicWord,
								range: range,
								sortText: String(index).padStart(2, "0"),
								detail: "Transliteration",
								filterText: wordInfo.word,
							});
						});

						suggestions.push({
							label: wordInfo.word,
							kind: monaco.languages.CompletionItemKind.Text,
							insertText: wordInfo.word,
							range: range,
							sortText: "99",
							detail: "Original",
							filterText: wordInfo.word,
						});

						return { suggestions };
					},
				});
		}

		return () => {
			if (providerRef.current) {
				providerRef.current.dispose();
			}
		};
	}, [enabled, targetLanguage]);

	const handleLanguageChange = useCallback((lang: string) => {
		setTargetLanguage(lang);
	}, []);

	const toggle = useCallback(() => {
		setEnabled((prev) => {
			const next = !prev;
			if (typeof window !== "undefined") {
				localStore.setItem("transliteration-enabled", next.toString());
				window.dispatchEvent(
					new CustomEvent(TRANSLITERATION_CHANGE_EVENT, {
						detail: next,
					}),
				);

				if (next) {
					const currentEngine = localStore.getItem(
						"snipit_editor_engine",
					);
					if (currentEngine === "native") {
						localStore.setItem("snipit_editor_engine", "monaco");
						window.dispatchEvent(
							new CustomEvent("snipit_editor_engine_change", {
								detail: "monaco",
							}),
						);
						toast.add({
							title: "Switched to Monaco editor for Multilingual typing",
							type: "info",
						});
					}
				}
			}
			return next;
		});
	}, []);

	return {
		enabled,
		targetLanguage,
		toggle,
		setTargetLanguage: handleLanguageChange,
		setupEditor,
	};
}
