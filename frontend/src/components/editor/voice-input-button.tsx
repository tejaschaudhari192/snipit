import React, { useEffect, useState } from "react";
import { Mic, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useApiHelpers } from "@/lib/api";
import { usePaste } from "@/context/PasteContext";
import { toast } from "sonner";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import { formatAudioDuration } from "@/utils/audio";
import { VoiceWaveform } from "./voice-waveform";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceInputButtonProps {
	className?: string;
	value?: string;
	setTextValue?: (val: string) => void;
	onRecordingChange?: (isRecording: boolean) => void;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
	className,
	value: propValue,
	setTextValue: propSetTextValue,
	onRecordingChange,
}) => {
	const { t } = useTranslation();
	const {
		isRecording,
		waveform,
		duration,
		startRecording,
		stopRecording,
		discardRecording,
		audioBlob,
		setAudioBlob,
	} = useAudioRecorder();
	const { transcribeAudio } = useApiHelpers();
	const pasteContext = usePaste();

	const textValue =
		propValue !== undefined ? propValue : pasteContext.textValue;
	const setTextValue =
		propSetTextValue !== undefined
			? propSetTextValue
			: pasteContext.setTextValue;

	const [isTranscribing, setIsTranscribing] = useState(false);

	useEffect(() => {
		onRecordingChange?.(isRecording);
	}, [isRecording, onRecordingChange]);

	useEffect(() => {
		if (!audioBlob || isTranscribing) return;

		const handleTranscribe = async (blob: Blob) => {
			setIsTranscribing(true);
			setAudioBlob(null); // Clear immediately to prevent re-triggering from state changes
			const loadingToast = toast.loading(t("editor.transcribing"));
			try {
				const { text } = await transcribeAudio(blob);
				if (text) {
					// Use a functional approach if possible, but here we append to current textValue
					const newValue = textValue ? `${textValue}\n${text}` : text;
					setTextValue(newValue);
					toast.success(t("editor.transcription_success"), {
						id: loadingToast,
					});
				} else {
					toast.dismiss(loadingToast);
				}
			} catch (error) {
				console.error("Transcription error:", error);
				toast.error(t("editor.transcription_failed"), {
					id: loadingToast,
				});
			} finally {
				setIsTranscribing(false);
			}
		};

		handleTranscribe(audioBlob);
	}, [
		audioBlob,
		isTranscribing,
		transcribeAudio,
		setTextValue,
		textValue,
		setAudioBlob,
		t,
	]);

	return (
		<div className={cn("flex items-center gap-2", className)}>
			{isRecording && (
				<div className="flex items-center gap-3 h-10 px-3 bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-right-4 duration-500 w-full max-w-[400px]">
					<VoiceWaveform waveform={waveform} />

					<span className="text-xs font-mono font-medium text-foreground/80 min-w-[32px]">
						{formatAudioDuration(duration)}
					</span>

					<div className="flex items-center gap-3 border-l border-border/50 pl-3">
						<button
							onClick={stopRecording}
							className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-sm"
							title={t("editor.stop_recording")}
						>
							<div className="h-3 w-3 bg-red-500 rounded-[3px]" />
						</button>

						<button
							onClick={discardRecording}
							className="h-7 w-7 rounded-full hover:bg-accent active:scale-95 flex items-center justify-center transition-all cursor-pointer text-foreground/60 hover:text-foreground"
							title={t("common.cancel")}
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			{!isRecording && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon-sm"
								onClick={startRecording}
								disabled={isTranscribing}
								className={cn(
									"h-9 w-9 shrink-0 relative transition-all duration-300",
									isTranscribing && "opacity-80",
								)}
							>
								{isTranscribing ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Mic className="h-5 w-5 text-red-500 fill-red-500/10" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="top">
							<p>{t("editor.start_recording")}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
};
