import React, { useState, useRef, useCallback, useEffect } from "react";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";
import { TtsContext } from "./TtsContext";
import { initKokoro, generateSpeechClient } from "@/services/kokoro-client";

// Helper functions for WAV encoding in browser
const writeString = (view: DataView, offset: number, str: string) => {
	for (let i = 0; i < str.length; i++) {
		view.setUint8(offset + i, str.charCodeAt(i));
	}
};

const floatTo16BitPCM = (
	output: DataView,
	offset: number,
	input: Float32Array,
) => {
	for (let i = 0; i < input.length; i++, offset += 2) {
		const s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
};

const encodeWAV = (samples: Float32Array, sampleRate = 24000) => {
	const buffer = new ArrayBuffer(44 + samples.length * 2);
	const view = new DataView(buffer);

	/* RIFF identifier */
	writeString(view, 0, "RIFF");
	/* file length */
	view.setUint32(4, 36 + samples.length * 2, true);
	/* RIFF type */
	writeString(view, 8, "WAVE");
	/* format chunk identifier */
	writeString(view, 12, "fmt ");
	/* format chunk length */
	view.setUint32(16, 16, true);
	/* sample format (raw) */
	view.setUint16(20, 1, true);
	/* channel count */
	view.setUint16(22, 1, true);
	/* sample rate */
	view.setUint32(24, sampleRate, true);
	/* byte rate (sample rate * block align) */
	view.setUint32(28, sampleRate * 2, true);
	/* block align (channel count * bytes per sample) */
	view.setUint16(32, 2, true);
	/* bits per sample */
	view.setUint16(34, 16, true);
	/* data chunk identifier */
	writeString(view, 36, "data");
	/* data chunk length */
	view.setUint32(40, samples.length * 2, true);

	floatTo16BitPCM(view, 44, samples);

	return new Blob([view], { type: "audio/wav" });
};

export const TtsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { prepareSpeech, detectSpeechLanguage } = useApiHelpers();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [isPreparing, setIsPreparing] = useState(false);
	const [isModelLoading, setIsModelLoading] = useState(false);
	const [modelProgress, setModelProgress] = useState(0);
	const [spokenText, setSpokenText] = useState("");
	const [currentVoice, setCurrentVoice] = useState("");
	const [currentLanguage, setCurrentLanguage] = useState("");
	const [currentEngine, setCurrentEngine] = useState("");
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const objectUrlRef = useRef<string | null>(null);
	const isStoppedRef = useRef(false);

	const stop = useCallback(() => {
		window.speechSynthesis.cancel();
		isStoppedRef.current = true;

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
		setIsModelLoading(false);
		setModelProgress(0);
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
							v.lang.toLowerCase().startsWith("en") &&
							(v.name.includes("Google") ||
								v.name.includes("Natural")),
					) ||
					voices.find((v) => v.lang.toLowerCase().startsWith("en")) ||
					voices[0];
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
			isStoppedRef.current = false;
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

				const nonEnglishLangs = [
					"hindi",
					"hi",
					"japanese",
					"ja",
					"spanish",
					"es",
					"french",
					"fr",
					"german",
					"de",
					"italian",
					"it",
					"korean",
					"ko",
					"portuguese",
					"pt",
					"chinese",
					"zh",
					"russian",
					"ru",
				];
				let isEnglish = true;
				let detectedLang = "english";
				try {
					const detectRes = await detectSpeechLanguage(textToSpeak);
					detectedLang = detectRes.language.toLowerCase().trim();
					if (nonEnglishLangs.includes(detectedLang)) {
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

				// Determine client-side voice selection dynamically based on keywords
				let selectedVoice = "af_heart"; // Default soft, warm, high-pitched female
				const lower = textToSpeak.toLowerCase();
				if (
					lower.includes("colour") ||
					lower.includes("neighbour") ||
					lower.includes("cheerio") ||
					lower.includes("london") ||
					lower.includes("mate")
				) {
					selectedVoice = "bf_emma"; // Soft British Female
				} else if (
					textToSpeak.includes("!") ||
					lower.includes("wow") ||
					lower.includes("love") ||
					lower.includes("great")
				) {
					selectedVoice = "af_bella"; // Highly expressive, soft American Female
				}

				// Load model and report progress if not already loaded
				setIsModelLoading(true);
				setModelProgress(0);

				await initKokoro((progress) => {
					setModelProgress(progress);
				});

				setIsModelLoading(false);

				if (isStoppedRef.current) return;

				// Split text into sentence chunks to generate them one by one for low-latency playback
				const sentences = textToSpeak.match(
					/[^.!?。！？\n]+(?:[.!?。！？\n]|\s*|$)/g,
				) || [textToSpeak];
				const cleanSentences = sentences
					.map((s) => s.trim())
					.filter((s) => s.length > 0);

				if (cleanSentences.length === 0) {
					setIsPreparing(false);
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
					if (isPlayingQueue || isStoppedRef.current) return;

					const chunkIndex = audioQueue.findIndex(
						(c) => c.index === currentPlayingIndex,
					);
					if (chunkIndex === -1) {
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
						`Client Kokoro TTS (WebGPU/WASM) - Sentence ${chunk.index + 1}/${chunk.total}`,
					);

					audio.onplay = () => {
						setIsPlaying(true);
						setIsPreparing(false);
					};

					audio.onended = () => {
						isPlayingQueue = false;
						currentPlayingIndex++;

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

				// Generate sentences in the background and feed the queue
				const totalSentences = cleanSentences.length;

				// Run generation sequentially to avoid memory spikes and keep cpu usage stable
				(async () => {
					try {
						for (let i = 0; i < totalSentences; i++) {
							if (isStoppedRef.current) break;

							const sentence = cleanSentences[i];
							const { audio } = await generateSpeechClient(
								sentence,
								selectedVoice,
							);

							if (isStoppedRef.current) break;

							// Encode Float32Array to standard WAV Blob on-the-fly
							const audioBlob = encodeWAV(audio);

							audioQueue.push({
								index: i,
								total: totalSentences,
								voice: selectedVoice,
								blob: audioBlob,
							});

							// Notify/trigger queue playback
							playQueue();
						}
					} catch (genError) {
						console.error(
							"Client-side voice generation error:",
							genError,
						);
						// Fallback to browser TTS if the client generation crashes
						speakWithBrowserFallback(textToSpeak);
					}
				})();
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
				isModelLoading,
				modelProgress,
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
