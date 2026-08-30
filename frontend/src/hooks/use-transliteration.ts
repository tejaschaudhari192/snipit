import { localStore } from "@/utils/storage";
import { useState, useRef, useEffect, useCallback } from "react";
import type { editor } from "monaco-editor";
import { getTransliteratedSuggestions } from "@/utils/transliteration-utils";
import { toast } from "@/components/ui/toast";
import { CONFIG } from "@/configurations";

export function useTransliteration() {
	const [enabled, setEnabled] = useState(() => {
		if (typeof window !== "undefined") {
			return (
				localStore.getItem(
					CONFIG.storageKeys.transliterationEnabled,
				) === "true"
			);
		}
		return false;
	});
	const [targetLanguage, setTargetLanguage] = useState(() => {
		if (typeof window !== "undefined") {
			return (
				localStore.getItem(CONFIG.storageKeys.transliterationLang) ||
				"hi"
			);
		}
		return "hi";
	});

	const providerRef = useRef<import("monaco-editor").IDisposable | null>(
		null,
	);
	const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

	useEffect(() => {
		localStore.setItem(
			CONFIG.storageKeys.transliterationEnabled,
			enabled.toString(),
		);
		localStore.setItem(
			CONFIG.storageKeys.transliterationLang,
			targetLanguage,
		);
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
			if (e.key === CONFIG.storageKeys.transliterationEnabled) {
				setEnabled(e.newValue === "true");
			} else if (
				e.key === CONFIG.storageKeys.transliterationLang &&
				e.newValue
			) {
				setTargetLanguage(e.newValue);
			}
		};

		window.addEventListener(
			CONFIG.events.transliterationChange,
			handleTransliterationChange,
		);
		window.addEventListener("storage", handleStorage);
		return () => {
			window.removeEventListener(
				CONFIG.events.transliterationChange,
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
				localStore.setItem(
					CONFIG.storageKeys.transliterationEnabled,
					next.toString(),
				);
				window.dispatchEvent(
					new CustomEvent(CONFIG.events.transliterationChange, {
						detail: next,
					}),
				);

				if (next) {
					const currentEngine = localStore.getItem(
						CONFIG.storageKeys.editorEngine,
					);
					if (currentEngine === "native") {
						localStore.setItem(
							CONFIG.storageKeys.editorEngine,
							"monaco",
						);
						window.dispatchEvent(
							new CustomEvent(CONFIG.events.editorEngineChange, {
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
