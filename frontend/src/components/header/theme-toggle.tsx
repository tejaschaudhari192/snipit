"use client";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggleButton } from "@/components/ui/shadcn-io/theme-toggle-button";
import { useThemeTransition } from "@/hooks/use-theme-transition";
const ThemeTogglePositionsDemo = () => {
	const { theme, setTheme } = useTheme();
	const { startTransition } = useThemeTransition();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	const handleThemeToggle = useCallback(
		(e: React.MouseEvent) => {
			const newTheme = theme === "dark" ? "light" : "dark";
			startTransition(() => {
				setTheme(newTheme);
			}, e);
		},
		[theme, setTheme, startTransition],
	);
	const currentTheme = theme;
	if (!mounted) {
		return null;
	}
	return (
		<ThemeToggleButton theme={currentTheme} onClick={handleThemeToggle} />
	);
};
export default ThemeTogglePositionsDemo;
