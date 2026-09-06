import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	X,
	Sparkles,
	Cpu,
	ChevronDown,
	ChevronUp,
	CheckCircle2,
	Loader2,
	AlertCircle,
	Eye,
} from "lucide-react";
import type { VoiceAgentStatus, ExecutionStep } from "../types/voice.types";
import { VoiceWaveform } from "./voice-waveform";

interface VoiceHUDProps {
	status: VoiceAgentStatus;
	transcript: string;
	activeAction: string | null;
	executionSteps?: ExecutionStep[];
	onCancel: () => void;
}

export const VoiceHUD: React.FC<VoiceHUDProps> = ({
	status,
	transcript,
	activeAction,
	executionSteps = [],
	onCancel,
}) => {
	const { t } = useTranslation();
	const [showSteps, setShowSteps] = useState(false);

	if (status === "idle") return null;

	return (
		<div className="absolute bottom-16 right-0 mb-3 w-80 sm:w-96 p-3.5 rounded-3xl bg-neutral-950/90 border border-white/15 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.6)] text-white animate-in fade-in slide-in-from-bottom-3 duration-300 z-50">
			{/* Specular glass reflection */}
			<div className="absolute top-0 inset-x-0 h-8 bg-linear-to-b from-white/10 to-transparent rounded-t-3xl pointer-events-none" />

			{/* Header bar */}
			<div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
				<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
					<div className="w-5 h-5 rounded-full bg-linear-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.4)]">
						<Sparkles className="w-3 h-3 text-white animate-pulse" />
					</div>
					<span>{t("voice.title")}</span>
				</div>
				<div className="flex items-center gap-2">
					{status === "listening" && (
						<VoiceWaveform active type="listening" bars={7} />
					)}
					{status === "speaking" && (
						<VoiceWaveform active type="speaking" bars={7} />
					)}
					{status === "thinking" && (
						<VoiceWaveform active type="thinking" bars={5} />
					)}
					<button
						onClick={onCancel}
						className="p-1 rounded-full hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
						title={t("voice.cancel_tooltip")}
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			{/* Transcript or Status */}
			<div className="min-h-9 flex flex-col justify-center px-1">
				{status === "listening" && (
					<p className="text-xs sm:text-sm text-neutral-200 italic font-medium">
						{transcript ? `"${transcript}"` : t("voice.listening")}
					</p>
				)}

				{status === "thinking" && (
					<div className="flex items-center gap-2 text-xs sm:text-sm text-amber-300">
						<Cpu
							className="w-4 h-4 text-amber-400 animate-spin"
							style={{ animationDuration: "3s" }}
						/>
						<span className="font-medium animate-pulse">
							{t("voice.thinking")}
						</span>
					</div>
				)}

				{status === "executing" && (
					<div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-300">
						<Sparkles className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
						<p className="font-medium truncate">
							{activeAction || t("voice.operating")}
						</p>
					</div>
				)}

				{status === "observing" && (
					<div className="flex items-center gap-2 text-xs sm:text-sm text-violet-300">
						<Eye className="w-4 h-4 text-violet-400 animate-pulse shrink-0" />
						<span className="font-medium animate-pulse">
							{t("voice.reading_screen")}
						</span>
					</div>
				)}

				{status === "speaking" && (
					<p className="text-xs sm:text-sm text-neutral-200 line-clamp-3 leading-relaxed">
						{transcript || t("voice.responding")}
					</p>
				)}

				{status === "error" && (
					<div className="flex items-center gap-1.5 text-xs text-rose-400">
						<AlertCircle className="w-4 h-4" />
						<span>{t("voice.error")}</span>
					</div>
				)}
			</div>

			{/* Low-Level Execution Trace */}
			{executionSteps.length > 0 && (
				<div className="mt-2.5 pt-2 border-t border-white/10">
					<button
						type="button"
						onClick={() => setShowSteps((prev) => !prev)}
						className="flex items-center justify-between w-full text-[11px] font-medium text-neutral-400 hover:text-neutral-200 transition-colors py-0.5 cursor-pointer select-none"
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
						<div className="mt-1.5 max-h-32 overflow-y-auto space-y-1.5 pr-1 text-xs">
							{executionSteps.map((step) => (
								<div
									key={step.id}
									className="flex items-start gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5"
								>
									<div className="mt-0.5 shrink-0">
										{step.status === "done" ? (
											<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
										) : step.status === "running" ? (
											<Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
										) : step.status === "error" ? (
											<AlertCircle className="w-3.5 h-3.5 text-rose-400" />
										) : (
											<div className="w-2.5 h-2.5 rounded-full border border-neutral-500 ml-0.5 mt-0.5" />
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
		</div>
	);
};
