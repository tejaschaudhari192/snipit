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
