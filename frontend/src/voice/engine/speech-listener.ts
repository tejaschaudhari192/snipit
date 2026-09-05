interface SpeechRecognitionAlternativeLike {
	transcript: string;
	confidence: number;
}

interface SpeechRecognitionResultLike {
	readonly length: number;
	[index: number]: SpeechRecognitionAlternativeLike;
	isFinal: boolean;
}

interface SpeechRecognitionResultListLike {
	readonly length: number;
	[index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
	readonly resultIndex: number;
	readonly results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
	readonly error: string;
	readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: ((event: SpeechRecognitionEventLike) => void) | null;
	onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
	onend: (() => void) | null;
	start: () => void;
	stop: () => void;
	abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface WindowWithSpeech extends Window {
	SpeechRecognition?: SpeechRecognitionConstructor;
	webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export interface SpeechListenerCallbacks {
	onTranscript: (transcript: string, isFinal: boolean) => void;
	onError?: (error: string) => void;
	onStateChange?: (isListening: boolean) => void;
}

export class SpeechListenerEngine {
	private recognition: SpeechRecognitionInstance | null = null;
	private isListening = false;
	private isMuted = false;
	private currentLang = "en-US";
	private unmutedCooldownTimeout: ReturnType<typeof setTimeout> | null = null;
	private callbacks: SpeechListenerCallbacks;

	constructor(callbacks: SpeechListenerCallbacks, lang = "en-US") {
		this.callbacks = callbacks;
		this.currentLang = lang;
		this.initRecognition();
	}

	public setLanguage(lang: string) {
		if (this.currentLang === lang) return;
		this.currentLang = lang;
		if (this.recognition) {
			this.recognition.lang = lang;
		}
	}

	private initRecognition() {
		if (typeof window === "undefined") return;

		const win = window as unknown as WindowWithSpeech;
		const SpeechRecognition =
			win.SpeechRecognition || win.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			console.warn(
				"SpeechRecognition API is not supported in this browser.",
			);
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = this.currentLang;

		recognition.onresult = (event: SpeechRecognitionEventLike) => {
			if (this.isMuted) return;

			let interim = "";
			let final = "";

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					final += transcript;
				} else {
					interim += transcript;
				}
			}

			if (final.trim()) {
				this.callbacks.onTranscript(final.trim(), true);
			} else if (interim.trim()) {
				this.callbacks.onTranscript(interim.trim(), false);
			}
		};

		recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
			if (event.error === "no-speech" || event.error === "aborted")
				return;
			console.warn("Speech recognition error:", event.error);
			this.callbacks.onError?.(event.error);
		};

		recognition.onend = () => {
			// Auto-restart if listening was meant to stay active and not muted
			if (this.isListening && !this.isMuted) {
				try {
					recognition.start();
				} catch {
					// ignore already started errors
				}
			} else {
				this.callbacks.onStateChange?.(false);
			}
		};

		this.recognition = recognition;
	}

	public start() {
		if (!this.recognition) return;
		if (this.isListening) return;

		this.isListening = true;
		this.isMuted = false;
		try {
			this.recognition.start();
			this.callbacks.onStateChange?.(true);
		} catch {
			// Already running
		}
	}

	public stop() {
		this.isListening = false;
		this.isMuted = false;
		if (this.unmutedCooldownTimeout)
			clearTimeout(this.unmutedCooldownTimeout);

		if (this.recognition) {
			try {
				this.recognition.stop();
			} catch {
				// ignore
			}
			this.callbacks.onStateChange?.(false);
		}
	}

	/**
	 * Acoustic Mutex Gate:
	 * Mutes microphone during TTS audio output to prevent audio feedback loop.
	 * When unmuting, enforces a 400ms cooldown so lingering acoustic echo is dropped.
	 */
	public setMuted(muted: boolean) {
		this.isMuted = muted;

		if (muted) {
			if (this.unmutedCooldownTimeout)
				clearTimeout(this.unmutedCooldownTimeout);
			if (this.recognition && this.isListening) {
				try {
					this.recognition.abort();
				} catch {
					// ignore
				}
			}
		} else {
			// 400ms acoustic dampening cooldown
			if (this.unmutedCooldownTimeout)
				clearTimeout(this.unmutedCooldownTimeout);
			this.unmutedCooldownTimeout = setTimeout(() => {
				if (this.isListening && this.recognition) {
					try {
						this.recognition.start();
					} catch {
						// ignore
					}
				}
			}, 400);
		}
	}

	public getStatus() {
		return {
			isSupported: Boolean(this.recognition),
			isListening: this.isListening,
			isMuted: this.isMuted,
		};
	}
}
