import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Volume2, X } from "lucide-react";

interface VoicePanelHeaderProps {
	isSpeaking: boolean;
	onClose: () => void;
}

export const VoicePanelHeader: React.FC<VoicePanelHeaderProps> = ({
	isSpeaking,
	onClose,
}) => {
	const { t } = useTranslation();

	return (
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
				onClick={onClose}
				className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
				title={t("voice.close_panel")}
			>
				<X className="w-4 h-4" />
			</button>
		</div>
	);
};
