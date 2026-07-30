// Utility to get favicon URL for a domain
// Uses Google's S2 favicon service with fallback
export function getFaviconUrl(urlStr?: string | null, size = 64): string | null {
	if (!urlStr) return null;
	try {
		const url = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
		return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=${size}`;
	} catch {
		return null;
	}
}
