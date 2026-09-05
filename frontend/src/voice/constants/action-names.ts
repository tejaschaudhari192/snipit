import type { VoiceActionType } from "../types/voice.types";

/**
 * Action types that perform data fetching or mutate visible state
 * requiring the screen perceiver to observe DOM settlement and summarize results.
 */
export const PERCEPTIVE_VOICE_ACTIONS: readonly VoiceActionType[] = [
	"CHECK_PNR",
	"SEARCH_TRAINS",
	"TRAIN_LIVE_STATUS",
	"TRAIN_SCHEDULE",
	"GENERATE_PASSWORD",
] as const;

export function isPerceptiveAction(actionType: VoiceActionType): boolean {
	return (PERCEPTIVE_VOICE_ACTIONS as readonly string[]).includes(actionType);
}
