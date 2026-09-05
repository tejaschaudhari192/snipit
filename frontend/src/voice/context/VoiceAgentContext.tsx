import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { VoiceAgentStatus } from "../types/voice.types";
import { SessionMemory } from "../memory/session-memory";
import { SpeechListenerEngine } from "../engine/speech-listener";
import { SpeechSpeakerEngine } from "../engine/speech-speaker";
import { ActionDispatcher } from "../engine/action-dispatcher";
import { VoiceBrain } from "../engine/voice-brain";
import { ScreenPerceiver } from "../engine/screen-perceiver";
import { ResultSummarizer } from "../engine/result-summarizer";
import { useMusic } from "@/context/use-music";

interface VoiceAgentContextValue {
	status: VoiceAgentStatus;
	transcript: string;
	isListening: boolean;
	isSpeaking: boolean;
	activeActionDescription: string | null;
	startListening: () => void;
	stopListening: () => void;
	cancel: () => void;
	sendTextMessage: (text: string) => Promise<void>;
}

const VoiceAgentContext = createContext<VoiceAgentContextValue | null>(null);

// BCP-47 locale map
const LOCALE_TO_SPEECH_LANG: Record<string, string> = {
	en: "en-US",
	hi: "hi-IN",
	mr: "mr-IN",
	gu: "gu-IN",
	ta: "ta-IN",
	te: "te-IN",
	kn: "kn-IN",
	ml: "ml-IN",
	bn: "bn-IN",
	pa: "pa-IN",
	ur: "ur-IN",
	de: "de-DE",
	ja: "ja-JP",
};

