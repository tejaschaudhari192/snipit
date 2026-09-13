"use client";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggleButton } from "@/components/ui/shadcn-io/theme-toggle-button";
import { useThemeTransition } from "@/hooks/use-theme-transition";
const ThemeTogglePositionsDemo = () => {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const { startTransition } = useThemeTransition();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	const handleThemeToggle = useCallback(
		(e: React.MouseEvent) => {
			const isDark = document.documentElement.classList.contains("dark");
			const newTheme = isDark ? "light" : "dark";
			startTransition(() => {
				setTheme(newTheme);
			}, e);
		},
		[setTheme, startTransition],
	);
	const currentTheme =
		theme === "system"
			? resolvedTheme ||
				(typeof window !== "undefined" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light")
			: theme;
	if (!mounted) {
		return null;
	}
	return (
		<ThemeToggleButton theme={currentTheme} onClick={handleThemeToggle} />
	);
};
export default ThemeTogglePositionsDemo;
