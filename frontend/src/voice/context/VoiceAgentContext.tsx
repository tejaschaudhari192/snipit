import { createContext } from "react";
import type {
	VoiceAgentStatus,
	ExecutionStep,
	ChatMessage,
} from "../types/voice.types";

export interface VoiceAgentContextValue {
	status: VoiceAgentStatus;
	transcript: string;
	isListening: boolean;
	isSpeaking: boolean;
	activeActionDescription: string | null;
	executionSteps: ExecutionStep[];
	showExecutionDetails: boolean;
	toggleExecutionDetails: () => void;
	startListening: () => void;
	stopListening: () => void;
	cancel: () => void;
	sendTextMessage: (text: string) => Promise<void>;
	isMascotVisible: boolean;
	setIsMascotVisible: (visible: boolean) => void;
	toggleMascot: () => void;
	messages: ChatMessage[];
	clearMessages: () => void;
}

export const VoiceAgentContext = createContext<VoiceAgentContextValue | null>(
	null,
);
