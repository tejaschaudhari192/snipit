export interface FontItem {
	name: string;
	value: string;
	googleFontFamily?: string;
}

export const FONTS: FontItem[] = [
	{ name: "Default", value: "" },
	{
		name: "Inter",
		value: "Inter, sans-serif",
		googleFontFamily: "Inter:wght@400;500;600;700",
	},
	{
		name: "Roboto",
		value: "Roboto, sans-serif",
		googleFontFamily: "Roboto:wght@400;500;700",
	},
	{
		name: "Poppins",
		value: "Poppins, sans-serif",
		googleFontFamily: "Poppins:wght@400;500;600;700",
	},
	{
		name: "Outfit",
		value: "Outfit, sans-serif",
		googleFontFamily: "Outfit:wght@400;500;600;700",
	},
	{
		name: "Playfair Display",
		value: "'Playfair Display', serif",
		googleFontFamily: "Playfair+Display:ital,wght@0,400;0,700;1,400",
	},
	{
		name: "Merriweather",
		value: "Merriweather, serif",
		googleFontFamily: "Merriweather:ital,wght@0,400;0,700;1,400",
	},
	{
		name: "JetBrains Mono",
		value: "'JetBrains Mono', monospace",
		googleFontFamily: "JetBrains+Mono:wght@400;500;700",
	},
	{
		name: "Fira Code",
		value: "'Fira Code', monospace",
		googleFontFamily: "Fira+Code:wght@400;500;700",
	},
	{
		name: "Caveat (Handwriting)",
		value: "'Caveat', cursive",
		googleFontFamily: "Caveat:wght@400;700",
	},
	{
		name: "Dancing Script",
		value: "'Dancing Script', cursive",
		googleFontFamily: "Dancing+Script:wght@400;700",
	},
	{ name: "Comic Sans", value: "'Comic Sans MS', 'Comic Sans', cursive" },
	{ name: "Georgia", value: "Georgia, serif" },
	{ name: "Arial", value: "Arial, sans-serif" },
	{ name: "Times New Roman", value: "'Times New Roman', serif" },
	{ name: "Courier New", value: "'Courier New', monospace" },
];

const loadedFonts = new Set<string>();

/**
 * Dynamically loads a web font stylesheet only when demanded by the user
 */
export function loadFontOnDemand(fontValue: string): void {
	if (!fontValue) return;
	const font = FONTS.find(
		(f) =>
			f.value === fontValue ||
			(fontValue !== "" && f.value.startsWith(fontValue)),
	);
	if (
		!font ||
		!font.googleFontFamily ||
		loadedFonts.has(font.googleFontFamily)
	) {
		return;
	}

	const linkId = `font-${font.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
	if (typeof document !== "undefined") {
		if (document.getElementById(linkId)) {
			loadedFonts.add(font.googleFontFamily);
			return;
		}

		const link = document.createElement("link");
		link.id = linkId;
		link.rel = "stylesheet";
		link.href = `https://fonts.googleapis.com/css2?family=${font.googleFontFamily}&display=swap`;
		document.head.appendChild(link);
		loadedFonts.add(font.googleFontFamily);
	}
}

/**
 * Scans document content and only loads fonts that are actually present in the document
 */
export function scanAndLoadFontsFromContent(htmlContent: string): void {
	if (!htmlContent || typeof htmlContent !== "string") return;
	for (const font of FONTS) {
		if (
			font.googleFontFamily &&
			(htmlContent.includes(font.name) ||
				(font.value && htmlContent.includes(font.value)))
		) {
			loadFontOnDemand(font.value);
		}
	}
}
