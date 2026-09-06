import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Terminal, Compass, Music, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceWaveform } from "../voice-waveform";
import type { VoiceAgentStatus } from "../../types/voice.types";

interface VoiceChatInputProps {
	status: VoiceAgentStatus;
	isListening: boolean;
	onStartListening: () => void;
	onStopListening: () => void;
	onSendMessage: (text: string) => Promise<void>;
	disabled?: boolean;
}

const SUGGESTIONS = [
	{
		label: "Create Python snippet",
		icon: Terminal,
		prompt: "Create a Python script for binary search",
	},
	{
		label: "Search trains",
		icon: Compass,
		prompt: "Search trains from New Delhi to Mumbai",
	},
	{
		label: "What's on my screen?",
		icon: Eye,
		prompt: "What is currently on my screen?",
	},
	{
		label: "Play music",
		icon: Music,
		prompt: "Play some relaxing coding music",
	},
];

export const VoiceChatInput: React.FC<VoiceChatInputProps> = ({
	status,
	isListening,
	onStartListening,
	onStopListening,
	onSendMessage,
	disabled = false,
}) => {
	const [text, setText] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const isBusy =
		status === "thinking" ||
		status === "executing" ||
		status === "observing";

	useEffect(() => {
		const timer = setTimeout(() => {
			inputRef.current?.focus();
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
		if (e) e.preventDefault();
		const prompt = (customPrompt ?? text).trim();
		if (!prompt || isBusy || disabled) return;

		setText("");
		await onSendMessage(prompt);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<div className="flex flex-col gap-2 p-3 bg-background/80 border-t border-border/40 backdrop-blur-md">
			{/* Minimal Suggestion Chips */}
			<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
				{SUGGESTIONS.map((s, idx) => {
					const Icon = s.icon;
					return (
						<button
							key={idx}
							type="button"
							onClick={() => handleSubmit(undefined, s.prompt)}
							disabled={isBusy}
							className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 border border-border/40 transition-all shrink-0 cursor-pointer disabled:opacity-40"
						>
							<Icon className="size-3 text-primary/70" />
							<span>{s.label}</span>
						</button>
					);
				})}
			</div>

			{/* Minimal Pill Input Container */}
			<form
				onSubmit={handleSubmit}
				className="relative flex items-center gap-1.5 rounded-xl bg-muted/40 border border-border/60 px-2 py-1 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all"
			>
				<input
					ref={inputRef}
					type="text"
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={
						isListening
							? "Listening... Speak your command"
							: isBusy
								? "Copilot is working..."
								: "Ask or command SnipIt... (Enter)"
					}
					disabled={isBusy}
					className="flex-1 bg-transparent px-1.5 py-1 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
				/>

				{/* Micro Waveform Visualizer when recording */}
				{isListening && (
					<div className="flex items-center px-1">
						<VoiceWaveform active type="listening" bars={5} />
					</div>
				)}

				{/* Mic Toggle Button */}
				<Button
					type="button"
					variant={isListening ? "destructive" : "ghost"}
					size="icon-sm"
					onClick={isListening ? onStopListening : onStartListening}
					disabled={isBusy}
					className={`size-7 rounded-lg transition-all cursor-pointer ${
						isListening
							? "shadow-sm shadow-destructive/50 animate-pulse"
							: "text-muted-foreground hover:text-foreground"
					}`}
					title={isListening ? "Stop Listening" : "Start Voice Input"}
				>
					<Mic className="size-3.5" />
				</Button>

				{/* Send Button */}
				<Button
					type="submit"
					variant="default"
					size="icon-sm"
					disabled={!text.trim() || isBusy}
					className="size-7 rounded-lg transition-all cursor-pointer disabled:opacity-30"
					title="Send (Enter)"
				>
					<Send className="size-3.5" />
				</Button>
			</form>
		</div>
	);
};
