import React, { useState, useRef, useCallback, useEffect } from "react";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";
import { CONFIG } from "@/configurations";
import { TtsContext } from "./TtsContext";

export const TtsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { prepareSpeech, detectSpeechLanguage } = useApiHelpers();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [isPreparing, setIsPreparing] = useState(false);
	const [spokenText, setSpokenText] = useState("");
	const [currentVoice, setCurrentVoice] = useState("");
	const [currentLanguage, setCurrentLanguage] = useState("");
	const [currentEngine, setCurrentEngine] = useState("");
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const objectUrlRef = useRef<string | null>(null);

	const stop = useCallback(() => {
		window.speechSynthesis.cancel();

		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current = null;
		}

		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
			objectUrlRef.current = null;
		}

		setIsPlaying(false);
		setIsPaused(false);
		setIsPreparing(false);
		setCurrentTime(0);
		setDuration(0);
	}, []);

	const pause = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
		} else {
			window.speechSynthesis.pause();
		}
		setIsPaused(true);
	}, []);

	const resume = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.play().catch((err) => {
				console.error("Failed to resume playback:", err);
				stop();
			});
		} else {
			window.speechSynthesis.resume();
		}
		setIsPaused(false);
	}, [stop]);

	const seek = useCallback((time: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = time;
			setCurrentTime(time);
		}
	}, []);

	const speakWithBrowserFallback = useCallback(
		(textToSpeak: string) => {
			try {
				const utterance = new SpeechSynthesisUtterance(textToSpeak);
				utteranceRef.current = utterance;

				const voices = window.speechSynthesis.getVoices();
				const preferredVoice =
					voices.find(
						(v) =>
							v.name.includes("Google") ||
							v.name.includes("Natural"),
					) || voices[0];
				if (preferredVoice) utterance.voice = preferredVoice;

				const voiceName = preferredVoice?.name || "Default";
				setCurrentVoice(voiceName);
				setCurrentLanguage("English");
				setCurrentEngine("Browser Native (Fallback)");

				utterance.onstart = () => {
					setIsPlaying(true);
					setIsPreparing(false);
					toast.info("Playing text-to-speech", {
						description: `Language: English | Voice: ${voiceName} | Engine: Browser Native (Fallback)`,
						duration: 4000,
					});
				};

				utterance.onend = () => {
					stop();
				};

				utterance.onerror = () => {
					stop();
				};

				window.speechSynthesis.speak(utterance);
			} catch (fallbackError) {
				console.error("TTS Fallback failed:", fallbackError);
				stop();
			}
		},
		[stop],
	);

	const speakWithBrowserLanguageSpecific = useCallback(
		(textToSpeak: string, languageName: string) => {
			try {
				const utterance = new SpeechSynthesisUtterance(textToSpeak);
				utteranceRef.current = utterance;

				const voices = window.speechSynthesis.getVoices();

				const langMap: Record<string, string> = {
					hindi: "hi",
					japanese: "ja",
					spanish: "es",
					french: "fr",
					german: "de",
					italian: "it",
					korean: "ko",
					portuguese: "pt",
					chinese: "zh",
					russian: "ru",
				};
				const prefix = langMap[languageName.toLowerCase()] || "";

				let selectedVoice = null;
				if (prefix) {
					const langVoices = voices.filter((v) =>
						v.lang.toLowerCase().startsWith(prefix),
					);
					selectedVoice =
						langVoices.find(
							(v) =>
								v.name.toLowerCase().includes("female") ||
								v.name.toLowerCase().includes("google") ||
								v.name.toLowerCase().includes("natural"),
						) || langVoices[0];
				}

				if (!selectedVoice) {
					selectedVoice =
						voices.find(
							(v) =>
								v.name.includes("Google") ||
								v.name.includes("Natural"),
						) || voices[0];
				}

				if (selectedVoice) {
					utterance.voice = selectedVoice;
				}

				const voiceName = selectedVoice?.name || "Default";
				const langFormatted =
					languageName.charAt(0).toUpperCase() +
					languageName.slice(1);
				setCurrentVoice(voiceName);
				setCurrentLanguage(langFormatted);
				setCurrentEngine("Browser Native");

				utterance.onstart = () => {
					setIsPlaying(true);
					setIsPreparing(false);
					toast.info("Playing text-to-speech", {
						description: `Language: ${langFormatted} | Voice: ${voiceName} | Engine: Browser Native`,
						duration: 4000,
					});
				};

				utterance.onend = () => {
					stop();
				};

				utterance.onerror = () => {
					stop();
				};

				window.speechSynthesis.speak(utterance);
			} catch (fallbackError) {
				console.error("Browser language TTS failed:", fallbackError);
				stop();
			}
		},
		[stop],
	);

	const speak = useCallback(
		async (content: string, contentType: string) => {
			if (isPlaying) {
				stop();
				return;
			}

			stop();
			setIsPreparing(true);

			try {
				let textToSpeak = content;

				if (contentType === "richtext") {
					if (typeof document !== "undefined") {
						const tempDiv = document.createElement("div");
						tempDiv.innerHTML = content;
						textToSpeak =
							tempDiv.textContent || tempDiv.innerText || "";
					} else {
						textToSpeak = content.replace(/<[^>]*>/g, "");
					}
				}

				if (contentType === "markdown") {
					const response = await prepareSpeech(content, contentType);
					textToSpeak = response.text;
				}

				if (!textToSpeak) {
					setIsPreparing(false);
					return;
				}

				// Keep a preview of the text being spoken
				setSpokenText(textToSpeak);

				let isEnglish = true;
				let detectedLang = "english";
				try {
					const detectRes = await detectSpeechLanguage(textToSpeak);
					detectedLang = detectRes.language.toLowerCase();
					if (detectedLang !== "english") {
						isEnglish = false;
					}
				} catch (e) {
					console.warn(
						"Language detection failed, assuming English",
						e,
					);
				}

				if (!isEnglish) {
					speakWithBrowserLanguageSpecific(textToSpeak, detectedLang);
					return;
				}

				// Send the entire text at once and stream base64-encoded WAV chunks dynamically
				const response = await fetch(`${CONFIG.apiBaseUrl}/ai/tts`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text: textToSpeak }),
				});

				if (!response.ok) {
					speakWithBrowserFallback(textToSpeak);
					return;
				}

				const reader = response.body?.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				if (!reader) {
					speakWithBrowserFallback(textToSpeak);
					return;
				}

				const audioQueue: {
					index: number;
					total: number;
					voice: string;
					blob: Blob;
				}[] = [];
				let currentPlayingIndex = 0;
				let isPlayingQueue = false;

				const playQueue = async () => {
					if (isPlayingQueue) return;

					// Find the chunk corresponding to currentPlayingIndex
					const chunkIndex = audioQueue.findIndex(
						(c) => c.index === currentPlayingIndex,
					);
					if (chunkIndex === -1) {
						// If the next chunk is not ready yet, set isPreparing and wait
						setIsPreparing(true);
						return;
					}

					isPlayingQueue = true;
					setIsPreparing(false);

					const chunk = audioQueue[chunkIndex];
					const audioUrl = URL.createObjectURL(chunk.blob);

					if (objectUrlRef.current) {
						URL.revokeObjectURL(objectUrlRef.current);
					}
					objectUrlRef.current = audioUrl;

					const audio = new Audio(audioUrl);
					audioRef.current = audio;

					audio.ontimeupdate = () => {
						setCurrentTime(audio.currentTime);
					};
					audio.ondurationchange = () => {
						setDuration(audio.duration);
					};

					setCurrentVoice(chunk.voice);
					setCurrentLanguage("English");
					setCurrentEngine(
						`Local Kokoro TTS (q8 CPU) - Sentence ${chunk.index + 1}/${chunk.total}`,
					);

					audio.onplay = () => {
						setIsPlaying(true);
						setIsPreparing(false);
					};

					audio.onended = () => {
						isPlayingQueue = false;
						currentPlayingIndex++;

						// Check if we finished all chunks
						if (currentPlayingIndex >= chunk.total) {
							stop();
						} else {
							playQueue();
						}
					};

					audio.onerror = (e) => {
						console.warn(
							`Chunk ${chunk.index} playback failed, playing next`,
							e,
						);
						isPlayingQueue = false;
						currentPlayingIndex++;
						playQueue();
					};

					audio.play().catch((playError) => {
						console.warn("Play error", playError);
						isPlayingQueue = false;
						currentPlayingIndex++;
						playQueue();
					});
				};

				// Read stream loop
				const readStream = async () => {
					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							buffer += decoder.decode(value, { stream: true });
							const lines = buffer.split("\n");
							buffer = lines.pop() || ""; // keep unfinished line in buffer

							for (const line of lines) {
								if (!line.trim()) continue;
								try {
									const parsed = JSON.parse(line);

									// Convert base64 audio to Blob
									const binaryString = window.atob(
										parsed.audio,
									);
									const len = binaryString.length;
									const bytes = new Uint8Array(len);
									for (let i = 0; i < len; i++) {
										bytes[i] = binaryString.charCodeAt(i);
									}
									const audioBlob = new Blob([bytes], {
										type: "audio/wav",
									});

									audioQueue.push({
										index: parsed.index,
										total: parsed.total,
										voice: parsed.voice,
										blob: audioBlob,
									});

									// Trigger play queue (which will start playing if we are waiting for this index)
									playQueue();
								} catch (err) {
									console.error(
										"Failed to parse chunk JSON:",
										err,
									);
								}
							}
						}
					} catch (streamError) {
						console.error("Error reading TTS stream:", streamError);
					}
				};

				// Trigger background stream reading
				readStream();
			} catch (error) {
				console.error("TTS failed:", error);
				stop();
			}
		},
		[
			prepareSpeech,
			detectSpeechLanguage,
			speakWithBrowserLanguageSpecific,
			speakWithBrowserFallback,
			stop,
			isPlaying,
		],
	);

	useEffect(() => {
		return () => {
			stop();
		};
	}, [stop]);

	return (
		<TtsContext.Provider
			value={{
				isPlaying,
				isPaused,
				isPreparing,
				spokenText,
				currentVoice,
				currentLanguage,
				currentEngine,
				currentTime,
				duration,
				speak,
				pause,
				resume,
				stop,
				seek,
			}}
		>
			{children}
		</TtsContext.Provider>
	);
};
