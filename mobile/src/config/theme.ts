export const themeVars = {
	dark: {
		bg: "#09090b",
		bgSecondary: "#18181b",
		bgTertiary: "#27272a",
		text: "#fafafa",
		textSecondary: "#a1a1aa",
		textMuted: "#71717a",
		border: "#27272a",
		blue: "#fafafa",
		orange: "#fafafa",
		green: "#fafafa",
		purple: "#fafafa",
		pink: "#fafafa",
		cyan: "#fafafa",
		red: "#ef4444",
		yellow: "#fafafa",
		indigo: "#fafafa",
	},
	light: {
		bg: "#ffffff",
		bgSecondary: "#f4f4f5",
		bgTertiary: "#e4e4e7",
		text: "#09090b",
		textSecondary: "#71717a",
		textMuted: "#a1a1aa",
		border: "#e4e4e7",
		blue: "#09090b",
		orange: "#09090b",
		green: "#09090b",
		purple: "#09090b",
		pink: "#09090b",
		cyan: "#09090b",
		red: "#ef4444",
		yellow: "#09090b",
		indigo: "#09090b",
	},
};

export interface ThemeColors {
	bg: string;
	bgSecondary: string;
	bgTertiary: string;
	text: string;
	textSecondary: string;
	textMuted: string;
	border: string;
	blue: string;
	orange: string;
	green: string;
	purple: string;
	pink: string;
	cyan: string;
	red: string;
	yellow: string;
	indigo: string;
}

export function useThemeVars(theme: "dark" | "light" = "dark"): ThemeColors {
	return themeVars[theme] || themeVars.dark;
}
