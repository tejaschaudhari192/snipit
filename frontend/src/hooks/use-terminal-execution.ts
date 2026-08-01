import { useState, useEffect, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { CONFIG } from "@/configurations";
import { useTerminalLayout } from "@/hooks/use-terminal-layout";

interface UseTerminalExecutionProps {
	textValue: string;
	language: string;
}

export const useTerminalExecution = ({
	textValue,
	language,
}: UseTerminalExecutionProps) => {
	const [isTerminalOpen, setIsTerminalOpen] = useState(false);
	const [socket, setSocket] = useState<Socket | null>(null);
	const { terminalPosition, setTerminalPosition } = useTerminalLayout();

	useEffect(() => {
		const socketUrl = CONFIG.apiBaseUrl
			? CONFIG.apiBaseUrl.replace(/\/api(\/v\d+)?\/?$/, "")
			: "";
		const s = io(socketUrl, { withCredentials: true });
		setSocket(s);

		return () => {
			s.disconnect();
			setSocket(null);
		};
	}, []);

	const toggleTerminal = useCallback(() => {
		const opening = !isTerminalOpen;
		setIsTerminalOpen(opening);
		if (opening && socket && textValue) {
			socket.emit("run-code", {
				code: textValue,
				language,
			});
		}
	}, [isTerminalOpen, socket, textValue, language]);

	return {
		isTerminalOpen,
		setIsTerminalOpen,
		socket,
		terminalPosition,
		setTerminalPosition,
		toggleTerminal,
	};
};
