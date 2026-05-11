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

interface VoiceInputButtonProps {
	className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
	className,
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
	const { setTextValue, textValue } = usePaste();
	const [isTranscribing, setIsTranscribing] = useState(false);

	useEffect(() => {
		if (audioBlob) {
			const handleTranscribe = async (blob: Blob) => {
				setIsTranscribing(true);
				const loadingToast = toast.loading(t("editor.transcribing"));
				try {
					const { text } = await transcribeAudio(blob);
					if (text) {
						const newValue = textValue
							? `${textValue}\n${text}`
							: text;
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
					setAudioBlob(null);
				}
			};

			handleTranscribe(audioBlob);
		}
	}, [audioBlob, transcribeAudio, setTextValue, textValue, setAudioBlob, t]);

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
				<Button
					variant="outline"
					size="icon-sm"
					onClick={startRecording}
					disabled={isTranscribing}
					className={cn(
						"relative transition-all duration-300",
						isTranscribing && "opacity-80",
					)}
					title={t("editor.start_recording")}
				>
					{isTranscribing ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Mic className="h-[18px] w-[18px] text-red-500 fill-red-500/10" />
					)}
				</Button>
			)}
		</div>
	);
};
