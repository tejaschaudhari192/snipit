import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Send, Sparkles } from "lucide-react";
import type { VoiceAgentStatus } from "../../types/voice.types";

interface VoiceInputPanelProps {
	status: VoiceAgentStatus;
	transcript: string;
	activeActionDescription: string | null;
	isListening: boolean;
	onStartListening: () => void;
	onStopListening: () => void;
	onSubmitText: (text: string) => Promise<void>;
	onClose: () => void;
}

export const VoiceInputPanel: React.FC<VoiceInputPanelProps> = ({
	status,
	transcript,
	activeActionDescription,
	isListening,
	onStartListening,
	onStopListening,
	onSubmitText,
	onClose,
}) => {
	const { t } = useTranslation();
	const [textInput, setTextInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const isThinking = status === "thinking";
	const isExecuting = status === "executing";
	const isObserving = status === "observing";
	const isSpeaking = status === "speaking";

	useEffect(() => {
		const timer = setTimeout(() => {
			inputRef.current?.focus();
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	const handleFormSubmit = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const query = textInput.trim();
		if (!query) return;

		setTextInput("");
		await onSubmitText(query);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleFormSubmit();
		} else if (e.key === "Escape") {
			onClose();
		}
	};

	return (
		<div className="flex flex-col">
			{/* Dynamic status / transcript feed */}
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
						{activeActionDescription || t("voice.operating")}
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

			{/* Floating Prompt Bar (Gemini / Claude style pill) */}
			<form
				onSubmit={handleFormSubmit}
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

				<button
					type="button"
					onClick={isListening ? onStopListening : onStartListening}
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
	);
};
