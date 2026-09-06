/**
 * Procedural Web Audio API Sound Synthesizer for Nick Wilde Mascot
 * Zero external audio files or dependencies. Generates subtle, slick chimes and clicks in-browser.
 */

class MascotAudioPlayer {
	private ctx: AudioContext | null = null;

	private getContext(): AudioContext | null {
		if (typeof window === "undefined") return null;
		if (!this.ctx) {
			const AudioCtx =
				window.AudioContext ||
				(
					window as unknown as {
						webkitAudioContext: typeof AudioContext;
					}
				).webkitAudioContext;
			if (AudioCtx) {
				this.ctx = new AudioCtx();
			}
		}
		if (this.ctx && this.ctx.state === "suspended") {
			this.ctx.resume().catch(() => {});
		}
		return this.ctx;
	}

	/** Slick two-tone woodwind chime when Nick starts listening */
	public playWakeChime() {
		try {
			const ctx = this.getContext();
			if (!ctx) return;

			const now = ctx.currentTime;
			const osc1 = ctx.createOscillator();
			const osc2 = ctx.createOscillator();
			const gain = ctx.createGain();

			osc1.type = "sine";
			osc1.frequency.setValueAtTime(440, now); // A4
			osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

			osc2.type = "triangle";
			osc2.frequency.setValueAtTime(880, now);
			osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12);

			gain.gain.setValueAtTime(0.08, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

			osc1.connect(gain);
			osc2.connect(gain);
			gain.connect(ctx.destination);

			osc1.start(now);
			osc2.start(now);
			osc1.stop(now + 0.3);
			osc2.stop(now + 0.3);
		} catch {
			// Ignore audio policy blocks
		}
	}

	/** Upbeat harmonic chord when Nick finishes a task / celebrates */
	public playDoneChime() {
		try {
			const ctx = this.getContext();
			if (!ctx) return;

			const now = ctx.currentTime;
			const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

			notes.forEach((freq, i) => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();

				osc.type = "sine";
				osc.frequency.setValueAtTime(freq, now + i * 0.06);

				gain.gain.setValueAtTime(0.06, now + i * 0.06);
				gain.gain.exponentialRampToValueAtTime(
					0.001,
					now + i * 0.06 + 0.35,
				);

				osc.connect(gain);
				gain.connect(ctx.destination);

				osc.start(now + i * 0.06);
				osc.stop(now + i * 0.06 + 0.38);
			});
		} catch {
			// Ignore audio policy blocks
		}
	}

	/** Crisp subtle pop on click */
	public playPop() {
		try {
			const ctx = this.getContext();
			if (!ctx) return;

			const now = ctx.currentTime;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(587.33, now); // D5
			osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

			gain.gain.setValueAtTime(0.09, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(now);
			osc.stop(now + 0.09);
		} catch {
			// Ignore audio policy blocks
		}
	}
}

export const mascotAudio = new MascotAudioPlayer();
