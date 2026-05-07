import { useCallback, useRef, useEffect } from "react";
import type { Monaco } from "@monaco-editor/react";
import { useApiHelpers } from "@/lib/api";
import { processAiCompletion, getMonacoContext } from "@/utils/ai-autocomplete";

interface UseAiAutocompleteOptions {
	language: string;
	enabled: boolean;
}

export const useAiAutocomplete = ({
	language,
	enabled,
}: UseAiAutocompleteOptions) => {
	const apiHelpers = useApiHelpers();
	const providerRef = useRef<{ dispose: () => void } | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const setupAutocomplete = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(_editor: any, monaco: Monaco) => {
			// Dispose previous provider if any
			if (providerRef.current) {
				providerRef.current.dispose();
				providerRef.current = null;
			}

			if (!enabled) return;

			const provider = monaco.languages.registerInlineCompletionsProvider(
				{ pattern: "**" },
				{
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					provideInlineCompletions: async (
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						model: any,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						position: any,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						_ctx: any,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						token: any,
					) => {
						// Cancel previous in-flight request
						abortRef.current?.abort();
						abortRef.current = new AbortController();

						// Debounce: wait 500ms after last keystroke
						await new Promise<void>((resolve, reject) => {
							const timeout = setTimeout(resolve, 500);
							token.onCancellationRequested(() => {
								clearTimeout(timeout);
								reject(new Error("cancelled"));
							});
						});

						const { prefix, suffix } = getMonacoContext(
							model,
							position,
						);

						if (prefix.trim().length < 3) {
							return { items: [] };
						}

						try {
							const { completion } =
								await apiHelpers.getAutocomplete(
									language,
									prefix,
									suffix,
								);

							if (!completion || token.isCancellationRequested) {
								return { items: [] };
							}

							const processed = processAiCompletion(
								completion,
								prefix,
							);

							if (!processed) return { items: [] };

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
		[enabled, language, apiHelpers],
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
