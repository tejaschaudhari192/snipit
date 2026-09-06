import React from "react";
import { useTranslation } from "react-i18next";
import { X, Activity } from "lucide-react";
import type { VoiceAgentStatus } from "../../types/voice.types";
import { VoiceWaveform } from "../voice-waveform";

interface VoicePanelHeaderProps {
	status: VoiceAgentStatus;
	isSpeaking: boolean;
	onClose: () => void;
}

export const VoicePanelHeader: React.FC<VoicePanelHeaderProps> = ({
	status,
	isSpeaking,
	onClose,
}) => {
	const { t } = useTranslation();

	const isListening = status === "listening";
	const isThinking = status === "thinking";
	const isExecuting = status === "executing";

	return (
		<div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-linear-to-r from-teal-950/40 via-neutral-900/60 to-neutral-950/40">
			<div className="flex items-center gap-2.5">
				<div className="w-7 h-7 rounded-full bg-linear-to-tr from-orange-500 to-teal-500 flex items-center justify-center text-sm shadow-[0_0_12px_rgba(249,115,22,0.4)]">
					🦊
				</div>
				<div>
					<div className="flex items-center gap-1.5">
						<span className="text-xs font-bold tracking-wide text-white">
							Nick Wilde
						</span>
						<span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
							Fox AI
						</span>
					</div>
					<p className="text-[10px] text-neutral-400">
						{isListening
							? "Listening to you..."
							: isThinking
								? "Calculating the hustle..."
								: isSpeaking
									? "Speaking..."
									: "Ready for your prompt"}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{/* Live Audio Visualizer in Header */}
				{(isListening || isSpeaking) && (
					<VoiceWaveform
						active
						type={isListening ? "listening" : "speaking"}
						bars={5}
					/>
				)}

				{isThinking && (
					<span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-full font-medium animate-pulse">
						<Activity className="w-3 h-3 animate-spin" />
						Pondering
					</span>
				)}

				{isExecuting && (
					<span className="flex items-center gap-1 text-[10px] text-teal-300 bg-teal-950/60 border border-teal-800/50 px-2 py-0.5 rounded-full font-medium animate-pulse">
						<Activity className="w-3 h-3 animate-spin" />
						Working
					</span>
				)}

				<button
					onClick={onClose}
					className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
					title={t("voice.close_panel")}
				>
					<X className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
};
