import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Mic,
	Send,
	Sparkles,
	Cpu,
	ChevronDown,
	ChevronUp,
	CheckCircle2,
	Loader2,
	AlertCircle,
	Search,
	Eye,
	Film,
	Compass,
	Lightbulb,
} from "lucide-react";
import type { VoiceAgentStatus, ExecutionStep } from "../../types/voice.types";
import { VoiceWaveform } from "../voice-waveform";

interface VoiceInputPanelProps {
	status: VoiceAgentStatus;
	transcript: string;
	activeActionDescription: string | null;
	isListening: boolean;
	executionSteps?: ExecutionStep[];
	onStartListening: () => void;
	onStopListening: () => void;
	onSubmitText: (text: string) => Promise<void>;
	onClose: () => void;
}

const QUICK_SUGGESTIONS = [
	{
		label: "🦊 What's on my screen?",
		icon: Eye,
		prompt: "What is currently on my screen?",
	},
	{
		label: "📋 Search my snippets",
		icon: Search,
		prompt: "Search my snippets",
	},
	{ label: "🎬 Open Cinema Mode", icon: Film, prompt: "Open Cinema mode" },
	{
		label: "🎵 Play some music",
		icon: Compass,
		prompt: "Play some relaxing music",
	},
];

export const VoiceInputPanel: React.FC<VoiceInputPanelProps> = ({
	status,
	transcript,
	activeActionDescription,
	isListening,
	executionSteps = [],
	onStartListening,
	onStopListening,
	onSubmitText,
	onClose,
}) => {
	const { t } = useTranslation();
	const [textInput, setTextInput] = useState("");
	const [showSteps, setShowSteps] = useState(false);
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

	const handleFormSubmit = async (
		e?: React.FormEvent,
		customQuery?: string,
	) => {
		if (e) e.preventDefault();
		const query = (
			customQuery !== undefined ? customQuery : textInput
		).trim();
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
		<div className="flex flex-col gap-2.5 p-3.5">
			{/* Dynamic status / transcript feed */}
			<div className="px-1 min-h-12 flex flex-col justify-center">
				{isListening ? (
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2">
							<span className="relative flex h-2.5 w-2.5">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
								<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
							</span>
							<span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
								{t("voice.listening")}
							</span>
							<div className="ml-auto">
								<VoiceWaveform
									active
									type="listening"
									bars={7}
								/>
							</div>
						</div>
						<p className="text-sm text-neutral-100 font-medium italic pl-4">
							{transcript
								? `"${transcript}"`
								: t("voice.listening_or_type")}
						</p>
					</div>
				) : isThinking ? (
					<div className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 animate-pulse">
						<Cpu
							className="w-4 h-4 text-amber-400 animate-spin"
							style={{ animationDuration: "3s" }}
						/>
						<span className="text-xs font-medium">
							🦊 Nick is calculating the play...
						</span>
						<div className="ml-auto">
							<VoiceWaveform active type="thinking" bars={5} />
						</div>
					</div>
				) : isExecuting ? (
					<div className="flex items-center gap-2.5 p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-200">
						<Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
						<p className="text-xs font-medium truncate flex-1">
							{activeActionDescription || t("voice.operating")}
						</p>
						<Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin shrink-0" />
					</div>
				) : isObserving ? (
					<div className="flex items-center gap-2.5 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-200">
						<Eye className="w-4 h-4 text-violet-400 animate-pulse" />
						<span className="text-xs font-medium">
							{t("voice.reading_screen")}
						</span>
						<Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin ml-auto" />
					</div>
				) : isSpeaking ? (
					<div className="flex flex-col gap-1.5 p-2.5 rounded-2xl bg-linear-to-r from-teal-950/50 to-neutral-900/60 border border-teal-500/30 shadow-[0_4px_16px_rgba(13,148,136,0.15)]">
						<div className="flex items-center justify-between">
							<span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
								<span>🦊 Nick Wilde</span>
							</span>
							<VoiceWaveform active type="speaking" bars={7} />
						</div>
						<p className="text-xs text-neutral-100 font-medium leading-relaxed italic pl-1">
							"{transcript}"
						</p>
					</div>
				) : (
					<div className="flex items-center gap-2 text-xs text-neutral-400 px-1">
						<Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
						<span>{t("voice.input_hint")}</span>
					</div>
				)}
			</div>

			{/* Quick Suggestion Chips (visible when idle or waiting for prompt) */}
			{!isThinking &&
				!isExecuting &&
				!isObserving &&
				executionSteps.length === 0 && (
					<div className="flex flex-wrap gap-1.5 pt-1">
						{QUICK_SUGGESTIONS.map((chip, idx) => {
							const ChipIcon = chip.icon;
							return (
								<button
									key={idx}
									type="button"
									onClick={() =>
										handleFormSubmit(undefined, chip.prompt)
									}
									className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
								>
									<ChipIcon className="w-3 h-3 text-cyan-400" />
									<span>{chip.label}</span>
								</button>
							);
						})}
					</div>
				)}

			{/* Execution Steps Trace Accordion */}
			{executionSteps.length > 0 && (
				<div className="pt-1 border-t border-white/10">
					<button
						type="button"
						onClick={() => setShowSteps((prev) => !prev)}
						className="flex items-center justify-between w-full text-[11px] font-medium text-neutral-400 hover:text-neutral-200 transition-colors py-1 cursor-pointer select-none"
					>
						<span className="flex items-center gap-1.5">
							<Cpu className="w-3 h-3 text-cyan-400" />
							Execution Trace (
							{
								executionSteps.filter(
									(s) => s.status === "done",
								).length
							}
							/{executionSteps.length})
						</span>
						{showSteps ? (
							<ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
						) : (
							<ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
						)}
					</button>

					{showSteps && (
						<div className="mt-1.5 max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
							{executionSteps.map((step) => (
								<div
									key={step.id}
									className="flex items-start gap-2 p-2 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md"
								>
									<div className="mt-0.5 shrink-0">
										{step.status === "done" ? (
											<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
										) : step.status === "running" ? (
											<Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
										) : step.status === "error" ? (
											<AlertCircle className="w-3.5 h-3.5 text-rose-400" />
										) : (
											<div className="w-2.5 h-2.5 rounded-full border border-neutral-600 ml-0.5 mt-0.5" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-[11px] font-medium text-neutral-200 truncate">
											{step.label}
										</p>
										{step.detail && (
											<p className="text-[10px] text-neutral-400 font-mono truncate">
												{step.detail}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Floating Prompt Glass Pill */}
			<form
				onSubmit={handleFormSubmit}
				className="flex items-center gap-2 bg-neutral-900/80 border border-white/15 rounded-2xl px-3 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/25 transition-all"
			>
				<input
					ref={inputRef}
					type="text"
					value={textInput}
					onChange={(e) => setTextInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t("voice.input_placeholder")}
					className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-400 focus:outline-none"
				/>

				<button
					type="button"
					onClick={isListening ? onStopListening : onStartListening}
					className={`p-2 rounded-xl transition-all cursor-pointer ${
						isListening
							? "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse"
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
					className="p-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-25 disabled:hover:from-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
					title={t("voice.send")}
				>
					<Send className="w-4 h-4" />
				</button>
			</form>
		</div>
	);
};
