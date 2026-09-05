import React from "react";
import { useTranslation } from "react-i18next";
import { X, Sparkles, Activity } from "lucide-react";
import type { VoiceAgentStatus } from "../types/voice.types";
import { VoiceWaveform } from "./voice-waveform";

interface VoiceHUDProps {
	status: VoiceAgentStatus;
	transcript: string;
	activeAction: string | null;
	onCancel: () => void;
}

export const VoiceHUD: React.FC<VoiceHUDProps> = ({
	status,
	transcript,
	activeAction,
	onCancel,
}) => {
	const { t } = useTranslation();

	if (status === "idle") return null;

	return (
		<div className="absolute bottom-16 right-0 mb-3 w-80 sm:w-96 p-4 rounded-2xl bg-neutral-900/95 border border-white/10 backdrop-blur-xl shadow-2xl text-white animate-in fade-in slide-in-from-bottom-3 duration-300 z-50">
			<div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
				<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					<Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
					<span>{t("voice.title")}</span>
				</div>
				<div className="flex items-center gap-2">
					{status === "listening" && (
						<VoiceWaveform active type="listening" />
					)}
					{status === "speaking" && (
						<VoiceWaveform active type="speaking" />
					)}
					<button
						onClick={onCancel}
						className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
						title={t("voice.cancel_tooltip")}
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			{/* Transcript or Status */}
			<div className="min-h-10 flex flex-col justify-center">
				{status === "listening" && (
					<p className="text-sm text-neutral-200 italic">
						{transcript ? `"${transcript}"` : t("voice.listening")}
					</p>
				)}

				{status === "thinking" && (
					<div className="flex items-center gap-2 text-sm text-amber-400">
						<Activity className="w-4 h-4 animate-spin" />
						<span>{t("voice.thinking")}</span>
					</div>
				)}

				{status === "executing" && (
					<p className="text-sm font-medium text-cyan-300 animate-pulse">
						{activeAction || t("voice.operating")}
					</p>
				)}

				{status === "observing" && (
					<div className="flex items-center gap-2 text-sm text-cyan-400">
						<Activity className="w-4 h-4 animate-spin" />
						<span>{t("voice.reading_screen")}</span>
					</div>
				)}

				{status === "speaking" && (
					<p className="text-sm text-neutral-300">
						{transcript || t("voice.responding")}
					</p>
				)}

				{status === "error" && (
					<p className="text-sm text-rose-400">{t("voice.error")}</p>
				)}
			</div>
		</div>
	);
};
