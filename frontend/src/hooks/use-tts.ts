import { useState, useRef, useCallback, useEffect } from "react";
import { useApiHelpers } from "@/lib/api";
import { type editor } from "monaco-editor";

/**
 * Hook to manage Text-to-Speech with Monaco editor highlighting.
 */
export const useTts = () => {
	const { prepareSpeech } = useApiHelpers();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [isPreparing, setIsPreparing] = useState(false);

	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const decorationIdsRef = useRef<string[]>([]);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	/**
	 * Stops the current speech and clears all highlights.
	 */
	const stop = useCallback(() => {
		window.speechSynthesis.cancel();
		setIsPlaying(false);
		setIsPaused(false);
		setIsPreparing(false);

		if (editorRef.current && decorationIdsRef.current.length > 0) {
			editorRef.current.deltaDecorations(decorationIdsRef.current, []);
			decorationIdsRef.current = [];
		}
	}, []);

	/**
	 * Pauses the current speech.
	 */
	const pause = useCallback(() => {
		window.speechSynthesis.pause();
		setIsPaused(true);
	}, []);

	/**
	 * Resumes the current speech.
	 */
	const resume = useCallback(() => {
		window.speechSynthesis.resume();
		setIsPaused(false);
	}, []);

	/**
	 * Prepares and starts the Text-to-Speech process.
	 */
	const speak = useCallback(
		async (
			content: string,
			contentType: string,
			editor: editor.IStandaloneCodeEditor,
		) => {
			if (isPlaying) {
				stop();
				return;
			}

			stop();
			setIsPreparing(true);
			editorRef.current = editor;

			try {
				let spokenText = content;

				// Only call backend if text needs processing (Markdown)
				if (contentType === "markdown") {
					const response = await prepareSpeech(content, contentType);
					spokenText = response.text;
				}

				if (!spokenText) {
					setIsPreparing(false);
					return;
				}

				const utterance = new SpeechSynthesisUtterance(spokenText);
				utteranceRef.current = utterance;

				// Use a natural sounding voice if available
				const voices = window.speechSynthesis.getVoices();
				const preferredVoice =
					voices.find(
						(v) =>
							v.name.includes("Google") ||
							v.name.includes("Natural"),
					) || voices[0];
				if (preferredVoice) utterance.voice = preferredVoice;

				utterance.onstart = () => {
					setIsPlaying(true);
					setIsPreparing(false);
				};

				utterance.onend = () => {
					stop();
				};

				utterance.onerror = () => {
					stop();
				};

				utterance.onboundary = (event) => {
					if (event.name === "word" && editorRef.current) {
						const charIndex = event.charIndex;
						const wordMatch = spokenText
							.slice(charIndex)
							.match(/^[^\s,.;:!?]+/);
						const word = wordMatch ? wordMatch[0] : "";

						if (!word) return;

						const model = editorRef.current.getModel();
						if (!model) return;

						// Best-effort mapping:
						// If text is verbatim (plaintext), use direct index.
						// If text was processed (code/markdown), search for the word near the estimated position.
						let targetIndex = charIndex;
						if (contentType !== "text") {
							const editorValue = model.getValue();
							// Search within a buffer of the current spoken index
							const searchBuffer = editorValue.indexOf(
								word,
								Math.max(0, charIndex - 50),
							);
							if (searchBuffer !== -1) {
								targetIndex = searchBuffer;
							} else {
								// Fallback to global search if buffer fails
								const globalSearch = editorValue.indexOf(word);
								if (globalSearch !== -1)
									targetIndex = globalSearch;
							}
						}

						const startPos = model.getPositionAt(targetIndex);
						const endPos = model.getPositionAt(
							targetIndex + word.length,
						);

						decorationIdsRef.current =
							editorRef.current.deltaDecorations(
								decorationIdsRef.current,
								[
									{
										range: {
											startLineNumber:
												startPos.lineNumber,
											startColumn: startPos.column,
											endLineNumber: endPos.lineNumber,
											endColumn: endPos.column,
										},
										options: {
											className: "speech-highlight",
											inlineClassName:
												"speech-highlight-inline",
											stickiness: 1, // NeverGrowsOnTyping
										},
									},
								],
							);

						// Optional: Scroll to the word if it's out of view
						editorRef.current.revealRangeInCenterIfOutsideViewport({
							startLineNumber: startPos.lineNumber,
							startColumn: startPos.column,
							endLineNumber: endPos.lineNumber,
							endColumn: endPos.column,
						});
					}
				};

				window.speechSynthesis.speak(utterance);
			} catch (error) {
				console.error("TTS failed:", error);
				setIsPreparing(false);
			}
		},
		[prepareSpeech, stop, isPlaying],
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			window.speechSynthesis.cancel();
		};
	}, []);

	return {
		speak,
		pause,
		resume,
		stop,
		isPlaying,
		isPaused,
		isPreparing,
	};
};
