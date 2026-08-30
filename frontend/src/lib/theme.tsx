import { useEffect, useState } from "react";
import { type Theme, ThemeProviderContext } from "@/lib/theme-context";
import { localStore } from "@/utils/storage";
import { CONFIG } from "@/configurations";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
};

function ThemeProvider({
	children,
	defaultTheme = "system",
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(
		() =>
			(localStore.getItem(CONFIG.storageKeys.theme) as Theme) ||
			defaultTheme,
	);

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove("light", "dark");
		root.classList.add(theme);
		localStore.setItem(CONFIG.storageKeys.theme, theme);
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
