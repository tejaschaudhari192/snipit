import { useEffect, useState } from "react";
import { type Theme, ThemeProviderContext } from "@/lib/theme-context";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
};

function ThemeProvider({
	children,
	defaultTheme = "system",
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme);
	const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() => {
		if (typeof window !== "undefined") {
			return window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}
		return "light";
	});

	useEffect(() => {
		const root = window.document.documentElement;

		const updateTheme = (currentTheme: Theme) => {
			let isDark = false;
			if (currentTheme === "system") {
				isDark = window.matchMedia(
					"(prefers-color-scheme: dark)",
				).matches;
			} else {
				isDark = currentTheme === "dark";
			}
			const effective = isDark ? "dark" : "light";
			root.classList.remove("light", "dark");
			root.classList.add(effective);
			setResolvedTheme(effective);
		};

		updateTheme(theme);

		if (theme === "system") {
			const mediaQuery = window.matchMedia(
				"(prefers-color-scheme: dark)",
			);
			const handleSystemChange = (e: MediaQueryListEvent) => {
				const effective = e.matches ? "dark" : "light";
				root.classList.remove("light", "dark");
				root.classList.add(effective);
				setResolvedTheme(effective);
			};
			mediaQuery.addEventListener("change", handleSystemChange);
			return () =>
				mediaQuery.removeEventListener("change", handleSystemChange);
		}
	}, [theme]);

	const value = {
		theme,
		resolvedTheme,
		setTheme,
	};

	return (
		<ThemeProviderContext.Provider value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export default ThemeProvider;
