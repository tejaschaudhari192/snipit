/**
 * Robust HTML entity decoding for clean display text.
 * Handles &amp;, &quot;, &#39;, and thousands of others by using a temporary DOM element.
 */
export const decodeHtml = (html?: string | null): string => {
	if (!html) return "";
	if (typeof document === "undefined") return html; // SSR safety

	const txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
};

/**
 * Strips HTML tags and non-breaking space entities from a string.
 */
export const stripHtml = (html?: string | null): string => {
	if (!html) return "";
	return html
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
		.trim();
};
