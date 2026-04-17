import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { X, Play, Square } from "lucide-react";
import type { Socket } from "socket.io-client";

interface TerminalPanelProps {
	onClose: () => void;
	code: string;
	language: string;
	socket: Socket | null;
}

export const TerminalPanel = ({
	onClose,
	code,
	language,
	socket,
}: TerminalPanelProps) => {
	const terminalRef = useRef<HTMLDivElement>(null);
	const termInstance = useRef<Terminal | null>(null);
	const fitAddon = useRef<FitAddon | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const isRunningRef = useRef(isRunning);
	const socketRef = useRef(socket);

	useEffect(() => {
		isRunningRef.current = isRunning;
	}, [isRunning]);

	useEffect(() => {
		socketRef.current = socket;
	}, [socket]);

	useEffect(() => {
		if (!terminalRef.current) return;

		const term = new Terminal({
			theme: {
				background: "#000000",
				foreground: "#ffffff",
				cursor: "#bbbbbb",
				cursorAccent: "#000000",
				selectionBackground: "rgba(255, 255, 255, 0.3)",
				black: "#000000",
				red: "#ff5c57",
				green: "#5af78e",
				yellow: "#f3f99d",
				blue: "#57c7ff",
				magenta: "#ff6ac1",
				cyan: "#9aedfe",
				white: "#f1f1f1",
				brightBlack: "#686868",
				brightRed: "#ff5c57",
				brightGreen: "#5af78e",
				brightYellow: "#f3f99d",
				brightBlue: "#57c7ff",
				brightMagenta: "#ff6ac1",
				brightCyan: "#9aedfe",
				brightWhite: "#f1f1f1",
			},
			fontFamily:
				'"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, Monaco, "Courier New", monospace',
			fontSize: 13,
			fontWeight: "400",
			letterSpacing: 0.5,
			lineHeight: 1.4,
			cursorBlink: true,
			cursorStyle: "block",
			rows: 10,
			allowTransparency: true,
		});

		const fit = new FitAddon();
		term.loadAddon(fit);
		term.open(terminalRef.current);
		fit.fit();

		termInstance.current = term;
		fitAddon.current = fit;

		term.onData((data: string) => {
			if (socketRef.current && isRunningRef.current) {
				socketRef.current.emit("code-input", data);
			}
		});

		const handleResize = () => {
			setTimeout(() => {
				if (fitAddon.current) fitAddon.current.fit();
			}, 100);
		};
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			term.dispose();
		};
	}, []); // Only create once

	useEffect(() => {
		if (!socket) return;

		const handleOutput = (data: { output: string }) => {
			if (termInstance.current) {
				// Convert newlines to CRLF for xterm
				const output = data.output
					.replace(/\n/g, "\r\n")
					.replace(/\r\r\n/g, "\r\n");
				termInstance.current.write(output);
			}
		};

		const handleStatus = (data: { status: string }) => {
			if (data.status === "running") {
				setIsRunning(true);
				// Multiple focus attempts to ensure it grabs attention
				setTimeout(() => termInstance.current?.focus(), 50);
				setTimeout(() => termInstance.current?.focus(), 250);
				setTimeout(() => termInstance.current?.focus(), 500);
			} else {
				setIsRunning(false);
			}
		};

		socket.on("code-output", handleOutput);
		socket.on("code-status", handleStatus);

		return () => {
			socket.off("code-output", handleOutput);
			socket.off("code-status", handleStatus);
		};
	}, [socket]);

	const handleRun = () => {
		if (!socket) return;
		setIsRunning(true);
		if (termInstance.current) {
			termInstance.current.clear();
		}
		socket.emit("run-code", { code, language });
	};

	const handleStop = () => {
		if (!socket) return;
		socket.emit("stop-code");
		setIsRunning(false);
	};

	// Start run initially on mount if conditions are met
	useEffect(() => {
		if (socket && code && language && !isRunning) {
			// Small delay to ensure everything is mounted
			const timer = setTimeout(() => {
				handleRun();
			}, 300);
			return () => clearTimeout(timer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	return (
		<div className="flex flex-col h-72 border border-white/5 bg-black/95 backdrop-blur-xl shadow-2xl rounded-lg overflow-hidden my-2 mx-1 animate-in slide-in-from-bottom-4 duration-300">
			<div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5 select-none">
				<div className="flex items-center gap-6">
					{/* Mac-style Window Controls */}
					<div className="flex gap-1.5 mr-2">
						<div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
						<div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
						<div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
					</div>

					<div className="flex items-center gap-3">
						<span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
							{language} — Terminal
						</span>

						<div className="h-3 w-[1px] bg-white/10 mx-1" />

						{isRunning ? (
							<button
								onClick={handleStop}
								className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider"
							>
								<Square className="h-3 w-3 fill-current" /> Stop
							</button>
						) : (
							<button
								onClick={handleRun}
								className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
							>
								<Play className="h-3 w-3 fill-current" /> Run
								Code
							</button>
						)}
					</div>
				</div>

				<button
					onClick={onClose}
					className="p-1 hover:bg-white/10 rounded-md transition-all text-white/40 hover:text-white"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
			<div
				ref={terminalRef}
				className="flex-1 p-3 overflow-hidden cursor-text selection:bg-white/20"
				onClick={() => {
					termInstance.current?.focus();
				}}
			/>
		</div>
	);
};
