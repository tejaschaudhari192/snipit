import type { Server as SocketIOServer, Socket } from "socket.io";
import type { ProcessManager } from "../executor/process-manager.js";

export const registerRunnerSocketHandlers = (
	io: SocketIOServer,
	processManager: ProcessManager,
) => {
	io.on("connection", (socket: Socket) => {
		console.log(`[Runner] Backend proxy connected: ${socket.id}`);

		socket.on(
			"run-code",
			({ code, language }: { code: string; language: string }) => {
				if (!code || !language) {
					socket.emit("code-output", {
						output: "[Error] Code or language parameter missing.\r\n",
					});
					socket.emit("code-status", {
						status: "stopped",
						error: "Missing parameters",
					});
					return;
				}

				console.log(`[Runner] Executing ${language} for socket ${socket.id}`);
				processManager.startExecution(socket.id, code, language, {
					onOutput: (output) => socket.emit("code-output", { output }),
					onStatus: (status, details) =>
						socket.emit("code-status", { status, ...details }),
				});
			},
		);

		socket.on("code-input", (data: string) => {
			processManager.sendInput(socket.id, data, (echo) => {
				socket.emit("code-output", { output: echo });
			});
		});

		socket.on("stop-code", () => {
			console.log(`[Runner] Manual stop requested by ${socket.id}`);
			processManager.stopExecution(socket.id);
			socket.emit("code-status", { status: "stopped", reason: "manual" });
			socket.emit("code-output", {
				output: "\r\nProcess forcefully terminated.\r\n",
			});
		});

		socket.on("disconnect", () => {
			console.log(`[Runner] Socket disconnected: ${socket.id}`);
			processManager.stopExecution(socket.id);
		});
	});
};
