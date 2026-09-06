import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { VoiceAgentStatus, ExecutionStep } from "../types/voice.types";
import { VoiceAgentContext } from "./VoiceAgentContext";
import { SessionMemory } from "../memory/session-memory";
import { SpeechListenerEngine } from "../engine/speech-listener";
import { SpeechSpeakerEngine } from "../engine/speech-speaker";
import { ActionDispatcher } from "../engine/action-dispatcher";
import { VoiceBrain } from "../engine/voice-brain";
import { ScreenPerceiver } from "../engine/screen-perceiver";
import { ResultSummarizer } from "../engine/result-summarizer";
import { resolveSpeechLang } from "../utils/speech-lang.utils";
import { isPerceptiveAction } from "../constants/action-names";
import { TIMING_CONFIG } from "../constants/timing";
import { useMusic } from "@/context/use-music";

export const VoiceAgentProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { i18n } = useTranslation();
	const currentLangCode = i18n.language || "en";
	const speechLang = resolveSpeechLang(currentLangCode);

	const [status, setStatus] = useState<VoiceAgentStatus>("idle");
	const [transcript, setTranscript] = useState("");
	const [activeActionDescription, setActiveActionDescription] = useState<
		string | null
	>(null);
	const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
	const [showExecutionDetails, setShowExecutionDetails] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();
	const music = useMusic();

	const memoryRef = useRef(new SessionMemory());
	const speakerRef = useRef<SpeechSpeakerEngine | null>(null);
	const listenerRef = useRef<SpeechListenerEngine | null>(null);
	const dispatcherRef = useRef<ActionDispatcher | null>(null);

	const updateStep = (id: string, updates: Partial<ExecutionStep>) => {
		setExecutionSteps((prev) =>
			prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
		);
	};

	const addStep = (step: ExecutionStep) => {
		setExecutionSteps((prev) => [...prev, step]);
	};

	// Sync active route in working memory
	useEffect(() => {
		memoryRef.current.setCurrentRoute(location.pathname);
	}, [location.pathname]);

	// Update dispatcher integrations
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
			setExecutionSteps([
				{
					id: "thinking",
					stage: "thinking",
					label: "AI Reasoning & Intent Planning",
					detail: `Analyzing: "${text}"`,
					status: "running",
					timestamp: Date.now(),
				},
			]);
			memoryRef.current.addTurn("user", text);

			// Mute microphone listener during processing & TTS
			listenerRef.current?.setMuted(true);

			try {
				const decision = await VoiceBrain.decide(
					text,
					memoryRef.current.getState(),
					currentLangCode,
				);

				updateStep("thinking", {
					status: "done",
					detail: `Intent mapped: ${decision.action?.type || "DIRECT_SPEECH"}`,
				});

				if (decision.updatedEntities) {
					memoryRef.current.updateEntities(decision.updatedEntities);
				}
				memoryRef.current.setPendingSlot(decision.pendingSlot || null);

				const hasAction =
					decision.action && decision.action.type !== "NONE";
				const needsObservation =
					hasAction && isPerceptiveAction(decision.action.type);

				// Phase 1: Speak initial intent or direct response
				if (decision.speech) {
					setStatus("speaking");
					addStep({
						id: "speech-1",
						stage: "speech",
						label: "Synthesizing Speech",
						detail: decision.speech,
						status: "running",
						timestamp: Date.now(),
					});
					memoryRef.current.addTurn("assistant", decision.speech);
					await speakerRef.current?.speak(decision.speech);
					updateStep("speech-1", { status: "done" });
				}

				// Execute Action
				if (hasAction) {
					setStatus("executing");
					const actionName = decision.action.type;
					const actionDetail = JSON.stringify(
						decision.action.params || {},
					);
					setActiveActionDescription(`Executing: ${actionName}`);
					addStep({
						id: "action-exec",
						stage: "action",
						label: `Execute ${actionName}`,
						detail: actionDetail,
						status: "running",
						timestamp: Date.now(),
					});

					await dispatcherRef.current?.dispatch(decision.action);
					updateStep("action-exec", { status: "done" });
				}

				// Phase 2: If this action generates on-screen results, observe & summarize
				if (needsObservation) {
					setStatus("observing");
					setActiveActionDescription("Observing screen results...");
					addStep({
						id: "screen-perceive",
						stage: "screen",
						label: "Screen Perception & DOM Settlement",
						detail: "Waiting for loaders to clear...",
						status: "running",
						timestamp: Date.now(),
					});

					// Wait for loaders to disappear and DOM to settle
					await ScreenPerceiver.waitForSettlement(
						TIMING_CONFIG.SCREEN_SETTLEMENT_TIMEOUT_MS,
					);

					// Extract semantic text from active main content
					const screenText = ScreenPerceiver.extractSemanticText();
					updateStep("screen-perceive", {
						status: "done",
						detail: screenText
							? `Observed ${screenText.slice(0, 80)}...`
							: "DOM settled",
					});

					if (screenText) {
						setStatus("thinking");
						addStep({
							id: "summarize",
							stage: "thinking",
							label: "Generating Spoken Summary",
							status: "running",
							timestamp: Date.now(),
						});

						const spokenResult = await ResultSummarizer.summarize({
							userQuery: text,
							actionType: decision.action.type,
							screenText,
							lang: currentLangCode,
						});

						updateStep("summarize", {
							status: "done",
							detail: spokenResult || "Summary generated",
						});

						if (spokenResult) {
							setStatus("speaking");
							addStep({
								id: "speech-2",
								stage: "speech",
								label: "Spoken Result",
								detail: spokenResult,
								status: "running",
								timestamp: Date.now(),
							});
							memoryRef.current.addTurn(
								"assistant",
								spokenResult,
							);
							await speakerRef.current?.speak(spokenResult);
							updateStep("speech-2", { status: "done" });
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
				executionSteps,
				showExecutionDetails,
				toggleExecutionDetails: () =>
					setShowExecutionDetails((p) => !p),
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
