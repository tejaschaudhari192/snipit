import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import type { Socket } from "socket.io-client";

import { TerminalHeader } from "@/components/terminal/terminal-header";

interface TerminalPanelProps {
	onClose: () => void;
	code: string;
	language: string;
	fontSize: number;
	socket: Socket | null;
	position: "bottom" | "right";
	onPositionChange: (pos: "bottom" | "right") => void;
}

export const TerminalPanel = ({
	onClose,
	code,
	language,
	fontSize,
	socket,
	position,
	onPositionChange,
}: TerminalPanelProps) => {
	const terminalRef = useRef<HTMLDivElement>(null);
	const termInstance = useRef<Terminal | null>(null);
	const fitAddon = useRef<FitAddon | null>(null);
	const [isRunning, setIsRunning] = useState(false);

	// ── Initialise Xterm once ──────────────────────────────────────────────
	useEffect(() => {
		if (!terminalRef.current) return;

		const term = new Terminal({
			theme: {
				background: "#1c2833",
				foreground: "#f8f8f2",
				cursor: "#f1c40f",
				cursorAccent: "#1c2833",
				selectionBackground: "rgba(40, 58, 75, 0.8)",
				black: "#000000",
				red: "#ff5555",
				green: "#50fa7b",
				yellow: "#f1ce64",
				blue: "#89b4fa",
				magenta: "#fab387",
				cyan: "#8be9fd",
				white: "#bfbfbf",
			},
			fontFamily: '"JetBrains Mono", "Fira Code", monospace',
			fontSize: fontSize, // Use prop for initial value
			cursorStyle: "block",
			cursorBlink: true,
			convertEol: true,
			rows: 15,
			allowTransparency: false,
		});

		const fit = new FitAddon();
		term.loadAddon(fit);
		term.open(terminalRef.current);
		fit.fit();
		term.focus();

		termInstance.current = term;
		fitAddon.current = fit;

		return () => {
			term.dispose();
		};
	}, [fontSize]); // Re-initializing on fontSize change is expensive, better use useEffect below

	// ── Sync font size ────────────────────────────────────────────────────
	useEffect(() => {
		if (termInstance.current) {
			termInstance.current.options.fontSize = fontSize;
			// Small delay to ensure xterm has updated before re-fitting
			setTimeout(() => {
				fitAddon.current?.fit();
			}, 10);
		}
	}, [fontSize]);

	// Forward keyboard data to backend via socket (always, no isRunning gate)
	// Re-register whenever socket changes so we always have the live instance.
	useEffect(() => {
		const term = termInstance.current;
		if (!term || !socket) return;

		const disposable = term.onData((data: string) => {
			socket.emit("code-input", data);
		});

		return () => {
			disposable.dispose();
		};
	}, [socket]);

	// ── Fit on position / resize ───────────────────────────────────────────
	useEffect(() => {
		if (!terminalRef.current) return;

		const resizeObserver = new ResizeObserver(() => {
			fitAddon.current?.fit();
		});

		resizeObserver.observe(terminalRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, [position]);

	// ── Run / Stop helpers ─────────────────────────────────────────────────
	const handleRun = useCallback(() => {
		if (!socket || isRunning) return;
		termInstance.current?.clear();
		socket.emit("run-code", { code, language });
		setIsRunning(true);
		// Ensure focus so typing is captured immediately
		setTimeout(() => termInstance.current?.focus(), 50);
	}, [socket, isRunning, code, language]);

	const handleStop = useCallback(() => {
		if (!socket) return;
		socket.emit("stop-code");
		setIsRunning(false);
	}, [socket]);

	// ── Listen for output + status ─────────────────────────────────────────
	useEffect(() => {
		if (!socket) return;

		const onOutput = (data: { output: string }) => {
			termInstance.current?.write(data.output);
		};
		const onStatus = (data: { status: string }) => {
			if (data.status === "running") setIsRunning(true);
			if (data.status === "stopped") setIsRunning(false);
		};

		socket.on("code-output", onOutput);
		socket.on("code-status", onStatus);

		return () => {
			socket.off("code-output", onOutput);
			socket.off("code-status", onStatus);
		};
	}, [socket]);

	// ── Render ─────────────────────────────────────────────────────────────
	return (
		<div className="flex flex-col h-full border border-white/10 bg-[#1c2833] w-full">
			<TerminalHeader
				language={language}
				isRunning={isRunning}
				onRun={handleRun}
				onStop={handleStop}
				onClose={onClose}
				position={position}
				onPositionChange={onPositionChange}
			/>
			<div
				ref={terminalRef}
				className="flex-1 p-3 overflow-hidden cursor-text custom-scrollbar bg-[#1c2833]"
				onClick={() => termInstance.current?.focus()}
			/>
		</div>
	);
};
