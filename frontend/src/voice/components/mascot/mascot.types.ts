import type { VoiceAgentStatus } from "../../types/voice.types";

export type MascotMovement =
	| "idle"
	| "listening"
	| "thinking"
	| "executing"
	| "observing"
	| "speaking"
	| "waving"
	| "celebrate"
	| "sleeping"
	| "error";

export interface MascotFaceProps {
	movement: MascotMovement;
	pupilOffset: { x: number; y: number };
	isSpeaking: boolean;
}

export interface AiMascotProps {
	movement?: MascotMovement;
	status?: VoiceAgentStatus;
	onClick?: () => void;
	size?: number;
	className?: string;
	showSpeechBubble?: boolean;
	speechText?: string;
	mode?: "standing" | "perched";
	enableSounds?: boolean;
}
