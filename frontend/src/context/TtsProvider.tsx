import React, { useState, useRef, useCallback, useEffect } from "react";
import { prepareSpeech, detectSpeechLanguage } from "@/lib/api/ai";
import { toast } from "@/components/ui/toast";
import { TtsContext } from "./TtsContext";

export const TtsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
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

	const isStoppedRef = useRef(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const stop = useCallback(() => {
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			window.speechSynthesis.cancel();
		}
		isStoppedRef.current = true;

		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
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
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			window.speechSynthesis.pause();
		}
		setIsPaused(true);
	}, []);

	const resume = useCallback(() => {
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			window.speechSynthesis.resume();
		}
		setIsPaused(false);
	}, []);

	const seek = useCallback((time: number) => {
		setCurrentTime(time);
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

				if (contentType === "docs") {
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

				if (
					typeof window === "undefined" ||
					!("speechSynthesis" in window)
				) {
					setIsPreparing(false);
					toast.add({
						title: "Speech not supported",
						description:
							"Your browser does not support speech synthesis.",
						type: "error",
					});
					return;
				}

				window.speechSynthesis.cancel();
				const utterance = new SpeechSynthesisUtterance(textToSpeak);

				const voices = window.speechSynthesis.getVoices();
				const voiceMatch =
					voices.find(
						(v) =>
							/natural|google us english|samantha|zira|victoria|female/i.test(
								v.name,
							) && v.lang.startsWith("en"),
					) || voices[0];

				if (voiceMatch) {
					utterance.voice = voiceMatch;
					setCurrentVoice(voiceMatch.name);
				} else {
					setCurrentVoice("Default System Voice");
				}

				setCurrentLanguage(detectedLang);
				setCurrentEngine("Web SpeechSynthesis");

				// Estimate approximate duration (150 words per min)
				const wordCount = textToSpeak.trim().split(/\s+/).length;
				const estimatedDuration = Math.max(
					3,
					Math.round((wordCount / 150) * 60),
				);
				setDuration(estimatedDuration);

				utterance.onstart = () => {
					setIsPlaying(true);
					setIsPreparing(false);
					toast.add({
						title: "Playing text-to-speech",
						description: `Language: ${detectedLang} | Engine: Web SpeechSynthesis`,
						timeout: 3000,
						type: "info",
					});

					const startTime = Date.now();
					timerRef.current = setInterval(() => {
						const elapsed = Math.round(
							(Date.now() - startTime) / 1000,
						);
						setCurrentTime(elapsed);
					}, 250);
				};

				utterance.onend = () => {
					stop();
				};

				utterance.onerror = (e) => {
					console.error("Speech synthesis error", e);
					stop();
				};

				window.speechSynthesis.speak(utterance);
			} catch (error) {
				console.error("TTS failed:", error);
				stop();
			}
		},
		[stop, isPlaying],
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
