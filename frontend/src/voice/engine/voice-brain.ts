import api from "@/lib/api";
import type {
	BrainDecision,
	SessionMemoryData,
	VoiceActionPayload,
} from "../types/voice.types";
import { buildSystemPrompt } from "../knowledge/prompt-builder";

export class VoiceBrain {
	public static async decide(
		utterance: string,
		memory: SessionMemoryData,
		lang = "en",
	): Promise<BrainDecision> {
		const text = utterance.trim();

		// 1. Check if we are waiting for a pending slot
		if (memory.pendingSlot) {
			const slot = memory.pendingSlot;
			const slotParam = slot.missingParam;

			// Special check for 10-digit PNR
			if (slotParam === "pnr") {
				const pnrMatch = text.match(/\b\d{10}\b/);
				if (pnrMatch) {
					return {
						speech: `Checking status for PNR ${pnrMatch[0]} now.`,
						action: {
							type: "CHECK_PNR",
							params: { pnr: pnrMatch[0] },
						},
						updatedEntities: { pnr: pnrMatch[0] },
						pendingSlot: null,
					};
				}
			}

			// Special check for 5-digit Train number
			if (slotParam === "trainNo") {
				const trainMatch = text.match(/\b\d{5}\b/);
				if (trainMatch) {
					return {
						speech: `Looking up train ${trainMatch[0]} now.`,
						action: {
							type: slot.actionType,
							params: {
								...slot.collectedParams,
								trainNo: trainMatch[0],
							} as Record<string, unknown>,
						} as VoiceActionPayload,
						updatedEntities: { trainNo: trainMatch[0] },
						pendingSlot: null,
					};
				}
			}
		}

		// 2. Direct Instant Regex Matchers (Fast zero-latency path - 0 tokens)
		const instantDecision = this.matchInstantRegex(text);
		if (instantDecision) {
			return instantDecision;
		}

		// 3. Backend Hybrid Groq Pipeline:
		// Tier 1: meta-llama/llama-prompt-guard-2-86m (security & injection shield)
		// Tier 2: qwen/qwen3.8-27b (accurate JSON action planning & speech)
		try {
			const systemPrompt = buildSystemPrompt(memory, lang);
			const history = memory.history.map((h) => ({
				role: h.role,
				content: h.content,
			}));

			const res = await api.post("/ai/voice/decide", {
				systemPrompt,
				userMessage: text,
				history,
			});

			if (res.data && typeof res.data === "object") {
				const data = res.data as Record<string, unknown>;
				if (typeof data.speech === "string" && data.action) {
					return data as unknown as BrainDecision;
				}
			}

			throw new Error("Invalid response received from Groq AI service");
		} catch (err) {
			console.error("Groq hybrid voice decision failed:", err);
			throw err;
		}
	}

	private static matchInstantRegex(text: string): BrainDecision | null {
		// 10-digit PNR detection
		const pnrMatch = text.match(/\b\d{10}\b/);
		if (pnrMatch && /pnr|ticket|seat/i.test(text)) {
			return {
				speech: `Checking status for PNR ${pnrMatch[0]}.`,
				action: { type: "CHECK_PNR", params: { pnr: pnrMatch[0] } },
				updatedEntities: { pnr: pnrMatch[0] },
				pendingSlot: null,
			};
		}

		// Theme toggle
		if (/dark mode/i.test(text)) {
			return {
				speech: "Switching to dark mode.",
				action: { type: "CHANGE_THEME", params: { theme: "dark" } },
			};
		}
		if (/light mode/i.test(text)) {
			return {
				speech: "Switching to light mode.",
				action: { type: "CHANGE_THEME", params: { theme: "light" } },
			};
		}

		// Music
		if (/pause music|stop music/i.test(text)) {
			return {
				speech: "Pausing music.",
				action: { type: "CONTROL_MUSIC", params: { action: "pause" } },
			};
		}
		if (/resume music|play music/i.test(text)) {
			return {
				speech: "Playing music.",
				action: { type: "CONTROL_MUSIC", params: { action: "play" } },
			};
		}

		// Click Paste / Save Snippet
		if (
			/click paste|press paste|hit paste|submit paste|save snippet|publish paste|paste it/i.test(
				text,
			)
		) {
			return {
				speech: "Clicking Paste to save your snippet.",
				action: {
					type: "DOM_CLICK",
					params: {
						selector: "#quick-paste-button",
						description: "Click Paste button",
					},
				},
			};
		}

		// Quick navigation
		if (/go to (trains?|pnr)/i.test(text)) {
			return {
				speech: "Opening Indian Railways tool.",
				action: { type: "NAVIGATE", params: { path: "/tools/trains" } },
			};
		}
		if (/go to (cinema|watch party)/i.test(text)) {
			return {
				speech: "Opening Cinema watch party.",
				action: { type: "NAVIGATE", params: { path: "/tools/cinema" } },
			};
		}
		if (/go to (passwords?|vault)/i.test(text)) {
			return {
				speech: "Opening password manager.",
				action: {
					type: "NAVIGATE",
					params: { path: "/tools/passwords" },
				},
			};
		}
		if (/go to (companion|buddy|ai companion)/i.test(text)) {
			return {
				speech: "Opening AI companion.",
				action: {
					type: "NAVIGATE",
					params: { path: "/tools/companion" },
				},
			};
		}
		if (/go to (cryptsafe|crypto safe|encryption)/i.test(text)) {
			return {
				speech: "Opening CryptoSafe encryption vault.",
				action: {
					type: "NAVIGATE",
					params: { path: "/tools/cryptoSafe" },
				},
			};
		}

		// Quick paste creation modes (only if simple navigation request, not a code generation request)
		const trimmed = text.trim();
		if (/^(open |start )?(whiteboard|canvas|sketch)$/i.test(trimmed)) {
			return {
				speech: "Opening whiteboard canvas.",
				action: { type: "CREATE_SNIPPET", params: { mode: "draw" } },
			};
		}
		if (
			/^(open |start )?(document editor|docs view|rich text)$/i.test(
				trimmed,
			)
		) {
			return {
				speech: "Opening document editor.",
				action: { type: "CREATE_SNIPPET", params: { mode: "docs" } },
			};
		}
		if (/^(open )?(url shortener|shorten link)$/i.test(trimmed)) {
			return {
				speech: "Opening URL shortener.",
				action: { type: "CREATE_SNIPPET", params: { mode: "link" } },
			};
		}
		if (/^(open )?(file upload|share file)$/i.test(trimmed)) {
			return {
				speech: "Opening file upload view.",
				action: { type: "CREATE_SNIPPET", params: { mode: "file" } },
			};
		}
		if (
			/^(open |new )?(code editor|code view|empty code)$/i.test(trimmed)
		) {
			return {
				speech: "Opening code editor.",
				action: { type: "CREATE_SNIPPET", params: { mode: "code" } },
			};
		}
		if (/^(open |new )?(text editor|plain text editor)$/i.test(trimmed)) {
			return {
				speech: "Opening text editor.",
				action: { type: "CREATE_SNIPPET", params: { mode: "text" } },
			};
		}

		return null;
	}
}
