import { io, Socket as ClientSocket } from "socket.io-client";
import type { Socket as ServerSocket } from "socket.io";
import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";

/**
 * Maps incoming client sockets to their dedicated proxy socket connection
 * to the isolated runner microservice.
 */
const runnerConnections = new Map<string, ClientSocket>();

export const handleCodeRunnerProxy = (clientSocket: ServerSocket) => {
	// Connect to the isolated runner microservice
	const runnerSocket: ClientSocket = io(configurations.runner_service_url, {
		transports: ["websocket", "polling"],
		reconnection: true,
		reconnectionAttempts: 3,
		timeout: 5000,
	});

	runnerConnections.set(clientSocket.id, runnerSocket);

	runnerSocket.on("connect", () => {
		logger.debug(
			`[CodeRunnerProxy] Connected to runner service for client ${clientSocket.id}`,
		);
	});

	runnerSocket.on("connect_error", (err) => {
		logger.error(
			`[CodeRunnerProxy] Failed to connect to runner service: ${err.message}`,
		);
		clientSocket.emit("code-output", {
			output: `\r\n[Error] Runner service is unavailable (${err.message}).\r\n`,
		});
		clientSocket.emit("code-status", {
			status: "stopped",
			error: "Runner service unavailable",
		});
	});

	// Forward events from runner service back to client
	runnerSocket.on("code-output", (data) => {
		clientSocket.emit("code-output", data);
	});

	runnerSocket.on("code-status", (data) => {
		clientSocket.emit("code-status", data);
	});

	// Forward client commands to runner service
	clientSocket.on("run-code", (payload) => {
		if (!runnerSocket.connected) {
			runnerSocket.connect();
		}
		runnerSocket.emit("run-code", payload);
	});

	clientSocket.on("code-input", (data) => {
		runnerSocket.emit("code-input", data);
	});

	clientSocket.on("stop-code", () => {
		runnerSocket.emit("stop-code");
	});

	// Clean up runner connection on client disconnect
	clientSocket.on("disconnect", () => {
		runnerSocket.disconnect();
		runnerConnections.delete(clientSocket.id);
	});
};
