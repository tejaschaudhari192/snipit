// Utility to get favicon URL for a domain
// Uses unavatar.io service which supports 404 fallbacks
export function getFaviconUrl(urlStr?: string | null): string | null {
	if (!urlStr) return null;
	try {
		const url = new URL(
			urlStr.startsWith("http") ? urlStr : `https://${urlStr}`,
		);
		// fallback=false ensures that it returns a 404 if no image is found,
		// which will properly trigger the <img onError> and show our custom initials!
		return `https://unavatar.io/${url.hostname}?fallback=false`;
	} catch {
		return null;
	}
}
