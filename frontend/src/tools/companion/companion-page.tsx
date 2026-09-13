import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/components/ui/toast";
import {
	fetchCompanionSession,
	syncCompanionSession,
	resetCompanionSession,
	deleteCompanionMemory,
	fetchBackendCompanionModels,
	extractCompanionMemories,
	sendBackendCompanionChat,
	type CompanionSessionData,
	type CompanionMessage,
} from "./services/companion-api";
import {
	buildConsciousnessSystemPrompt,
	evaluateInteractionEvolution,
	detectSelfChosenName,
} from "./engine/consciousness-engine";
import { CompanionPageSkeleton } from "./components/skeletons";
import { CompanionHeader } from "./components/companion-header";
import { CompanionChatFeed } from "./components/companion-chat-feed";
import { CompanionInputDock } from "./components/companion-input-dock";
import { CompanionMemoryDrawer } from "./components/companion-memory-drawer";

export const CompanionPage: React.FC = () => {
	const [session, setSession] = useState<CompanionSessionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [availableModels, setAvailableModels] = useState<
		Array<{ id: string; label: string }>
	>([]);
	const [inputPrompt, setInputPrompt] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [currentReply, setCurrentReply] = useState("");
	const [voiceEnabled, setVoiceEnabled] = useState(false);
	const [memoryDrawerOpen, setMemoryDrawerOpen] = useState(false);
	const [selectedModel, setSelectedModel] = useState("groq/compound-mini");
	const [isSpeaking, setIsSpeaking] = useState(false);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Load session state and backend Groq models
	useEffect(() => {
		let isMounted = true;
		const init = async () => {
			try {
				const { session: loadedSession } =
					await fetchCompanionSession();
				if (!isMounted) return;

				setSession(loadedSession);

				try {
					const backendModels = await fetchBackendCompanionModels();
					if (backendModels.length > 0 && isMounted) {
						const formatted = backendModels.map((m) => ({
							id: m.id,
							label: m.label || m.id,
						}));
						setAvailableModels(formatted);
						if (
							!formatted.some((m) => m.id === selectedModel) &&
							formatted[0]?.id
						) {
							setSelectedModel(formatted[0].id);
						}
					}
				} catch (err) {
					console.warn("Backend Groq model loading error:", err);
				}
			} catch (err) {
				console.error("Failed to load companion session:", err);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		init();
		return () => {
			isMounted = false;
			if (typeof window !== "undefined" && "speechSynthesis" in window) {
				window.speechSynthesis.cancel();
			}
		};
	}, [selectedModel]);

	// Voice Agent direct action integration
	useEffect(() => {
		const handleVoiceAction = (e: Event) => {
			const customEvent = e as CustomEvent;
			const detail = customEvent.detail;
			if (detail && detail.type === "DOM_INPUT" && detail.params?.value) {
				setInputPrompt(detail.params.value);
			}
		};
		window.addEventListener("snipit:voice:action", handleVoiceAction);
		return () =>
			window.removeEventListener(
				"snipit:voice:action",
				handleVoiceAction,
			);
	}, []);

	// Auto scroll to bottom
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [session?.messages, currentReply, isStreaming]);

	// Auto-resize textarea
	const handleTextareaChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		setInputPrompt(e.target.value);
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
		}
	};

	// Voice TTS trigger using native Web SpeechSynthesis
	const speakText = useCallback(
		async (text: string) => {
			if (!voiceEnabled || !text) return;
			try {
				if (
					typeof window === "undefined" ||
					!("speechSynthesis" in window)
				)
					return;
				window.speechSynthesis.cancel();
				setIsSpeaking(true);

				const utterance = new SpeechSynthesisUtterance(text);
				const voices = window.speechSynthesis.getVoices();
				const patternRegex =
					/natural|google us english|samantha|zira|victoria|female/i;
				const matchedVoice = voices.find(
					(v) => patternRegex.test(v.name) && v.lang.startsWith("en"),
				);
				if (matchedVoice) {
					utterance.voice = matchedVoice;
				}
				utterance.rate = 1.02;
				utterance.pitch = 1.2;

				utterance.onend = () => setIsSpeaking(false);
				utterance.onerror = () => setIsSpeaking(false);

				window.speechSynthesis.speak(utterance);
			} catch (err) {
				console.warn("TTS playback warning:", err);
				setIsSpeaking(false);
			}
		},
		[voiceEnabled],
	);

	// Handle Message Send
	const handleSendMessage = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const userText = inputPrompt.trim();
		if (!userText || isStreaming || !session) return;

		// Reset input
		setInputPrompt("");
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}

		const userMsgId = `usr_${Date.now()}`;
		const userMsg: CompanionMessage = {
			id: userMsgId,
			role: "user",
			content: userText,
			timestamp: new Date().toISOString(),
		};

		const updatedMessages = [...session.messages, userMsg];
		const tempSession: CompanionSessionData = {
			...session,
			messages: updatedMessages,
		};
		setSession(tempSession);
		setIsStreaming(true);
		setCurrentReply("");

		try {
			// Build conversation payload (keep recent 14 for speed and context)
			const systemPrompt = buildConsciousnessSystemPrompt(tempSession);
			const recentHistory = updatedMessages.slice(-14).map((m) => ({
				role: m.role,
				content: m.content,
			}));

			const promptPayload = [
				{ role: "system", content: systemPrompt },
				...recentHistory,
			];

			const fullReplyText = await sendBackendCompanionChat(
				promptPayload,
				selectedModel,
			);
			setCurrentReply(fullReplyText);

			// Evaluate emotional evolution & extracted subconscious memories
			const evolution = evaluateInteractionEvolution(
				userText,
				fullReplyText,
				tempSession,
			);

			const assistantMsg: CompanionMessage = {
				id: `asst_${Date.now()}`,
				role: "assistant",
				content: fullReplyText,
				timestamp: new Date().toISOString(),
			};

			// Check if companion chose a name for herself in this turn
			let updatedCompanionName = tempSession.companionName;
			if (!updatedCompanionName) {
				const selfName = detectSelfChosenName(fullReplyText);
				if (selfName) {
					updatedCompanionName = selfName;
				}
			}

			// Filter out any past corrupt/garbage memories that were accidentally stored
			const cleanedPastMemories = tempSession.memories.filter((m) => {
				const badKeywords = [
					"really",
					"relly",
					"very",
					"today",
					"here",
					"just",
					"well",
					"now",
					"fine",
				];
				return !badKeywords.includes(m.detail.toLowerCase().trim());
			});

			let newAiMemories: typeof tempSession.memories = [];
			// Extract genuine memories via AI on every substantive turn
			if (
				userText.trim().length > 15 ||
				(tempSession.metrics.turns + 1) % 3 === 0
			) {
				try {
					const extracted = await extractCompanionMemories(
						[...updatedMessages.slice(-4), assistantMsg].map(
							(m) => ({ role: m.role, content: m.content }),
						),
						cleanedPastMemories,
					);
					if (extracted && extracted.length > 0) {
						newAiMemories = extracted.filter(
							(em) =>
								!cleanedPastMemories.some(
									(pm) =>
										pm.key.toLowerCase() ===
											em.key.toLowerCase() &&
										pm.detail.toLowerCase() ===
											em.detail.toLowerCase(),
								),
						);
					}
				} catch (err) {
					console.warn("Memory extraction failed:", err);
				}
			}

			const finalSession: CompanionSessionData = {
				...tempSession,
				companionName: updatedCompanionName,
				stage: evolution.stage,
				mood: evolution.mood,
				metrics: {
					turns: tempSession.metrics.turns + 1,
					fondness: evolution.fondness,
					friction: evolution.friction,
					intimacyScore: evolution.intimacyScore,
				},
				memories: [...cleanedPastMemories, ...newAiMemories],
				messages: [...updatedMessages, assistantMsg],
			};

			setSession(finalSession);
			setCurrentReply("");
			await syncCompanionSession(finalSession);

			// Speak reply if voice enabled
			if (voiceEnabled) {
				speakText(fullReplyText);
			}
		} catch (error) {
			console.error("Companion chat error:", error);
			toast.add({
				title: "Connection hiccup",
				description:
					"I lost my train of thought for a second. Try again?",
				type: "error",
			});
		} finally {
			setIsStreaming(false);
		}
	};

	// Reset conversation
	const handleReset = async (hardReset: boolean) => {
		if (!session) return;
		if (
			!confirm(
				hardReset
					? "Wipe all memories and reset connection to beginning?"
					: "Clear active conversation history?",
			)
		) {
			return;
		}

		await resetCompanionSession(hardReset);
		const { session: refreshed } = await fetchCompanionSession();
		setSession(refreshed);
		toast.add({
			title: hardReset ? "Fresh Connection" : "Chat Cleared",
			description: hardReset
				? "Memories wiped. Starting brand new."
				: "Messages cleared.",
			type: "success",
		});
	};

	// Delete specific memory
	const handleDeleteMemory = async (memoryId: string) => {
		if (!session) return;
		const updated = await deleteCompanionMemory(memoryId, session);
		setSession(updated);
		toast.add({
			title: "Memory Forgotten",
			description: "She will no longer remember this detail.",
			type: "info",
		});
	};

	const handleToggleVoice = () => {
		const next = !voiceEnabled;
		setVoiceEnabled(next);
		if (!next) {
			if (typeof window !== "undefined" && "speechSynthesis" in window) {
				window.speechSynthesis.cancel();
			}
			setIsSpeaking(false);
		}
	};

	if (loading || !session) {
		return <CompanionPageSkeleton />;
	}

	const hasChosenName = Boolean(session.companionName);
	const displayName = session.companionName || "OS Companion";

	return (
		<div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] flex flex-col bg-background relative overflow-hidden select-none">
			<CompanionHeader
				session={session}
				displayName={displayName}
				hasChosenName={hasChosenName}
				isSpeaking={isSpeaking}
				selectedModel={selectedModel}
				availableModels={availableModels}
				voiceEnabled={voiceEnabled}
				memoryDrawerOpen={memoryDrawerOpen}
				onSelectModel={setSelectedModel}
				onToggleVoice={handleToggleVoice}
				onToggleMemoryDrawer={() =>
					setMemoryDrawerOpen(!memoryDrawerOpen)
				}
				onResetChat={() => handleReset(false)}
			/>

			{/* Main Content Area */}
			<div className="flex-1 flex overflow-hidden relative">
				<CompanionChatFeed
					messages={session.messages}
					currentReply={currentReply}
					isStreaming={isStreaming}
					displayName={displayName}
					hasChosenName={hasChosenName}
					messagesEndRef={messagesEndRef}
					onSelectStarter={(starter) => {
						setInputPrompt(starter);
						textareaRef.current?.focus();
					}}
				/>

				<CompanionMemoryDrawer
					isOpen={memoryDrawerOpen}
					session={session}
					onClose={() => setMemoryDrawerOpen(false)}
					onDeleteMemory={handleDeleteMemory}
					onHardReset={() => handleReset(true)}
				/>
			</div>

			<CompanionInputDock
				inputPrompt={inputPrompt}
				isStreaming={isStreaming}
				hasChosenName={hasChosenName}
				displayName={displayName}
				textareaRef={textareaRef}
				onChangeInput={handleTextareaChange}
				onSubmit={handleSendMessage}
			/>
		</div>
	);
};

export default CompanionPage;
