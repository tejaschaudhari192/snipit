import "./polyfill.js";

import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import http from "http";
import app from "./app.js";
import { setupSocket } from "./socket.js";
import { connectDB } from "@/config/db.js";
import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";

const port = configurations.port;
const server = http.createServer(app);

// Setup Socket.IO
setupSocket(server);

// Start server immediately
server.listen(port, () => {
	logger.info(`🚀 Server listening on ${port}`);
	logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
});

// Connect to Database in background
connectDB().catch((err) => {
	logger.error(
		"Initial DB connection failed. Requests will retry on arrival.",
		{
			error: err instanceof Error ? err.message : err,
		},
	);
});

export default app;
