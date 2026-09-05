import { loadPuterJs } from "@/lib/puter-tts";
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

		// 2. Direct Instant Regex Matchers (Fast zero-latency path)
		const instantDecision = this.matchInstantRegex(text);
		if (instantDecision) {
			return instantDecision;
		}

		// 3. Puter AI LLM inference
		try {
			await loadPuterJs();

			if (typeof window !== "undefined" && window.puter?.ai?.chat) {
				const systemPrompt = buildSystemPrompt(memory, lang);

				const chatMessages = [
					{ role: "system", content: systemPrompt },
					...memory.history.map((h) => ({
						role: h.role,
						content: h.content,
					})),
					{ role: "user", content: text },
				];

				const response = await window.puter.ai.chat(chatMessages, {
					model: "gpt-4o-mini",
					temperature: 0.8,
				});

				const resObj =
					response && typeof response === "object"
						? (response as Record<string, unknown>)
						: null;
				const msgObj =
					resObj?.message && typeof resObj.message === "object"
						? (resObj.message as Record<string, unknown>)
						: null;
				const msgContent =
					typeof msgObj?.content === "string" ? msgObj.content : "";
				const resText =
					typeof resObj?.text === "string" ? resObj.text : "";

				const rawContent =
					typeof response === "string"
						? response
						: msgContent || resText;

				const parsed = this.cleanAndParseJSON(rawContent);
				if (parsed) {
					return parsed;
				}
			}
		} catch (err) {
			console.warn(
				"Puter AI reasoning failed, falling back to local heuristic:",
				err,
			);
		}

		// 4. Ultimate Fallback Heuristic
		return this.fallbackHeuristic(text);
	}

	private static cleanAndParseJSON(raw: string): BrainDecision | null {
		try {
			// Remove code fences
			const cleaned = raw
				.replace(/```json/gi, "")
				.replace(/```/g, "")
				.trim();
			const firstBrace = cleaned.indexOf("{");
			const lastBrace = cleaned.lastIndexOf("}");

			if (firstBrace !== -1 && lastBrace !== -1) {
				const jsonSubstring = cleaned.substring(
					firstBrace,
					lastBrace + 1,
				);
				const parsed = JSON.parse(jsonSubstring);
				if (
					parsed &&
					typeof parsed.speech === "string" &&
					parsed.action
				) {
					return parsed as BrainDecision;
				}
			}
		} catch {
			// Failed parse
		}
		return null;
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
		if (/go to password/i.test(text)) {
			return {
				speech: "Opening password manager.",
				action: {
					type: "NAVIGATE",
					params: { path: "/tools/password-manager" },
				},
			};
		}

		return null;
	}

	private static fallbackHeuristic(text: string): BrainDecision {
		if (/train|pnr/i.test(text)) {
			return {
				speech: "Opening the trains tool for you.",
				action: { type: "NAVIGATE", params: { path: "/tools/trains" } },
			};
		}
		if (/hello|hi|hey/i.test(text)) {
			return {
				speech: "Hello! I am your Snipit voice copilot. What can I do for you today?",
				action: { type: "NONE" },
			};
		}

		return {
			speech: "I heard you, but I wasn't sure which action to take. Could you rephrase?",
			action: { type: "NONE" },
		};
	}
}
