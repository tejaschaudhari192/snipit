import React from "react";
import type { VoiceAgentStatus } from "../../types/voice.types";
import { AiMascot } from "../mascot";

import { X } from "lucide-react";

interface VoiceOrbTriggerProps {
	status: VoiceAgentStatus;
	onClick: () => void;
	onClose?: () => void;
}

export const VoiceOrbTrigger: React.FC<VoiceOrbTriggerProps> = ({
	status,
	onClick,
	onClose,
}) => {
	return (
		<div className="relative group/trigger flex items-center justify-center">
			{onClose && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
					title="Dismiss AI Assistant"
					className="absolute -top-1 -right-1 z-30 opacity-0 group-hover/trigger:opacity-100 p-1 rounded-full bg-neutral-900/95 hover:bg-neutral-800 border border-white/20 text-neutral-400 hover:text-white shadow-xl transition-all hover:scale-110 cursor-pointer"
					aria-label="Close AI Assistant"
				>
					<X className="w-3 h-3" />
				</button>
			)}

			<AiMascot
				status={status}
				onClick={onClick}
				size={120}
				className="hover:scale-105 transition-transform drop-shadow-xl"
			/>
		</div>
	);
};
