import { generatePuterSpeech } from "@/lib/puter-tts";

export class SpeechSpeakerEngine {
	private currentAudio: HTMLAudioElement | null = null;
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
			// Primary: Puter TTS using OpenAI's softest, cutest female voice ('shimmer' or 'nova')
			let audio: HTMLAudioElement;
			if (typeof window !== "undefined" && window.puter?.ai?.txt2speech) {
				audio = await Promise.race([
					window.puter.ai.txt2speech(text, {
						provider: "openai",
						voice: "shimmer", // 'shimmer' is soft, cute, and gentle
					}),
					new Promise<never>((_, reject) =>
						setTimeout(
							() => reject(new Error("Puter TTS timeout")),
							4000,
						),
					),
				]);
			} else {
				audio = await Promise.race([
					generatePuterSpeech(text),
					new Promise<never>((_, reject) =>
						setTimeout(
							() => reject(new Error("Puter TTS timeout")),
							4000,
						),
					),
				]);
			}

			this.currentAudio = audio;

			await new Promise<void>((resolve) => {
				audio.onended = () => {
					this.currentAudio = null;
					resolve();
				};
				audio.onerror = () => {
					this.currentAudio = null;
					resolve();
				};
				audio.play().catch(() => resolve());
			});
		} catch (err) {
			console.warn("Puter TTS fallback to browser SpeechSynthesis:", err);
			// Secondary Fallback: Browser Web SpeechSynthesis
			await this.speakBrowserFallback(text);
		} finally {
			this.setSpeaking(false);
		}
	}

	private speakBrowserFallback(text: string): Promise<void> {
		return new Promise((resolve) => {
			if (
				typeof window === "undefined" ||
				!("speechSynthesis" in window)
			) {
				resolve();
				return;
			}

			window.speechSynthesis.cancel();
			const utterance = new SpeechSynthesisUtterance(text);

			// Select best soft female voice from available system voices
			const voices = window.speechSynthesis.getVoices();
			const femaleVoice = voices.find(
				(v) =>
					/female|zira|samantha|victoria|karen|moira|tessa|natural|google us english/i.test(
						v.name,
					) && v.lang.startsWith("en"),
			);

			if (femaleVoice) {
				utterance.voice = femaleVoice;
			}

			// Tuned for a soft, pleasant, youthful cadence
			utterance.rate = 1.02;
			utterance.pitch = 1.25; // Gentle, cute higher pitch

			utterance.onend = () => resolve();
			utterance.onerror = () => resolve();

			window.speechSynthesis.speak(utterance);
		});
	}

	public stop() {
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio.currentTime = 0;
			this.currentAudio = null;
		}

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
