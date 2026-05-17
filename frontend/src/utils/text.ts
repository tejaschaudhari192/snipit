/**
 * Robust HTML entity decoding for clean display text.
 * Handles &amp;, &quot;, &#39;, and thousands of others by using a temporary DOM element.
 */
export const decodeHtml = (html: string): string => {
	if (!html) return "";
	if (typeof document === "undefined") return html; // SSR safety

	const txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
};
