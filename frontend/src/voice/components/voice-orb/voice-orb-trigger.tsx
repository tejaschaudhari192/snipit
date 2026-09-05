import React from "react";
import { useTranslation } from "react-i18next";
import { Mic, Sparkles } from "lucide-react";
import type { VoiceAgentStatus } from "../../types/voice.types";

interface VoiceOrbTriggerProps {
	status: VoiceAgentStatus;
	onClick: () => void;
}

export const VoiceOrbTrigger: React.FC<VoiceOrbTriggerProps> = ({
	status,
	onClick,
}) => {
	const { t } = useTranslation();

	const isIdle = status === "idle";
	const isListening = status === "listening";
	const isThinking = status === "thinking";
	const isExecuting = status === "executing";
	const isSpeaking = status === "speaking";

	return (
		<button
			onClick={onClick}
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
	);
};
