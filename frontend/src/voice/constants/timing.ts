/**
 * Acoustic & Perceptive Timing Constants
 */
export const TIMING_CONFIG = {
	/**
	 * Cooldown wait after muting/unmuting listener to prevent mic capturing TTS echo
	 */
	ACOUSTIC_COOLDOWN_MS: 400,

	/**
	 * Maximum wait duration for DOM loaders to vanish and data to render on screen
	 */
	SCREEN_SETTLEMENT_TIMEOUT_MS: 7000,

	/**
	 * Timeout for cloud TTS synthesis before falling back to browser speech synthesis
	 */
	TTS_TIMEOUT_MS: 4000,
} as const;
