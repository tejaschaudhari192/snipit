import React from "react";
import { useTranslation } from "react-i18next";
import { Keyboard } from "lucide-react";

interface VoiceKeyboardToggleProps {
	onClick: () => void;
}

export const VoiceKeyboardToggle: React.FC<VoiceKeyboardToggleProps> = ({
	onClick,
}) => {
	const { t } = useTranslation();

	return (
		<button
			onClick={onClick}
			aria-label={t("voice.open_keyboard")}
			title={t("voice.open_keyboard")}
			className="w-10 h-10 rounded-full bg-neutral-900/90 border border-white/15 text-neutral-300 hover:text-white hover:bg-neutral-800 shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
		>
			<Keyboard className="w-4 h-4" />
		</button>
	);
};
