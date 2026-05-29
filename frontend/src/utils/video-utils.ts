/**
 * Video streamability validation and buffer percentage calculation utilities.
 */

/**
 * Validates whether a given URL is a streamable media link.
 * Performs format validation and attempts a lightweight fetch when possible.
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

	// Attempt a lightweight fetch check (handling CORS gracefully)
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3000);

		const response = await fetch(url, {
			method: "HEAD",
			signal: controller.signal,
		}).catch(() => {
			return fetch(url, {
				method: "GET",
				headers: { Range: "bytes=0-0" },
				signal: controller.signal,
			});
		});

		clearTimeout(timeoutId);

		if (response.ok) {
			const contentType = response.headers.get("content-type");
			if (contentType) {
				const isMedia =
					contentType.startsWith("video/") ||
					contentType.includes("application/x-mpegurl") ||
					contentType.includes("application/dash+xml") ||
					contentType.startsWith("audio/") ||
					contentType.includes("octet-stream");

				if (!isMedia && contentType.includes("text/html")) {
					return {
						ok: false,
						error: "URL points to a web page (text/html) instead of a direct media stream",
					};
				}
			}
		}
	} catch {
		// Fetch failed (likely due to CORS or timeout).
		// Browsers' native <video> elements can bypass CORS blocks when playing media.
		// As such, we soft-pass valid HTTP/HTTPS URLs even if client-side JS fetches fail.
		return { ok: true };
	}

	return { ok: true };
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
