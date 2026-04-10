import http from "http";
import app from "./app.js";
import { setupSocket } from "./socket.js";
import { connectDB } from "@/config/db.js";
import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";

// Initialize Database
connectDB();

const port = configurations.port;
const server = http.createServer(app);

// Setup Socket.IO
setupSocket(server);

server.listen(port, () => {
	logger.info(`🚀 Server listening on ${port}`);
	logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
