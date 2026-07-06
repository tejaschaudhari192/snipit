/**
 * Puter.js Text-to-Speech integration.
 * Loads Puter.js dynamically to avoid bundling it, keeping the initial payload light.
 */

interface PuterTxt2SpeechOptions {
	provider?: string;
	voice?: string;
}

interface PuterInstance {
	ai: {
		txt2speech: (
			text: string,
			options?: PuterTxt2SpeechOptions,
		) => Promise<HTMLAudioElement>;
	};
}

declare global {
	interface Window {
		puter?: PuterInstance;
	}
}

let puterJsLoaded = false;
let puterJsPromise: Promise<void> | null = null;

export const loadPuterJs = (): Promise<void> => {
	if (puterJsLoaded && window.puter) return Promise.resolve();
	if (puterJsPromise) return puterJsPromise;

	puterJsPromise = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = "https://js.puter.com/v2/";
		script.async = true;
		script.onload = () => {
			puterJsLoaded = true;
			resolve();
		};
		script.onerror = () => {
			puterJsPromise = null;
			reject(new Error("Failed to load Puter.js"));
		};
		document.head.appendChild(script);
	});

	return puterJsPromise;
};

/**
 * Generates speech from text using Puter.js.
 * Utilizes OpenAI's 'nova' female voice, which is highly natural and supports multiple languages.
 *
 * @param text The text to speak.
 * @returns An HTMLAudioElement returned directly by Puter.js.
 */
export const generatePuterSpeech = async (
	text: string,
): Promise<HTMLAudioElement> => {
	await loadPuterJs();

	if (!window.puter || !window.puter.ai || !window.puter.ai.txt2speech) {
		throw new Error("Puter.js loaded but txt2speech is not available.");
	}

	// OpenAI's 'nova' voice handles multiple languages intelligently.
	// If the user desires a different voice or provider in the future, we can map `detectedLanguage` here.
	const audio = await window.puter.ai.txt2speech(text, {
		provider: "openai",
		voice: "nova",
	});

	return audio;
};
