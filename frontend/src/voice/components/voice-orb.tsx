import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Send, Sparkles, X, Keyboard, Volume2 } from "lucide-react";
import { useVoiceAgent } from "../context/VoiceAgentContext";
import { VoiceHUD } from "./voice-hud";

export const VoiceOrb: React.FC = () => {
	const { t } = useTranslation();
	const {
		status,
		transcript,
		activeActionDescription,
		startListening,
		stopListening,
		cancel,
		sendTextMessage,
	} = useVoiceAgent();

	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [textInput, setTextInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const isIdle = status === "idle";
	const isListening = status === "listening";
	const isThinking = status === "thinking";
	const isExecuting = status === "executing";
	const isObserving = status === "observing";
	const isSpeaking = status === "speaking";

	// Auto-focus input when panel opens
	useEffect(() => {
		if (isPanelOpen) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [isPanelOpen]);

	const handleOrbClick = () => {
		if (isListening) {
			stopListening();
		} else if (isThinking || isExecuting || isObserving || isSpeaking) {
			cancel();
		} else {
			// Toggle panel and start listening
			setIsPanelOpen(true);
			startListening();
		}
	};

	const handleTextSubmit = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const query = textInput.trim();
		if (!query) return;

		setTextInput("");
		await sendTextMessage(query);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleTextSubmit();
		} else if (e.key === "Escape") {
			setIsPanelOpen(false);
			cancel();
		}
	};

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
			{/* HUD status for active feedback when speaking / thinking / executing / observing */}
			{(isThinking || isExecuting || isObserving || isSpeaking) && (
				<VoiceHUD
					status={status}
					transcript={transcript}
					activeAction={activeActionDescription}
					onCancel={cancel}
				/>
			)}

			{/* Gemini-Style Floating Dynamic Island & Keyboard Panel */}
			{isPanelOpen ? (
				<div className="mb-3 w-84 sm:w-96 rounded-3xl bg-neutral-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl text-white p-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
					{/* Header */}
					<div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/10">
						<div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
							<Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
							<span>{t("voice.title")}</span>
							{isSpeaking && (
								<span className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full font-medium">
									<Volume2 className="w-3 h-3 animate-pulse" />{" "}
									{t("voice.speaking")}
								</span>
							)}
						</div>

						<button
							onClick={() => {
								setIsPanelOpen(false);
								cancel();
							}}
							className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
							title={t("voice.close_panel")}
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					{/* Live Transcript / Response display */}
					<div className="px-2 py-1.5 mb-2 min-h-11 flex flex-col justify-center">
						{isListening ? (
							<p className="text-sm text-neutral-200 italic flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
								{transcript || t("voice.listening_or_type")}
							</p>
						) : isThinking ? (
							<p className="text-sm text-amber-300 flex items-center gap-2 animate-pulse">
								<Sparkles className="w-4 h-4 animate-spin" />
								{t("voice.thinking")}
							</p>
						) : isExecuting ? (
							<p className="text-sm text-cyan-300 font-medium">
								{activeActionDescription ||
									t("voice.operating")}
							</p>
						) : isObserving ? (
							<p className="text-sm text-cyan-300 flex items-center gap-2 animate-pulse">
								<Sparkles className="w-4 h-4 animate-spin" />
								{t("voice.reading_screen")}
							</p>
						) : isSpeaking ? (
							<p className="text-sm text-neutral-200 line-clamp-3">
								{transcript}
							</p>
						) : (
							<p className="text-xs text-neutral-400">
								{t("voice.input_hint")}
							</p>
						)}
					</div>

					{/* Input Bar (Gemini / Claude floating prompt pill) */}
					<form
						onSubmit={handleTextSubmit}
						className="flex items-center gap-2 bg-neutral-800/90 border border-white/10 rounded-2xl px-3 py-1.5 shadow-inner focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all"
					>
						<input
							ref={inputRef}
							type="text"
							value={textInput}
							onChange={(e) => setTextInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={t("voice.input_placeholder")}
							className="flex-1 bg-transparent text-sm text-white placeholder-neutral-400 focus:outline-none"
						/>

						{/* Mic button inside input bar */}
						<button
							type="button"
							onClick={
								isListening ? stopListening : startListening
							}
							className={`p-2 rounded-xl transition-all cursor-pointer ${
								isListening
									? "bg-rose-600 text-white animate-pulse"
									: "text-neutral-400 hover:text-white hover:bg-white/10"
							}`}
							title={
								isListening
									? t("voice.stop_listening")
									: t("voice.start_listening")
							}
						>
							<Mic className="w-4 h-4" />
						</button>

						{/* Send button */}
						<button
							type="submit"
							disabled={
								!textInput.trim() ||
								isThinking ||
								isExecuting ||
								isObserving
							}
							className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:hover:bg-cyan-600 text-white transition-all cursor-pointer"
							title={t("voice.send")}
						>
							<Send className="w-4 h-4" />
						</button>
					</form>
				</div>
			) : null}

			{/* Floating Trigger Bubble / Orb */}
			<div className="flex items-center gap-2">
				{/* Toggle Keyboard input button */}
				{!isPanelOpen && (
					<button
						onClick={() => setIsPanelOpen(true)}
						aria-label={t("voice.open_keyboard")}
						title={t("voice.open_keyboard")}
						className="w-10 h-10 rounded-full bg-neutral-900/90 border border-white/15 text-neutral-300 hover:text-white hover:bg-neutral-800 shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
					>
						<Keyboard className="w-4 h-4" />
					</button>
				)}

				<button
					onClick={handleOrbClick}
					aria-label={t("voice.talk_tooltip")}
					title={
						isIdle
							? t("voice.talk_tooltip")
							: isListening
								? t("voice.stop_listening")
								: t("voice.cancel_tooltip")
					}
					className={`relative group w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer ${
						isIdle
							? "bg-neutral-900 text-white hover:scale-105 border border-white/20 shadow-neutral-950/50"
							: isListening
								? "bg-rose-600 text-white ring-4 ring-rose-500/40 animate-pulse scale-110"
								: isThinking
									? "bg-amber-500 text-white ring-4 ring-amber-400/40 animate-pulse"
									: isExecuting
										? "bg-cyan-600 text-white ring-4 ring-cyan-400/40 animate-spin"
										: isSpeaking
											? "bg-blue-600 text-white ring-4 ring-blue-400/50 scale-105"
											: "bg-neutral-800 text-white"
					}`}
				>
					{isListening ? (
						<Mic className="w-6 h-6 animate-bounce" />
					) : isSpeaking ? (
						<Sparkles className="w-6 h-6 animate-pulse" />
					) : isThinking ? (
						<Sparkles className="w-6 h-6 animate-spin" />
					) : (
						<Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
					)}

					{/* Glow ambient background ring */}
					<span
						className={`absolute -inset-1 rounded-full blur-sm opacity-50 transition duration-500 ${
							isListening
								? "bg-rose-500"
								: isThinking
									? "bg-amber-400"
									: isSpeaking
										? "bg-blue-500"
										: "bg-primary/30 group-hover:opacity-75"
						}`}
					/>
				</button>
			</div>
		</div>
	);
};
