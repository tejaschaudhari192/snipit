import { useCallback, useRef, useEffect } from "react";
import type { Monaco } from "@monaco-editor/react";
import type {
	editor,
	languages,
	CancellationToken,
	Position,
} from "monaco-editor";
import { getAutocomplete } from "@/lib/api/ai";
import { processAiCompletion, getMonacoContext } from "@/utils/ai-autocomplete";

interface UseAiAutocompleteOptions {
	language: string;
	enabled: boolean;
}

export const useAiAutocomplete = ({
	language,
	enabled,
}: UseAiAutocompleteOptions) => {
	const providerRef = useRef<{ dispose: () => void } | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const cacheRef = useRef<Map<string, string>>(new Map());

	const setupAutocomplete = useCallback(
		(_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
			// Dispose previous provider if any
			if (providerRef.current) {
				providerRef.current.dispose();
				providerRef.current = null;
			}

			if (!enabled) return;

			const provider = monaco.languages.registerInlineCompletionsProvider(
				{ pattern: "**" },
				{
					provideInlineCompletions: async (
						model: editor.ITextModel,
						position: Position,
						_ctx: languages.InlineCompletionContext,
						token: CancellationToken,
					) => {
						const { prefix, suffix } = getMonacoContext(
							model,
							position,
						);

						if (prefix.trim().length < 3) {
							return { items: [] };
						}

						// Check local cache key: language + last 200 chars of prefix
						const cacheKey = `${language}::${prefix.slice(-200)}`;
						if (cacheRef.current.has(cacheKey)) {
							const cached = cacheRef.current.get(cacheKey)!;
							if (cached) {
								return {
									items: [
										{
											insertText: cached,
											range: {
												startLineNumber:
													position.lineNumber,
												startColumn: position.column,
												endLineNumber:
													position.lineNumber,
												endColumn: position.column,
											},
										},
									],
								};
							}
						}

						// Cancel previous in-flight request
						abortRef.current?.abort();
						const abortController = new AbortController();
						abortRef.current = abortController;

						// Snappy Debounce: wait 250ms after last keystroke
						await new Promise<void>((resolve, reject) => {
							const timeout = setTimeout(resolve, 250);
							token.onCancellationRequested(() => {
								clearTimeout(timeout);
								abortController.abort();
								reject(new Error("cancelled"));
							});
						});

						if (
							token.isCancellationRequested ||
							abortController.signal.aborted
						) {
							return { items: [] };
						}

						try {
							const { completion } = await getAutocomplete(
								language,
								prefix,
								suffix,
								abortController.signal,
							);

							if (
								!completion ||
								token.isCancellationRequested ||
								abortController.signal.aborted
							) {
								return { items: [] };
							}

							const processed = processAiCompletion(
								completion,
								prefix,
							);

							if (!processed) return { items: [] };

							// Save to cache (limit size to 100 entries)
							if (cacheRef.current.size > 100) {
								const firstKey = cacheRef.current
									.keys()
									.next().value;
								if (firstKey) cacheRef.current.delete(firstKey);
							}
							cacheRef.current.set(cacheKey, processed);

							return {
								items: [
									{
										insertText: processed,
										range: {
											startLineNumber:
												position.lineNumber,
											startColumn: position.column,
											endLineNumber: position.lineNumber,
											endColumn: position.column,
										},
									},
								],
							};
						} catch {
							return { items: [] };
						}
					},
					freeInlineCompletions: () => {},
				},
			);

			providerRef.current = provider;
		},
		[enabled, language],
	);

	useEffect(() => {
		return () => {
			if (providerRef.current) {
				providerRef.current.dispose();
			}
			if (abortRef.current) {
				abortRef.current.abort();
			}
		};
	}, []);

	return { setupAutocomplete };
};
