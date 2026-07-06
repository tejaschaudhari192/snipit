import { useState, useRef, useEffect, useCallback } from "react";
import type { editor } from "monaco-editor";
import { getTransliteratedSuggestions } from "@/utils/transliteration-utils";

export function useTransliteration() {
	const [enabled, setEnabled] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("transliteration-enabled") === "true";
		}
		return false;
	});
	const [targetLanguage, setTargetLanguage] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("transliteration-lang") || "hi";
		}
		return "hi";
	});

	const providerRef = useRef<import("monaco-editor").IDisposable | null>(
		null,
	);
	const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

	useEffect(() => {
		localStorage.setItem("transliteration-enabled", enabled.toString());
		localStorage.setItem("transliteration-lang", targetLanguage);
	}, [enabled, targetLanguage]);

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
		setEnabled((prev) => !prev);
	}, []);

	const resetBuffer = useCallback(() => {}, []);

	return {
		enabled,
		targetLanguage,
		toggle,
		setTargetLanguage: handleLanguageChange,
		setupEditor,
		resetBuffer,
	};
}
