import { useContext } from "react";
import {
	VoiceAgentContext,
	type VoiceAgentContextValue,
} from "../context/VoiceAgentContext";

/**
 * Access Voice Copilot agent state, controls, and triggers.
 */
export const useVoiceAgent = (): VoiceAgentContextValue => {
	const context = useContext(VoiceAgentContext);
	if (!context) {
		throw new Error(
			"useVoiceAgent must be used within a VoiceAgentProvider",
		);
	}
	return context;
};
