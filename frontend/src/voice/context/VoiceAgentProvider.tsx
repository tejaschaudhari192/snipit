import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type {
	VoiceAgentStatus,
	ExecutionStep,
	ChatMessage,
} from "../types/voice.types";
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
	const [messages, setMessages] = useState<ChatMessage[]>(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = sessionStorage.getItem(
					"snipit:voice_chat_messages",
				);
				if (saved) return JSON.parse(saved);
			} catch {
				// ignore parse error
			}
		}
		return [
			{
				id: "welcome-msg",
				role: "assistant",
				content:
					"Hello! I am your SnipIt Copilot. You can speak commands, generate snippets, search trains, control music, or ask anything about your workspace.",
				timestamp: Date.now(),
				status: "done",
			},
		];
	});

	const [isMascotVisible, setIsMascotVisibleState] = useState<boolean>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("snipit:voice_mascot_visible");
			return saved === "true";
		}
		return false;
	});

	const setIsMascotVisible = useCallback((visible: boolean) => {
		setIsMascotVisibleState(visible);
		if (typeof window !== "undefined") {
			localStorage.setItem(
				"snipit:voice_mascot_visible",
				visible ? "true" : "false",
			);
		}
	}, []);

	const toggleMascot = useCallback(() => {
		setIsMascotVisible(!isMascotVisible);
	}, [isMascotVisible, setIsMascotVisible]);

	const clearMessages = useCallback(() => {
		setMessages([
			{
				id: "welcome-msg",
				role: "assistant",
				content:
					"Conversation cleared. How can I assist you with SnipIt today?",
				timestamp: Date.now(),
				status: "done",
			},
		]);
		if (typeof window !== "undefined") {
			sessionStorage.removeItem("snipit:voice_chat_messages");
		}
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined" && messages.length > 0) {
			try {
				sessionStorage.setItem(
					"snipit:voice_chat_messages",
					JSON.stringify(messages.slice(-30)),
				);
			} catch {
				// ignore storage quota
			}
		}
	}, [messages]);

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

			const userMsgId = `user-${Date.now()}`;
			const assistantMsgId = `asst-${Date.now()}`;

			const userMsg: ChatMessage = {
				id: userMsgId,
				role: "user",
				content: text,
				timestamp: Date.now(),
				status: "done",
			};

			const initialSteps: ExecutionStep[] = [
				{
					id: "thinking",
					stage: "thinking",
					label: "AI Reasoning & Intent Planning",
					detail: `Analyzing: "${text}"`,
					status: "running",
					timestamp: Date.now(),
				},
			];

			const assistantMsg: ChatMessage = {
				id: assistantMsgId,
				role: "assistant",
				content: "",
				timestamp: Date.now(),
				status: "streaming",
				executionSteps: initialSteps,
			};

			setMessages((prev) => [...prev, userMsg, assistantMsg]);
			setStatus("thinking");
			setTranscript(text);
			setExecutionSteps(initialSteps);
			memoryRef.current.addTurn("user", text);

			// Helper to patch current assistant message in React state
			const patchAssistantMsg = (updates: Partial<ChatMessage>) => {
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === assistantMsgId
							? { ...msg, ...updates }
							: msg,
					),
				);
			};

			// Mute microphone listener during processing & TTS
			listenerRef.current?.setMuted(true);

			try {
				const decision = await VoiceBrain.decide(
					text,
					memoryRef.current.getState(),
					currentLangCode,
				);

				const stepDoneDetail = `Intent mapped: ${decision.action?.type || "DIRECT_SPEECH"}`;
				updateStep("thinking", {
					status: "done",
					detail: stepDoneDetail,
				});

				const hasAction =
					decision.action && decision.action.type !== "NONE";
				const needsObservation =
					hasAction && isPerceptiveAction(decision.action.type);

				let accumulatedSteps: ExecutionStep[] = [
					{
						...initialSteps[0],
						status: "done",
						detail: stepDoneDetail,
					},
				];

				patchAssistantMsg({
					action: decision.action,
					content: decision.speech || "",
					executionSteps: accumulatedSteps,
				});

				if (decision.updatedEntities) {
					memoryRef.current.updateEntities(decision.updatedEntities);
				}
				memoryRef.current.setPendingSlot(decision.pendingSlot || null);

				// Phase 1: Speak initial intent or direct response
				if (decision.speech) {
					setStatus("speaking");
					const speechStep: ExecutionStep = {
						id: "speech-1",
						stage: "speech",
						label: "Synthesizing Speech",
						detail: decision.speech,
						status: "running",
						timestamp: Date.now(),
					};
					addStep(speechStep);
					accumulatedSteps = [...accumulatedSteps, speechStep];
					patchAssistantMsg({
						content: decision.speech,
						executionSteps: accumulatedSteps,
					});

					memoryRef.current.addTurn("assistant", decision.speech);
					await speakerRef.current?.speak(decision.speech);
					updateStep("speech-1", { status: "done" });
					accumulatedSteps = accumulatedSteps.map((s) =>
						s.id === "speech-1"
							? { ...s, status: "done" as const }
							: s,
					);
					patchAssistantMsg({ executionSteps: accumulatedSteps });
				}

				// Execute Action
				if (hasAction) {
					setStatus("executing");
					const actionName = decision.action.type;
					const actionDetail = JSON.stringify(
						decision.action.params || {},
					);
					setActiveActionDescription(`Executing: ${actionName}`);
					const actionStep: ExecutionStep = {
						id: "action-exec",
						stage: "action",
						label: `Execute ${actionName}`,
						detail: actionDetail,
						status: "running",
						timestamp: Date.now(),
					};
					addStep(actionStep);
					accumulatedSteps = [...accumulatedSteps, actionStep];
					patchAssistantMsg({
						executionSteps: accumulatedSteps,
					});

					const actionSuccess = await dispatcherRef.current?.dispatch(
						decision.action,
					);
					const stepStatus =
						actionSuccess !== false ? "done" : "error";
					const detailMsg =
						actionSuccess !== false
							? `Executed ${actionName}`
							: `Failed to execute ${actionName}`;

					updateStep("action-exec", {
						status: stepStatus,
						detail: detailMsg,
					});
					accumulatedSteps = accumulatedSteps.map((s) =>
						s.id === "action-exec"
							? { ...s, status: stepStatus as "done" | "error" }
							: s,
					);
					patchAssistantMsg({
						executionSteps: accumulatedSteps,
						actionResult: {
							success: actionSuccess !== false,
							message: detailMsg,
						},
					});

					if (actionSuccess === false) {
						const failureMsg =
							actionName === "DELETE_PASTE"
								? "I could not delete that snippet. Please verify the snippet exists and you have permission."
								: `I was unable to complete ${actionName}.`;
						memoryRef.current.addTurn("assistant", failureMsg);
						await speakerRef.current?.speak(failureMsg);
					}
				}

				// Phase 2: If this action generates on-screen results, observe & summarize
				if (needsObservation) {
					setStatus("observing");
					setActiveActionDescription("Observing screen results...");
					const screenStep: ExecutionStep = {
						id: "screen-perceive",
						stage: "screen",
						label: "Screen Perception & DOM Settlement",
						detail: "Waiting for loaders to clear...",
						status: "running",
						timestamp: Date.now(),
					};
					addStep(screenStep);
					accumulatedSteps = [...accumulatedSteps, screenStep];
					patchAssistantMsg({ executionSteps: accumulatedSteps });

					// Wait for loaders to disappear and DOM to settle
					await ScreenPerceiver.waitForSettlement(
						TIMING_CONFIG.SCREEN_SETTLEMENT_TIMEOUT_MS,
					);

					// Extract semantic text from active main content
					const screenText = ScreenPerceiver.extractSemanticText();
					const screenDetail = screenText
						? `Observed ${screenText.slice(0, 80)}...`
						: "DOM settled";

					updateStep("screen-perceive", {
						status: "done",
						detail: screenDetail,
					});
					accumulatedSteps = accumulatedSteps.map((s) =>
						s.id === "screen-perceive"
							? {
									...s,
									status: "done" as const,
									detail: screenDetail,
								}
							: s,
					);
					patchAssistantMsg({ executionSteps: accumulatedSteps });

					if (screenText) {
						setStatus("thinking");
						const sumStep: ExecutionStep = {
							id: "summarize",
							stage: "thinking",
							label: "Generating Spoken Summary",
							status: "running",
							timestamp: Date.now(),
						};
						addStep(sumStep);
						accumulatedSteps = [...accumulatedSteps, sumStep];
						patchAssistantMsg({ executionSteps: accumulatedSteps });

						const spokenResult = await ResultSummarizer.summarize({
							userQuery: text,
							actionType: decision.action.type,
							screenText,
							lang: currentLangCode,
						});

						const sumDoneDetail =
							spokenResult || "Summary generated";
						updateStep("summarize", {
							status: "done",
							detail: sumDoneDetail,
						});
						accumulatedSteps = accumulatedSteps.map((s) =>
							s.id === "summarize"
								? {
										...s,
										status: "done" as const,
										detail: sumDoneDetail,
									}
								: s,
						);

						if (spokenResult) {
							setStatus("speaking");
							const spokenStep: ExecutionStep = {
								id: "speech-2",
								stage: "speech",
								label: "Spoken Result",
								detail: spokenResult,
								status: "running",
								timestamp: Date.now(),
							};
							addStep(spokenStep);
							accumulatedSteps = [
								...accumulatedSteps,
								spokenStep,
							];

							const combinedContent = decision.speech
								? `${decision.speech}\n\n${spokenResult}`
								: spokenResult;

							patchAssistantMsg({
								content: combinedContent,
								executionSteps: accumulatedSteps,
							});

							memoryRef.current.addTurn(
								"assistant",
								spokenResult,
							);
							await speakerRef.current?.speak(spokenResult);
							updateStep("speech-2", { status: "done" });
							accumulatedSteps = accumulatedSteps.map((s) =>
								s.id === "speech-2"
									? { ...s, status: "done" as const }
									: s,
							);
							patchAssistantMsg({
								executionSteps: accumulatedSteps,
							});
						}
					}
				}

				patchAssistantMsg({ status: "done" });
			} catch (err) {
				console.error("Error processing voice utterance:", err);
				setStatus("error");
				patchAssistantMsg({
					status: "error",
					content:
						"Sorry, I encountered an issue processing your request. Please try again.",
				});
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
				isMascotVisible,
				setIsMascotVisible,
				toggleMascot,
				messages,
				clearMessages,
			}}
		>
			{children}
		</VoiceAgentContext.Provider>
	);
};
