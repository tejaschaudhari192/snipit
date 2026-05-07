import { useCallback, useRef, useEffect } from "react";
import type { Monaco } from "@monaco-editor/react";
import type {
	editor,
	languages,
	CancellationToken,
	Position,
} from "monaco-editor";
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
