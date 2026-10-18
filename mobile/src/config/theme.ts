export const themeVars = {
	dark: {
		bg: "#000000",
		bgSecondary: "#1c1c1e",
		bgTertiary: "#2c2c2e",
		text: "#ffffff",
		textSecondary: "#8e8e93",
		textMuted: "#636366",
		border: "rgba(84, 84, 88, 0.35)",
		blue: "#0a84ff",
		orange: "#ff9f0a",
		green: "#30d158",
		purple: "#bf5af2",
		pink: "#ff375f",
		cyan: "#64d2ff",
		red: "#ff453a",
		yellow: "#ffd60a",
		indigo: "#5e5ce6",
	},
	light: {
		bg: "#f2f2f7",
		bgSecondary: "#ffffff",
		bgTertiary: "#e5e5ea",
		text: "#000000",
		textSecondary: "#8e8e93",
		textMuted: "#aeaeb2",
		border: "rgba(60, 60, 67, 0.18)",
		blue: "#007aff",
		orange: "#ff9500",
		green: "#34c759",
		purple: "#af52de",
		pink: "#ff2d55",
		cyan: "#32ade6",
		red: "#ff3b30",
		yellow: "#ffcc00",
		indigo: "#5856d6",
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
