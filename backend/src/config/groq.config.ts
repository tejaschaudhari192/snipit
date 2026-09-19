/**
 * Groq Model Definitions and Fallback Chains
 * Defined as explicit constants rather than required environment variables.
 */
export const GROQ_CONFIG = {
	// General application tasks (language detection, autocomplete, title generation)
	models: {
		smart: "openai/gpt-oss-120b",
		dumb: "openai/gpt-oss-20b",
		generalList: [
			"openai/gpt-oss-120b",
			"qwen/qwen3.8-27b",
			"openai/gpt-oss-20b",
		] as readonly string[],
	},

	// Dedicated Voice & Agent models (isolated quotas)
	voice: {
		primary: "qwen/qwen3.8-27b",
		guard: "meta-llama/llama-prompt-guard-2-86m",
		fallbackList: [
			"qwen/qwen3.8-27b",
			"openai/gpt-oss-20b",
		] as readonly string[],
	},

	// Audio transcription models (primary + failover)
	audio: {
		primary: "whisper-large-v3-turbo",
		fallbackList: [
			"whisper-large-v3-turbo",
			"whisper-large-v3",
		] as readonly string[],
	},
} as const;
