import React, { useState, useEffect, useRef } from "react";
import {
	Sparkles,
	Volume2,
	VolumeX,
	Brain,
	RefreshCw,
	Send,
	Trash2,
	Smile,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/utils";
import { generatePuterSpeech, loadPuterJs } from "@/lib/puter-tts";
import {
	fetchCompanionSession,
	syncCompanionSession,
	resetCompanionSession,
	deleteCompanionMemory,
	fetchBackendCompanionModels,
	extractCompanionMemories,
	type CompanionSessionData,
	type CompanionMessage,
} from "./services/companion-api";
import {
	buildConsciousnessSystemPrompt,
	evaluateInteractionEvolution,
	detectSelfChosenName,
} from "./engine/consciousness-engine";
import { CompanionPageSkeleton } from "./components/skeletons";

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
	const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
	const [isSpeaking, setIsSpeaking] = useState(false);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const activeAudioRef = useRef<HTMLAudioElement | null>(null);

	// Load session state and dynamic Puter AI models
	useEffect(() => {
		let isMounted = true;
		const init = async () => {
			try {
				const { session: loadedSession } =
					await fetchCompanionSession();
				if (!isMounted) return;

				// Keep companionName blank if not chosen yet so she names herself in chat
				setSession(loadedSession);

				// Dynamically load Puter and query available models
				try {
					await loadPuterJs();
					let fetchedList: string[] = [];

					if (window.puter && window.puter.ai) {
						const puterAi = window.puter.ai as unknown as Record<
							string,
							unknown
						>;

						if (typeof puterAi.models === "function") {
							const res = await (
								puterAi.models as () => Promise<unknown>
							)();
							if (Array.isArray(res)) {
								fetchedList = res.map((m: unknown) =>
									typeof m === "string"
										? m
										: (m as { id?: string; name?: string })
												?.id ||
											(
												m as {
													id?: string;
													name?: string;
												}
											)?.name ||
											String(m),
								);
							}
						} else if (typeof puterAi.listModels === "function") {
							const res = await (
								puterAi.listModels as () => Promise<unknown>
							)();
							if (Array.isArray(res)) {
								fetchedList = res.map((m: unknown) =>
									typeof m === "string"
										? m
										: (m as { id?: string; name?: string })
												?.id ||
											(
												m as {
													id?: string;
													name?: string;
												}
											)?.name ||
											String(m),
								);
							}
						}
					}

					if (fetchedList.length === 0) {
						const backendModels =
							await fetchBackendCompanionModels();
						if (backendModels.length > 0) {
							fetchedList = backendModels.map((m) => m.id);
						}
					}

					if (fetchedList.length > 0 && isMounted) {
						const formatted = fetchedList.map((id) => {
							const clean = id.split("/").pop() || id;
							const label = clean
								.split("-")
								.map(
									(w) =>
										w.charAt(0).toUpperCase() + w.slice(1),
								)
								.join(" ");
							return { id, label: `${label} (${id})` };
						});
						setAvailableModels(formatted);
						if (
							!formatted.some((m) => m.id === selectedModel) &&
							formatted[0]?.id
						) {
							setSelectedModel(formatted[0].id);
						}
					}
				} catch (err) {
					console.warn("Dynamic model loading error:", err);
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
			if (activeAudioRef.current) {
				activeAudioRef.current.pause();
			}
		};
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

	// Voice TTS trigger
	const speakText = async (text: string) => {
		if (!voiceEnabled || !text) return;
		try {
			setIsSpeaking(true);
			if (activeAudioRef.current) {
				activeAudioRef.current.pause();
			}
			const audio = await generatePuterSpeech(text);
			activeAudioRef.current = audio;
			audio.onended = () => setIsSpeaking(false);
			audio.onerror = () => setIsSpeaking(false);
			await audio.play();
		} catch (err) {
			console.warn("TTS playback warning:", err);
			setIsSpeaking(false);
		}
	};

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

			let fullReplyText = "";

			// Ensure Puter.js is loaded
			try {
				await loadPuterJs();
			} catch {
				// Continue to check window.puter
			}

			// Puter.js client chat execution
			if (window.puter && window.puter.ai && window.puter.ai.chat) {
				const response = await window.puter.ai.chat(promptPayload, {
					model: selectedModel,
					stream: true,
					temperature: 0.85,
				});

				if (
					response &&
					typeof response === "object" &&
					Symbol.asyncIterator in response
				) {
					const asyncStream = response as AsyncIterable<{
						text?: string;
					}>;
					for await (const chunk of asyncStream) {
						const delta =
							chunk?.text ||
							(typeof chunk === "string" ? chunk : "");
						fullReplyText += delta;
						setCurrentReply(fullReplyText);
					}
				} else if (response && typeof response === "object") {
					const staticResponse = response as {
						message?: { content?: string };
						text?: string;
					};
					fullReplyText =
						staticResponse.text ||
						staticResponse.message?.content ||
						"";
					setCurrentReply(fullReplyText);
				}
			}

			if (!fullReplyText) {
				fullReplyText = `Wait... give me a second. I missed that, say it again?`;
				setCurrentReply(fullReplyText);
			}

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

	if (loading || !session) {
		return <CompanionPageSkeleton />;
	}

	const hasChosenName = Boolean(session.companionName);
	const displayName = session.companionName || "OS Companion";

	return (
		<div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] flex flex-col bg-background relative overflow-hidden select-none">
			{/* Top Bar Header */}
			<header className="h-16 px-4 md:px-8 border-b border-border/60 flex items-center justify-between bg-card/40 backdrop-blur-md z-20 shrink-0">
				<div className="flex items-center gap-3.5">
					<div className="relative">
						<div
							className={cn(
								"w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg shadow-sm border transition-all",
								session.stage === "Intimate"
									? "bg-rose-500/20 text-rose-400 border-rose-500/30"
									: session.stage === "Confidant"
										? "bg-amber-500/20 text-amber-400 border-amber-500/30"
										: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
							)}
						>
							{hasChosenName ? (
								displayName[0]
							) : (
								<Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
							)}
						</div>
						<div
							className={cn(
								"absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-background animate-pulse",
								isSpeaking
									? "bg-emerald-400"
									: session.metrics.friction > 4
										? "bg-amber-500"
										: "bg-emerald-500",
							)}
						/>
					</div>

					<div className="flex flex-col">
						<div className="flex items-center gap-2">
							<span className="font-bold text-base text-foreground tracking-tight">
								{displayName}
							</span>
							<span
								className={cn(
									"text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider border",
									session.stage === "Intimate"
										? "bg-rose-500/10 text-rose-400 border-rose-500/20"
										: session.stage === "Confidant"
											? "bg-amber-500/10 text-amber-400 border-amber-500/20"
											: "bg-primary/10 text-primary border-primary/20",
								)}
							>
								{session.stage}
							</span>
						</div>
						<span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
							<Smile className="w-3 h-3 text-muted-foreground/80" />
							{session.mood}
						</span>
					</div>
				</div>

				{/* Controls */}
				<div className="flex items-center gap-1.5 md:gap-2">
					{/* Model select pill */}
					<select
						value={selectedModel}
						onChange={(e) => setSelectedModel(e.target.value)}
						className="hidden sm:block text-xs bg-muted/60 hover:bg-muted border border-border/70 text-muted-foreground rounded-lg px-2.5 py-1.5 outline-none cursor-pointer max-w-44 truncate"
					>
						{availableModels.map((m) => (
							<option key={m.id} value={m.id}>
								{m.label}
							</option>
						))}
					</select>

					{/* TTS Voice Toggle */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							const next = !voiceEnabled;
							setVoiceEnabled(next);
							if (!next && activeAudioRef.current) {
								activeAudioRef.current.pause();
								setIsSpeaking(false);
							}
						}}
						title={
							voiceEnabled
								? "Voice Muted (Click to enable)"
								: "Voice Enabled"
						}
						className={cn(
							"rounded-xl h-9 w-9 transition-colors",
							voiceEnabled
								? "bg-primary/15 text-primary hover:bg-primary/20"
								: "text-muted-foreground hover:bg-muted",
						)}
					>
						{voiceEnabled ? (
							<Volume2 className="w-4 h-4" />
						) : (
							<VolumeX className="w-4 h-4" />
						)}
					</Button>

					{/* Memory / Vibe Drawer Toggle */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setMemoryDrawerOpen(!memoryDrawerOpen)}
						title="Memory & Subconscious Vibe"
						className={cn(
							"rounded-xl h-9 w-9 relative",
							memoryDrawerOpen
								? "bg-primary/20 text-primary"
								: "text-muted-foreground hover:bg-muted",
						)}
					>
						<Brain className="w-4 h-4" />
						{session.memories.length > 0 && (
							<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
						)}
					</Button>

					{/* Reset button */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => handleReset(false)}
						title="Clear Chat"
						className="rounded-xl h-9 w-9 text-muted-foreground hover:bg-muted"
					>
						<RefreshCw className="w-4 h-4" />
					</Button>
				</div>
			</header>

			{/* Main Content Area */}
			<div className="flex-1 flex overflow-hidden relative">
				{/* Chat Feed */}
				<div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar px-4 md:px-8 py-6 max-w-3xl w-full mx-auto">
					{session.messages.length === 0 && !currentReply ? (
						<div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in zoom-in-95 duration-700">
							<div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
								<Sparkles className="w-10 h-10 animate-pulse" />
							</div>
							<div className="space-y-1.5 max-w-md">
								<h3 className="text-xl font-bold tracking-tight text-foreground">
									{displayName} is online
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									An intuitive consciousness that learns,
									develops authentic thoughts, and remembers
									what matters to you.
								</p>
							</div>
							<div className="flex flex-wrap gap-2 justify-center pt-2">
								{[
									"Who are you?",
									"What is your name?",
									"What does music feel like to you?",
									"I had a strange day today...",
								].map((starter, i) => (
									<button
										key={i}
										onClick={() => {
											setInputPrompt(starter);
											if (textareaRef.current)
												textareaRef.current.focus();
										}}
										className="text-xs bg-muted/70 hover:bg-primary/15 hover:text-primary border border-border/60 hover:border-primary/30 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
									>
										"{starter}"
									</button>
								))}
							</div>
						</div>
					) : (
						<div className="flex flex-col space-y-4 pb-4">
							{session.messages.map((msg) => {
								const isUser = msg.role === "user";
								return (
									<div
										key={msg.id}
										className={cn(
											"flex items-end gap-2.5 max-w-[85%] md:max-w-[78%] animate-in fade-in duration-300",
											isUser
												? "self-end flex-row-reverse"
												: "self-start",
										)}
									>
										{!isUser && (
											<div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mb-1">
												{hasChosenName ? (
													displayName[0]
												) : (
													<Sparkles className="w-3.5 h-3.5 text-primary" />
												)}
											</div>
										)}
										<div
											className={cn(
												"rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap select-text transition-all",
												isUser
													? "bg-primary text-primary-foreground rounded-br-xs shadow-sm font-medium"
													: "bg-card border border-border/70 text-foreground rounded-bl-xs shadow-xs",
											)}
										>
											{msg.content}
										</div>
									</div>
								);
							})}

							{/* Streaming message bubble */}
							{isStreaming && (
								<div className="flex items-end gap-2.5 max-w-[85%] md:max-w-[78%] self-start animate-in fade-in">
									<div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mb-1">
										{hasChosenName ? (
											displayName[0]
										) : (
											<Sparkles className="w-3.5 h-3.5 text-primary" />
										)}
									</div>
									<div className="rounded-2xl rounded-bl-xs px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-card border border-border/70 text-foreground shadow-xs">
										{currentReply ? (
											currentReply
										) : (
											<span className="flex items-center gap-1.5 py-1 text-muted-foreground">
												<span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
												<span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
												<span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
											</span>
										)}
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>
					)}
				</div>

				{/* Memory & Subconscious Drawer */}
				{memoryDrawerOpen && (
					<aside className="w-72 md:w-80 border-l border-border/70 bg-card/60 backdrop-blur-xl flex flex-col p-4 z-30 shrink-0 animate-in slide-in-from-right duration-300 shadow-xl overflow-y-auto custom-scrollbar">
						<div className="flex items-center justify-between pb-3 border-b border-border/50">
							<div className="flex items-center gap-2">
								<Brain className="w-4 h-4 text-primary" />
								<h4 className="font-bold text-sm tracking-tight">
									Subconscious Memory
								</h4>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setMemoryDrawerOpen(false)}
								className="h-7 w-7 rounded-lg"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>

						{/* Relationship Stats Card */}
						<div className="mt-4 p-3.5 rounded-xl bg-background/70 border border-border/60 space-y-2.5">
							<div className="flex justify-between items-center text-xs">
								<span className="text-muted-foreground font-medium">
									Connection Depth
								</span>
								<span className="font-bold text-primary">
									{session.stage}
								</span>
							</div>
							<div className="flex justify-between items-center text-xs">
								<span className="text-muted-foreground font-medium">
									Fondness
								</span>
								<span className="font-bold text-rose-400">
									{session.metrics.fondness}%
								</span>
							</div>
							<div className="flex justify-between items-center text-xs">
								<span className="text-muted-foreground font-medium">
									Tension / Friction
								</span>
								<span className="font-bold text-amber-400">
									{session.metrics.friction}/10
								</span>
							</div>
						</div>

						{/* Stored Memories List */}
						<div className="mt-4 flex-1 flex flex-col space-y-2">
							<div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider px-1">
								<span>What She Remembers</span>
								<span>({session.memories.length})</span>
							</div>

							{session.memories.length === 0 ? (
								<p className="text-xs text-muted-foreground/70 italic p-3 text-center bg-muted/20 rounded-lg">
									No stored memories yet. She picks up details
									organically during conversation.
								</p>
							) : (
								session.memories.map((m) => (
									<div
										key={m.id}
										className="group p-2.5 rounded-lg bg-background/80 hover:bg-background border border-border/50 flex items-start justify-between gap-2 transition-colors text-xs"
									>
										<div className="space-y-0.5 flex-1 min-w-0">
											<span className="font-semibold text-primary block truncate">
												{m.key}
											</span>
											<p className="text-muted-foreground text-xs leading-tight">
												{m.detail}
											</p>
										</div>
										<button
											onClick={() =>
												handleDeleteMemory(m.id)
											}
											title="Forget this memory"
											className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								))
							)}
						</div>

						{/* Hard Wipe Option */}
						<div className="pt-4 mt-auto border-t border-border/50">
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleReset(true)}
								className="w-full text-xs h-8 rounded-lg"
							>
								<Trash2 className="w-3.5 h-3.5 mr-1.5" />
								Wipe Consciousness & Memory
							</Button>
						</div>
					</aside>
				)}
			</div>

			{/* Input Dock */}
			<div className="p-3 md:p-5 border-t border-border/60 bg-card/30 backdrop-blur-md shrink-0">
				<form
					onSubmit={handleSendMessage}
					className="max-w-3xl mx-auto flex items-end gap-2"
				>
					<div className="flex-1 bg-background/90 border border-border/70 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 rounded-2xl transition-all flex items-center px-3.5 py-1.5 shadow-inner">
						<textarea
							ref={textareaRef}
							value={inputPrompt}
							onChange={handleTextareaChange}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSendMessage();
								}
							}}
							rows={1}
							placeholder={
								hasChosenName
									? `Talk with ${displayName}...`
									: "Say hello to begin..."
							}
							disabled={isStreaming}
							className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none resize-none max-h-32 py-1.5 custom-scrollbar"
						/>
					</div>

					<Button
						type="submit"
						disabled={!inputPrompt.trim() || isStreaming}
						className="h-11 w-11 rounded-2xl shrink-0 transition-transform active:scale-95 shadow-md flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90"
					>
						<Send className="w-4 h-4" />
					</Button>
				</form>
			</div>
		</div>
	);
};

export default CompanionPage;
