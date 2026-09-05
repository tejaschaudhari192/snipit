import { createContext } from "react";
import type { VoiceAgentStatus } from "../types/voice.types";

export interface VoiceAgentContextValue {
	status: VoiceAgentStatus;
	transcript: string;
	isListening: boolean;
	isSpeaking: boolean;
	activeActionDescription: string | null;
	startListening: () => void;
	stopListening: () => void;
	cancel: () => void;
	sendTextMessage: (text: string) => Promise<void>;
}

export const VoiceAgentContext = createContext<VoiceAgentContextValue | null>(
	null,
);
