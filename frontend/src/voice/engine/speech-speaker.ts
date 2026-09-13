import { TTS_CONFIG } from "@/voice/config/tts-config";

export class SpeechSpeakerEngine {
	private isSpeaking = false;
	private onSpeakingChange?: (speaking: boolean) => void;

	constructor(onSpeakingChange?: (speaking: boolean) => void) {
		this.onSpeakingChange = onSpeakingChange;
	}

	public async speak(text: string): Promise<void> {
		this.stop(); // Abort previous speech if any

		if (!text || !text.trim()) return;

		this.setSpeaking(true);

		try {
			await new Promise<void>((resolve) => {
				if (
					typeof window === "undefined" ||
					!("speechSynthesis" in window)
				) {
					resolve();
					return;
				}

				window.speechSynthesis.cancel();
				const utterance = new SpeechSynthesisUtterance(text);

				// Select best female/natural voice from available system voices
				const voices = window.speechSynthesis.getVoices();
				const patternRegex = new RegExp(
					TTS_CONFIG.preferredVoicePatterns.join("|"),
					"i",
				);
				const matchedVoice = voices.find(
					(v) => patternRegex.test(v.name) && v.lang.startsWith("en"),
				);

				if (matchedVoice) {
					utterance.voice = matchedVoice;
				}

				// Tuned for a soft, pleasant cadence
				utterance.rate = TTS_CONFIG.rate;
				utterance.pitch = TTS_CONFIG.pitch;

				utterance.onend = () => resolve();
				utterance.onerror = () => resolve();

				window.speechSynthesis.speak(utterance);
			});
		} catch (err) {
			console.error("Web SpeechSynthesis error:", err);
		} finally {
			this.setSpeaking(false);
		}
	}

	public stop() {
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			window.speechSynthesis.cancel();
		}

		this.setSpeaking(false);
	}

	private setSpeaking(speaking: boolean) {
		this.isSpeaking = speaking;
		this.onSpeakingChange?.(speaking);
	}

	public getIsSpeaking(): boolean {
		return this.isSpeaking;
	}
}
