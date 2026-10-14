import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.route.js";
import { registerRunnerSocketHandlers } from "./sockets/runner.socket.js";
import { ProcessManager } from "./executor/process-manager.js";

const app = express();
app.use(cors(config.cors));
app.use(express.json());

// Routes
app.use(healthRouter);

// HTTP & Socket Server
const server = createServer(app);
const io = new SocketIOServer(server, {
	cors: config.cors,
});

// Process & Socket Handlers
const processManager = new ProcessManager(config.executionTimeoutMs);
registerRunnerSocketHandlers(io, processManager);

server.listen(config.port, () => {
	console.log(`🚀 Snipit Code Runner Service listening on http://localhost:${config.port}`);
});
