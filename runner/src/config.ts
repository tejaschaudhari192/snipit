import type { CorsOptions } from "cors";
import dotenv from "dotenv";

dotenv.config();

export const config = {
	port: parseInt(process.env.PORT as string, 10),
	executionTimeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS as string, 10),
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	} satisfies CorsOptions,
};

export default config;
