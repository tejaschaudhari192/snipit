import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { config } from "./config.js";
import { ProcessManager } from "./executor/process-manager.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "ok", service: "snipit-runner", timestamp: new Date().toISOString() });
});

const server = createServer(app);
const io = new SocketIOServer(server, {
	cors: config.cors,
});

const processManager = new ProcessManager(config.executionTimeoutMs);

io.on("connection", (socket) => {
	console.log(`[Runner] Backend proxy connected: ${socket.id}`);

	socket.on("run-code", ({ code, language }: { code: string; language: string }) => {
		if (!code || !language) {
			socket.emit("code-output", { output: "[Error] Code or language parameter missing.\r\n" });
			socket.emit("code-status", { status: "stopped", error: "Missing parameters" });
			return;
		}

		console.log(`[Runner] Executing ${language} for socket ${socket.id}`);
		processManager.startExecution(socket.id, code, language, {
			onOutput: (output) => socket.emit("code-output", { output }),
			onStatus: (status, details) => socket.emit("code-status", { status, ...details }),
		});
	});

	socket.on("code-input", (data: string) => {
		processManager.sendInput(socket.id, data, (echo) => {
			socket.emit("code-output", { output: echo });
		});
	});

	socket.on("stop-code", () => {
		console.log(`[Runner] Manual stop requested by ${socket.id}`);
		processManager.stopExecution(socket.id);
		socket.emit("code-status", { status: "stopped", reason: "manual" });
		socket.emit("code-output", { output: "\r\nProcess forcefully terminated.\r\n" });
	});

	socket.on("disconnect", () => {
		console.log(`[Runner] Socket disconnected: ${socket.id}`);
		processManager.stopExecution(socket.id);
	});
});

server.listen(config.port, () => {
	console.log(`🚀 Snipit Code Runner Service listening on http://localhost:${config.port}`);
});
