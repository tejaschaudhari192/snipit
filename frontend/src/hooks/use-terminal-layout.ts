import { useState, useEffect } from "react";
import { CONFIG } from "@/configurations";

export const useTerminalLayout = () => {
	const [terminalPosition, setTerminalPosition] = useState<
		"bottom" | "right"
	>(() => {
		const saved = localStorage.getItem(
			CONFIG.storageKeys.terminalPosition,
		);
		return saved === "right" ? "right" : "bottom";
	});

	useEffect(() => {
		localStorage.setItem(
			CONFIG.storageKeys.terminalPosition,
			terminalPosition,
		);
	}, [terminalPosition]);

	return { terminalPosition, setTerminalPosition };
};
