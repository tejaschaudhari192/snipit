import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getLanguageConfig } from "./language-config.js";

export interface ExecutionSession {
	process: ChildProcess;
	inputBuffer: string;
	executionDirPath: string;
	timeoutTimer?: NodeJS.Timeout;
}

export class ProcessManager {
	private sessions = new Map<string, ExecutionSession>();
	private baseDirPath = path.join(process.cwd(), "temp_codes");
	private defaultTimeoutMs: number;

	constructor(timeoutMs = 15000) {
		this.defaultTimeoutMs = timeoutMs;
		if (!fs.existsSync(this.baseDirPath)) {
			fs.mkdirSync(this.baseDirPath, { recursive: true });
		}
	}

	startExecution(
		sessionId: string,
		code: string,
		language: string,
		callbacks: {
			onOutput: (output: string) => void;
			onStatus: (status: string, details?: Record<string, unknown>) => void;
		},
	): boolean {
		this.stopExecution(sessionId);

		const normalizedCode = code.replace(/\uFEFF/g, "").replace(/\r/g, "");
		const tempId = crypto.randomUUID();
		const config = getLanguageConfig(language, normalizedCode, tempId);

		if (!config) {
			callbacks.onOutput(`[Error] Unsupported language for execution: ${language}\r\n`);
			callbacks.onStatus("stopped", { error: "Unsupported language" });
			return false;
		}

		const executionDirPath = path.join(this.baseDirPath, tempId);
		const filePath = path.join(executionDirPath, config.fileName);

		try {
			fs.mkdirSync(executionDirPath, { recursive: true });
			fs.writeFileSync(filePath, normalizedCode, "utf8");
			if (config.extraFiles && config.extraFiles.length > 0) {
				for (const extra of config.extraFiles) {
					fs.writeFileSync(path.join(executionDirPath, extra.name), extra.content, "utf8");
				}
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			callbacks.onOutput(`[Error] Failed to initialize execution directory: ${msg}\r\n`);
			callbacks.onStatus("stopped", { error: msg });
			return false;
		}

		callbacks.onStatus("running");

		const spinnerFrames = ["/", "-", " \\", "|"].map((f) => f.trim());
		let frameIndex = 0;
		const spinnerInterval = setInterval(() => {
			callbacks.onOutput(`\r\u001b[2KRunning your code... ${spinnerFrames[frameIndex]}`);
			frameIndex = (frameIndex + 1) % spinnerFrames.length;
		}, 100);

		let hasReceivedOutput = false;
		const clearSpinner = () => {
			if (!hasReceivedOutput) {
				hasReceivedOutput = true;
				clearInterval(spinnerInterval);
				callbacks.onOutput("\r\u001b[2K");
			}
		};

		// Helper to spawn and manage the actual program process
		const spawnProgram = () => {
			const executable =
				config.runCmd.startsWith("./") || config.runCmd.endsWith(".exe")
					? path.resolve(executionDirPath, config.runCmd)
					: config.runCmd;

			const proc = spawn(executable, config.runArgs, {
				cwd: executionDirPath,
				shell: true,
			});

			proc.stdout?.on("data", (data) => {
				clearSpinner();
				callbacks.onOutput(data.toString());
			});

			proc.stderr?.on("data", (data) => {
				clearSpinner();
				callbacks.onOutput(data.toString());
			});

			const timeoutTimer = setTimeout(() => {
				clearSpinner();
				callbacks.onOutput(`\r\n[Execution Timeout] Program exceeded ${this.defaultTimeoutMs / 1000}s limit.\r\n`);
				this.stopExecution(sessionId);
			}, this.defaultTimeoutMs);

			proc.on("close", (code) => {
				clearInterval(spinnerInterval);
				clearTimeout(timeoutTimer);
				callbacks.onOutput(`\r\nProcess finished with exit code ${code}\r\n`);
				callbacks.onStatus("stopped", { exitCode: code });
				this.cleanupSession(sessionId, executionDirPath);
			});

			proc.on("error", (error: Error) => {
				clearInterval(spinnerInterval);
				clearTimeout(timeoutTimer);
				callbacks.onOutput(`\r\n[Error] Process error: ${error.message}\r\n`);
				callbacks.onStatus("stopped", { error: error.message });
				this.cleanupSession(sessionId, executionDirPath);
			});

			this.sessions.set(sessionId, {
				process: proc,
				inputBuffer: "",
				executionDirPath,
				timeoutTimer,
			});
		};

		// If language requires compilation first (Java, C, C++, Rust)
		if (config.compileCmd) {
			const compileProc = spawn(config.compileCmd, config.compileArgs || [], {
				cwd: executionDirPath,
				shell: process.platform === "win32",
			});

			let compileErrors = "";
			compileProc.stderr?.on("data", (data) => {
				compileErrors += data.toString();
			});
			compileProc.stdout?.on("data", (data) => {
				compileErrors += data.toString();
			});

			compileProc.on("close", (code) => {
				if (code !== 0) {
					clearInterval(spinnerInterval);
					callbacks.onOutput(`\r\u001b[2K[Compilation Error]\r\n${compileErrors || `Compiler exited with code ${code}`}\r\n`);
					callbacks.onStatus("stopped", { exitCode: code, error: "Compilation failed" });
					this.cleanupSession(sessionId, executionDirPath);
					return;
				}
				// Compilation succeeded; launch the runnable program directly
				spawnProgram();
			});

			compileProc.on("error", (err) => {
				clearInterval(spinnerInterval);
				callbacks.onOutput(`\r\u001b[2K[Compilation Failed] ${err.message}\r\n`);
				callbacks.onStatus("stopped", { error: err.message });
				this.cleanupSession(sessionId, executionDirPath);
			});
		} else {
			// Direct interpreted language (Python, Node, Go, PHP, etc.)
			spawnProgram();
		}

		return true;
	}

	sendInput(sessionId: string, data: string, onEcho: (echo: string) => void): void {
		const session = this.sessions.get(sessionId);
		if (!session || !session.process.stdin || !session.process.stdin.writable) return;

		// Refresh execution timeout when user enters data
		if (session.timeoutTimer) {
			session.timeoutTimer.refresh();
		}

		if (data === "\r") {
			session.process.stdin.write(session.inputBuffer + "\n");
			session.inputBuffer = "";
			onEcho("\r\n");
		} else if (data === "\u007f" || data === "\b") {
			if (session.inputBuffer.length > 0) {
				session.inputBuffer = session.inputBuffer.slice(0, -1);
				onEcho("\b \b");
			}
		} else {
			session.inputBuffer += data;
			onEcho(data);
		}
	}

	stopExecution(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		if (session.timeoutTimer) clearTimeout(session.timeoutTimer);
		try {
			session.process.kill();
		} catch {
			// ignore kill error
		}
		this.cleanupSession(sessionId, session.executionDirPath);
	}

	private cleanupSession(sessionId: string, executionDirPath: string): void {
		this.sessions.delete(sessionId);
		try {
			if (fs.existsSync(executionDirPath)) {
				fs.rmSync(executionDirPath, { recursive: true, force: true });
			}
		} catch {
			// ignore cleanup error
		}
	}
}
