import { useEffect, useState } from "react";
import { type Theme, ThemeProviderContext } from "@/lib/theme-context";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
};

function ThemeProvider({
	children,
	defaultTheme = "light",
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem("theme") as Theme) || defaultTheme,
	);

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	const value = {
		theme,
		setTheme,
	};

	return (
		<ThemeProviderContext.Provider value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export default ThemeProvider;
