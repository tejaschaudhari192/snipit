import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import configurations, {
	ADJECTIVES,
	ANIMALS,
	COLLABORATOR_COLORS,
} from "@/config/configurations.js";
import type { ActiveUser } from "@/types/index.js";
import PasteService from "@/services/paste.service.js";
import UserModel from "@/models/User.js";
import {
	getUserIdFromToken,
	extractTokenFromRequest,
} from "@/lib/auth.utils.js";
import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const pasteService = new PasteService();
const activeUsers = new Map<string, ActiveUser & { pasteId: string }>();

// Helpers
const getSocketUserId = (socket: Socket): string | null => {
	const req = socket.request;
	const token = extractTokenFromRequest(req as any);
	return token ? getUserIdFromToken(token) : null;
};

const canUserEdit = async (
	pasteId: string,
	userId: string | null,
): Promise<boolean> => {
	const paste = await pasteService.getPasteById(pasteId);
	if (!paste) return false;

	let userEmail = null;
	if (userId) {
		const user = await UserModel.findById(userId);
		if (user) userEmail = user.email;
	}

	const isOwner = paste.owner && userId && paste.owner.toString() === userId;
	const isAnonymousOwner = !paste.owner;

	if (isOwner || isAnonymousOwner) return true;

	if (paste.shareList && userEmail) {
		const shareEntry = (paste.shareList as any).find(
			(s: any) => s.email === userEmail,
		);
		if (
			shareEntry &&
			(shareEntry.role === "editor" || shareEntry.role === "admin")
		)
			return true;
	}

	if (
		paste.allowedUsers &&
		userEmail &&
		paste.allowedUsers.includes(userEmail)
	)
		return true;
	if (paste.editPermission === "public") return true;

	return false;
};

const canUserView = async (
	pasteId: string,
	userId: string | null,
): Promise<boolean> => {
	const paste = await pasteService.getPasteById(pasteId);
	if (!paste) return false;
	if (paste.visibility === "public") return true;

	let userEmail = null;
	if (userId) {
		const user = await UserModel.findById(userId);
		if (user) userEmail = user.email;
	}

	const isOwner = paste.owner && userId && paste.owner.toString() === userId;
	const isAllowed =
		paste.allowedUsers &&
		userEmail &&
		paste.allowedUsers.includes(userEmail);

	let hasShareListAccess = false;
	if (paste.shareList && userEmail) {
		const shareEntry = (paste.shareList as any).find(
			(s: any) => s.email === userEmail,
		);
		if (shareEntry) hasShareListAccess = true;
	}

	return !!(isOwner || isAllowed || hasShareListAccess);
};

