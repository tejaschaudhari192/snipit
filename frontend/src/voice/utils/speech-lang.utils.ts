import {
	LOCALE_TO_SPEECH_LANG,
	DEFAULT_SPEECH_LANG,
} from "../config/speech-languages";

/**
 * Resolves BCP-47 speech recognition and synthesis language code from the current UI locale.
 */
export function resolveSpeechLang(
	localeCode: string | undefined | null,
): string {
	if (!localeCode) return DEFAULT_SPEECH_LANG;

	if (LOCALE_TO_SPEECH_LANG[localeCode]) {
		return LOCALE_TO_SPEECH_LANG[localeCode];
	}

	const base = localeCode.split("-")[0];
	if (LOCALE_TO_SPEECH_LANG[base]) {
		return LOCALE_TO_SPEECH_LANG[base];
	}

	return DEFAULT_SPEECH_LANG;
}
