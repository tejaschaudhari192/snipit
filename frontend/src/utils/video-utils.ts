import { CONFIG } from "@/configurations";

/**
 * Video streamability validation and buffer percentage calculation utilities.
 */

/**
 * Validates whether a given URL is a streamable media link.
 * Performs a robust backend check to completely bypass client-side CORS restrictions.
 */
export const checkStreamableLink = async (
	url: string,
): Promise<{ ok: boolean; error?: string }> => {
	if (!url) {
		return { ok: false, error: "URL is empty" };
	}

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(url);
	} catch {
		return { ok: false, error: "Invalid URL format" };
	}

	if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
		return { ok: false, error: "Protocol must be HTTP or HTTPS" };
	}

	try {
		const response = await fetch(
			CONFIG.apiBaseUrl + "/pastes/validate-stream",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url }),
			},
		);

		if (response.ok) {
			const data = await response.json();
			return { ok: data.ok, error: data.error };
		}

		return {
			ok: false,
			error: "Validation service returned an error status.",
		};
	} catch {
		// Fallback to soft-pass if validation API fails
		return { ok: true };
	}
};

/**
 * Calculates the current buffer percentage of the video element relative to the current position.
 */
export const calculateBufferPercent = (video: HTMLVideoElement): number => {
	if (
		!video ||
		video.duration === 0 ||
		!video.buffered ||
		video.buffered.length === 0
	) {
		return 0;
	}

	const currentTime = video.currentTime;
	let bufferedEnd = 0;

	// Find the buffered range containing the current playback position
	for (let i = 0; i < video.buffered.length; i++) {
		const start = video.buffered.start(i);
		const end = video.buffered.end(i);
		if (currentTime >= start && currentTime <= end) {
			bufferedEnd = end;
			break;
		}
	}

	// Fallback to the closest future buffered range
	if (bufferedEnd === 0) {
		for (let i = 0; i < video.buffered.length; i++) {
			const end = video.buffered.end(i);
			if (end > currentTime) {
				bufferedEnd = end;
				break;
			}
		}
	}

	// Default fallback to the last segment buffered
	if (bufferedEnd === 0 && video.buffered.length > 0) {
		bufferedEnd = video.buffered.end(video.buffered.length - 1);
	}

	const percent = (bufferedEnd / video.duration) * 100;
	return Math.min(100, Math.max(0, Math.round(percent)));
};
