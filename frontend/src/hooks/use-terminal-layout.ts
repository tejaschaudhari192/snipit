import { localStore } from "@/utils/storage";
import { useState, useEffect } from "react";
import { CONFIG } from "@/configurations";

export const useTerminalLayout = () => {
	const [terminalPosition, setTerminalPosition] = useState<
		"bottom" | "right"
	>(() => {
		const saved = localStore.getItem(CONFIG.storageKeys.terminalPosition);
		return saved === "right" ? "right" : "bottom";
	});

	useEffect(() => {
		localStore.setItem(
			CONFIG.storageKeys.terminalPosition,
			terminalPosition,
		);
	}, [terminalPosition]);

	return { terminalPosition, setTerminalPosition };
};
