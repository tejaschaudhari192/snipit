import React, { useState, useRef, useCallback, useEffect } from "react";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";
import { TtsContext } from "./TtsContext";
import { generatePuterSpeech } from "@/lib/puter-tts";

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

				let detectedLang = "English";
				try {
					const detectRes = await detectSpeechLanguage(textToSpeak);
					detectedLang =
						detectRes.language.charAt(0).toUpperCase() +
						detectRes.language.slice(1);
				} catch (e) {
					console.warn(
						"Language detection failed, assuming English",
						e,
					);
				}

				if (isStoppedRef.current) return;

				try {
					const audio = await generatePuterSpeech(textToSpeak);
					audioRef.current = audio;

					audio.ontimeupdate = () =>
						setCurrentTime(audio.currentTime);
					audio.ondurationchange = () => setDuration(audio.duration);

					setCurrentVoice("Nova (OpenAI)");
					setCurrentLanguage(detectedLang);
					setCurrentEngine("Puter.js (Cloud TTS)");

					audio.onplay = () => {
						setIsPlaying(true);
						setIsPreparing(false);
						toast.info("Playing text-to-speech", {
							description: `Language: ${detectedLang} | Voice: Nova | Engine: Puter.js`,
							duration: 4000,
						});
					};

					audio.onended = () => {
						stop();
					};

					audio.onerror = (e) => {
						console.error("Audio playback error", e);
						stop();
					};

					await audio.play();
				} catch (puterError) {
					console.error("Puter.js TTS failed:", puterError);
					stop();
				}
			} catch (error) {
				console.error("TTS failed:", error);
				stop();
			}
		},
		[prepareSpeech, detectSpeechLanguage, stop, isPlaying],
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