export const setupSocket = (server: HTTPServer) => {
	const io = new SocketIOServer(server, {
		cors: {
			origin: configurations.cors.origins,
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		},
	});

	const runningProcesses = new Map<string, ChildProcess>();
	const inputBuffers = new Map<string, string>();

	io.on("connection", (socket) => {
		const userColor =
			COLLABORATOR_COLORS[
				Math.floor(Math.random() * COLLABORATOR_COLORS.length)
			] || "#ef4444";
		const userName = `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)] || "Anonymous"} ${ANIMALS[Math.floor(Math.random() * ANIMALS.length)] || "Panda"}`;

		activeUsers.set(socket.id, {
			socketId: socket.id,
			name: userName,
			color: userColor,
			isEditing: false,
			pasteId: "",
		});

		const broadcastRoomUsers = (pasteId: string) => {
			const roomUsers = Array.from(activeUsers.values()).filter(
				(u) => u.pasteId === pasteId,
			);
			io.to(pasteId).emit("room-users", roomUsers);
		};

		socket.on("join-paste", async ({ pasteId, userName }) => {
			const userId = getSocketUserId(socket);
			const allowed = await canUserView(pasteId, userId);

			if (!allowed) {
				socket.emit("error", {
					message: "Access denied or paste not found",
				});
				return;
			}

			const user = activeUsers.get(socket.id);
			if (user) {
				user.pasteId = pasteId;
				user.isEditing = false;
				if (userName) user.name = userName;
				socket.join(pasteId);
				broadcastRoomUsers(pasteId);
			}
		});

		socket.on("set-editing-status", async ({ pasteId, isEditing }) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== pasteId) return;

			const userId = getSocketUserId(socket);
			const allowed = await canUserEdit(pasteId, userId);

			if (!allowed) {
				socket.emit("error", { message: "Editing not permitted" });
				return;
			}

			user.isEditing = isEditing;
			broadcastRoomUsers(pasteId);
		});

		socket.on("leave-paste", (pasteId) => {
			const user = activeUsers.get(socket.id);
			if (user && user.pasteId === pasteId) {
				user.pasteId = "";
				user.isEditing = false;
				socket.leave(pasteId);
				broadcastRoomUsers(pasteId);
			}
		});

		socket.on("edit-paste", async (data) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== data.pasteId) return;

			const userId = getSocketUserId(socket);
			const allowed = await canUserEdit(data.pasteId, userId);

			if (allowed) {
				socket
					.to(data.pasteId)
					.emit("paste-updated", { ...data, socketId: socket.id });
			}
		});

		socket.on("draw-update", async (data) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== data.pasteId) return;

			const userId = getSocketUserId(socket);
			const allowed = await canUserEdit(data.pasteId, userId);

			if (allowed) {
				socket
					.to(data.pasteId)
					.emit("draw-update", { ...data, socketId: socket.id });
			}
		});

		socket.on("cursor-move", async ({ pasteId, position }) => {
			const user = activeUsers.get(socket.id);
			if (!user || user.pasteId !== pasteId) return;

			const userId = getSocketUserId(socket);
			const allowed = await canUserEdit(pasteId, userId);

			if (allowed) {
				socket.to(pasteId).emit("user-cursor-move", {
					socketId: socket.id,
					position,
				});
			}
		});

		socket.on("run-code", async ({ code, language }) => {
			// Normalize line endings to LF and remove BOM to prevent issues on Linux
			const normalizedCode = code
				.replace(/\uFEFF/g, "")
				.replace(/\r/g, "");

			let cmd: string;
			let args: string[] = [];
			let fileExt: string;

			switch (language.toLowerCase()) {
				case "javascript":
					cmd = "node";
					fileExt = ".js";
					break;
				case "python":
					cmd = "python";
					args = ["-u"];
					fileExt = ".py";
					break;
				case "typescript":
					cmd = "npx";
					args = ["tsx"];
					fileExt = ".ts";
					break;
				case "php":
					cmd = "php";
					fileExt = ".php";
					break;
				case "go":
					cmd = "go";
					args = ["run"];
					fileExt = ".go";
					break;
				case "java":
					cmd = "java";
					fileExt = ".java";
					break;
				case "c":
					fileExt = ".c";
					// On Windows use gcc, on deploy will likely have it too
					cmd = "gcc";
					break;
				case "cpp":
					fileExt = ".cpp";
					cmd = "g++";
					break;
				case "rust":
					fileExt = ".rs";
					cmd = "rustc";
					break;
				case "csharp":
					fileExt = ".cs";
					cmd = "dotnet"; // Assumes dotnet-script or similar, but let's try 'dotnet run' in a temp project
					break;
				case "shell":
				case "bash":
					fileExt = process.platform === "win32" ? ".bat" : ".sh";
					cmd = process.platform === "win32" ? "cmd" : "bash";
					if (process.platform === "win32") args = ["/c"];
					break;
				default:
					socket.emit("code-output", {
						output: `[Error] Unsupported language for execution: ${language}\r\n`,
					});
					return;
			}

			const tempId = crypto.randomUUID();
			const baseDirPath = path.join(process.cwd(), "temp_codes");
			const executionDirPath = path.join(baseDirPath, tempId);

			// Map specific file names for languages that care
			let fileName = `${tempId}${fileExt}`;
			if (language.toLowerCase() === "java") {
				const publicClassMatch = normalizedCode.match(
					/public\s+class\s+(\w+)/,
				);
				const mainClassMatch = normalizedCode.match(
					/class\s+(\w+)(?:(?!\bclass\b)[\s\S])*?public\s+static\s+void\s+main/,
				);
				if (publicClassMatch) {
					fileName = `${publicClassMatch[1]}.java`;
				} else if (mainClassMatch) {
					fileName = `${mainClassMatch[1]}.java`;
				} else {
					fileName = "Main.java";
				}
			}
			if (language.toLowerCase() === "csharp") fileName = "Program.cs";

			const filePath = path.join(executionDirPath, fileName);

			try {
				if (!fs.existsSync(baseDirPath)) fs.mkdirSync(baseDirPath);
				if (!fs.existsSync(executionDirPath))
					fs.mkdirSync(executionDirPath);
				fs.writeFileSync(filePath, normalizedCode);
			} catch (err: any) {
				socket.emit("code-output", {
					output: `[Error] Failed to create temp file: ${err.message}\r\n`,
				});
				return;
			}

			// Kill existing process if any for this socket
			const existingProc = runningProcesses.get(socket.id);
			if (existingProc) {
				try {
					existingProc.kill();
				} catch {
					// Ignore kill errors
				}
				runningProcesses.delete(socket.id);
			}

			// For compiled languages, build the command
			let finalCmd = cmd;
			let finalArgs = [...args];

			const isWindows = process.platform === "win32";
			const exeName = isWindows ? "out.exe" : "./out";

			if (
				language.toLowerCase() === "c" ||
				language.toLowerCase() === "cpp"
			) {
				const compiler = language.toLowerCase() === "c" ? "gcc" : "g++";
				finalCmd = `${compiler} ${fileName} -o ${exeName} && ${exeName}`;
				finalArgs = [];
			} else if (language.toLowerCase() === "rust") {
				finalCmd = `rustc ${fileName} -o ${exeName} && ${exeName}`;
				finalArgs = [];
			} else if (language.toLowerCase() === "java") {
				const mainClassMatch = normalizedCode.match(
					/class\s+(\w+)(?:(?!\bclass\b)[\s\S])*?public\s+static\s+void\s+main/,
				);
				const mainClassName = mainClassMatch
					? mainClassMatch[1]
					: fileName.replace(".java", "");
				finalCmd = `javac ${fileName} && java ${mainClassName}`;
				finalArgs = [];
			} else {
				finalArgs.push(fileName);
			}

			const proc = spawn(finalCmd, finalArgs, {
				cwd: executionDirPath,
				shell: true,
			});
			runningProcesses.set(socket.id, proc);
			inputBuffers.set(socket.id, "");

			socket.emit("code-status", { status: "running" });

			const spinnerFrames = ["/", "-", " \\", "|"].map((f) => f.trim());
			let frameIndex = 0;

			const spinnerInterval = setInterval(() => {
				socket.emit("code-output", {
					output: `\r\u001b[2KRunning your code... ${spinnerFrames[frameIndex]}`,
				});
				frameIndex = (frameIndex + 1) % spinnerFrames.length;
			}, 100);

			let hasReceivedOutput = false;

			const clearSpinner = () => {
				if (!hasReceivedOutput) {
					hasReceivedOutput = true;
					clearInterval(spinnerInterval);
					socket.emit("code-output", { output: "\r\u001b[2K" });
				}
			};

			proc.stdout?.on("data", (data) => {
				clearSpinner();
				socket.emit("code-output", { output: data.toString() });
			});

			proc.stderr?.on("data", (data) => {
				clearSpinner();
				socket.emit("code-output", { output: data.toString() });
			});

			proc.on("close", (code) => {
				clearInterval(spinnerInterval);
				socket.emit("code-output", {
					output: `\r\nProcess finished with exit code ${code}\r\n`,
				});
				socket.emit("code-status", {
					status: "stopped",
					exitCode: code,
				});
				runningProcesses.delete(socket.id);
				try {
					// Cleanup the entire execution directory
					fs.rmSync(executionDirPath, {
						recursive: true,
						force: true,
					});
				} catch {
					// Ignore cleanup errors
				}
			});

			proc.on("error", (err) => {
				socket.emit("code-output", {
					output: `\r\n[Error] Process error: ${err.message}\r\n`,
				});
				socket.emit("code-status", {
					status: "stopped",
					error: err.message,
				});
				runningProcesses.delete(socket.id);
				try {
					fs.rmSync(executionDirPath, {
						recursive: true,
						force: true,
					});
				} catch {
					// Ignore cleanup errors
				}
			});
		});

		socket.on("code-input", (data) => {
			const proc = runningProcesses.get(socket.id);
			if (proc && proc.stdin && proc.stdin.writable) {
				const buffer = inputBuffers.get(socket.id) || "";

				if (data === "\r") {
					// Commit line to process
					proc.stdin.write(buffer + "\n");
					inputBuffers.set(socket.id, "");
					socket.emit("code-output", { output: "\r\n" });
				} else if (data === "\u007f" || data === "\b") {
					// Handle backspace
					if (buffer.length > 0) {
						inputBuffers.set(socket.id, buffer.slice(0, -1));
						// Echo backspace sequence to terminal: move back, clear, move back
						socket.emit("code-output", { output: "\b \b" });
					}
				} else {
					// Add to buffer and echo
					inputBuffers.set(socket.id, buffer + data);
					socket.emit("code-output", { output: data });
				}
			} else {
				// No process or not writable
			}
		});

		socket.on("stop-code", () => {
			const proc = runningProcesses.get(socket.id);
			if (proc) {
				proc.kill();
				runningProcesses.delete(socket.id);
				socket.emit("code-status", {
					status: "stopped",
					reason: "manual",
				});
				socket.emit("code-output", {
					output: "\r\nProcess forcefully terminated.\r\n",
				});
			}
		});

		socket.on("disconnect", () => {
			const proc = runningProcesses.get(socket.id);
			if (proc) {
				proc.kill();
				runningProcesses.delete(socket.id);
			}
			inputBuffers.delete(socket.id);
			const user = activeUsers.get(socket.id);
			if (user && user.pasteId) {
				const pasteId = user.pasteId;
				activeUsers.delete(socket.id);
				broadcastRoomUsers(pasteId);
			} else {
				activeUsers.delete(socket.id);
			}
		});
	});

	return io;
};