export const VoiceAgentProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { i18n } = useTranslation();
	const currentLangCode = i18n.language || "en";
	const speechLang =
		LOCALE_TO_SPEECH_LANG[currentLangCode] ||
		LOCALE_TO_SPEECH_LANG[currentLangCode.split("-")[0]] ||
		"en-US";

	const [status, setStatus] = useState<VoiceAgentStatus>("idle");
	const [transcript, setTranscript] = useState("");
	const [activeActionDescription, setActiveActionDescription] = useState<
		string | null
	>(null);

	const navigate = useNavigate();
	const location = useLocation();
	const music = useMusic();

	const memoryRef = useRef(new SessionMemory());
	const speakerRef = useRef<SpeechSpeakerEngine | null>(null);
	const listenerRef = useRef<SpeechListenerEngine | null>(null);
	const dispatcherRef = useRef<ActionDispatcher | null>(null);

	// Sync route in memory
	useEffect(() => {
		memoryRef.current.setCurrentRoute(location.pathname);
	}, [location.pathname]);

	// Update dispatcher dependencies
	useEffect(() => {
		if (dispatcherRef.current) {
			dispatcherRef.current.updateDeps({
				navigate,
				musicControls: {
					play: music.play,
					pause: music.pause,
					next: music.next,
					prev: music.previous,
					searchAndPlay: (query: string) => {
						music.openPlayer();
						if (query) {
							music.searchTracks(query);
						}
					},
				},
			});
		}
	}, [navigate, music]);

	const processUtterance = useCallback(
		async (text: string) => {
			if (!text.trim()) return;

			setStatus("thinking");
			setTranscript(text);
			memoryRef.current.addTurn("user", text);

			// Mute microphone listener during processing & TTS
			listenerRef.current?.setMuted(true);

			try {
				const decision = await VoiceBrain.decide(
					text,
					memoryRef.current.getState(),
					currentLangCode,
				);

				if (decision.updatedEntities) {
					memoryRef.current.updateEntities(decision.updatedEntities);
				}
				memoryRef.current.setPendingSlot(decision.pendingSlot || null);

				const hasAction =
					decision.action && decision.action.type !== "NONE";
				const isPerceptiveAction =
					hasAction &&
					[
						"CHECK_PNR",
						"SEARCH_TRAINS",
						"TRAIN_LIVE_STATUS",
						"TRAIN_SCHEDULE",
						"GENERATE_PASSWORD",
					].includes(decision.action.type);

				// Phase 1: Speak initial intent or direct response
				if (decision.speech) {
					setStatus("speaking");
					memoryRef.current.addTurn("assistant", decision.speech);
					await speakerRef.current?.speak(decision.speech);
				}

				// Execute Action
				if (hasAction) {
					setStatus("executing");
					setActiveActionDescription(
						`Executing: ${decision.action.type}`,
					);
					await dispatcherRef.current?.dispatch(decision.action);
				}

				// Phase 2: If this action generates on-screen results, observe & summarize
				if (isPerceptiveAction) {
					setStatus("observing");
					setActiveActionDescription("Reading screen results...");

					// Wait for loaders to disappear and DOM to settle
					await ScreenPerceiver.waitForSettlement(7000);

					// Extract semantic text from active main content
					const screenText = ScreenPerceiver.extractSemanticText();

					if (screenText) {
						setStatus("thinking");
						const spokenResult = await ResultSummarizer.summarize({
							userQuery: text,
							actionType: decision.action.type,
							screenText,
							lang: currentLangCode,
						});

						if (spokenResult) {
							setStatus("speaking");
							memoryRef.current.addTurn(
								"assistant",
								spokenResult,
							);
							await speakerRef.current?.speak(spokenResult);
						}
					}
				}
			} catch (err) {
				console.error("Error processing voice utterance:", err);
				setStatus("error");
			} finally {
				setStatus("idle");
				setActiveActionDescription(null);
				// Unmute listener with acoustic cooldown
				listenerRef.current?.setMuted(false);
			}
		},
		[currentLangCode],
	);

	// Initialize Engines
	useEffect(() => {
		dispatcherRef.current = new ActionDispatcher({
			navigate,
		});

		speakerRef.current = new SpeechSpeakerEngine();

		listenerRef.current = new SpeechListenerEngine(
			{
				onTranscript: (t, isFinal) => {
					setTranscript(t);
					if (isFinal) {
						processUtterance(t);
					}
				},
				onStateChange: (listening) => {
					if (listening) {
						setStatus((prev) =>
							prev === "idle" ? "listening" : prev,
						);
					} else {
						setStatus((prev) =>
							prev === "listening" ? "idle" : prev,
						);
					}
				},
			},
			speechLang,
		);

		return () => {
			listenerRef.current?.stop();
			speakerRef.current?.stop();
		};
	}, [processUtterance, navigate, speechLang]);

	// Dynamically update speech recognition language if i18n changes
	useEffect(() => {
		listenerRef.current?.setLanguage(speechLang);
	}, [speechLang]);

	const startListening = useCallback(() => {
		speakerRef.current?.stop();
		setTranscript("");
		setStatus("listening");
		listenerRef.current?.start();
	}, []);

	const stopListening = useCallback(() => {
		listenerRef.current?.stop();
		setStatus("idle");
	}, []);

	const cancel = useCallback(() => {
		speakerRef.current?.stop();
		listenerRef.current?.stop();
		setStatus("idle");
		setTranscript("");
		setActiveActionDescription(null);
	}, []);

	const sendTextMessage = useCallback(
		async (text: string) => {
			speakerRef.current?.stop();
			listenerRef.current?.stop();
			await processUtterance(text);
		},
		[processUtterance],
	);

	return (
		<VoiceAgentContext.Provider
			value={{
				status,
				transcript,
				isListening: status === "listening",
				isSpeaking: status === "speaking",
				activeActionDescription,
				startListening,
				stopListening,
				cancel,
				sendTextMessage,
			}}
		>
			{children}
		</VoiceAgentContext.Provider>
	);
};

export const useVoiceAgent = () => {
	const context = useContext(VoiceAgentContext);
	if (!context) {
		throw new Error(
			"useVoiceAgent must be used within a VoiceAgentProvider",
		);
	}
	return context;
};
