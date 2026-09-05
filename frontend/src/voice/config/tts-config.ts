export const TTS_CONFIG = {
	provider: "openai" as const,
	voice: "shimmer" as const, // Soft and gentle female voice
	fallbackVoice: "nova" as const,
	timeoutMs: 4000,
};
