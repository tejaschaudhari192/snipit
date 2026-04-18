import { useState, useEffect } from "react";
import { CONFIG } from "@/configurations";

export const useTerminalLayout = () => {
	const [terminalPosition, setTerminalPosition] = useState<
		"bottom" | "right"
	>(() => {
		const saved = localStorage.getItem(
			CONFIG.STORAGE_KEYS.TERMINAL_POSITION,
		);
		return saved === "right" ? "right" : "bottom";
	});

	useEffect(() => {
		localStorage.setItem(
			CONFIG.STORAGE_KEYS.TERMINAL_POSITION,
			terminalPosition,
		);
	}, [terminalPosition]);

	return { terminalPosition, setTerminalPosition };
};
