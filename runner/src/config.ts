import type { CorsOptions } from "cors";
import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS!.split(",").map((origin) => origin.trim()).filter(Boolean)

export const config = {
	port: parseInt(process.env.PORT as string, 10),
	executionTimeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS as string, 10),
	cors: {
		origin: allowedOrigins,
		methods: ["GET", "POST"],
		credentials: true,
	} satisfies CorsOptions,
};

export default config;
