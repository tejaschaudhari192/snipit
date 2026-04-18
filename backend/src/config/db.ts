import mongoose from "mongoose";
import logger from "@/config/logger.js";
import configurations from "@/config/configurations.js";

export const connectDB = async () => {
	try {
		await mongoose.connect(
			`mongodb+srv://${configurations.database.user}:${configurations.database.password}@jaybalaji.s5azwy2.mongodb.net/${configurations.database.name}`,
		);
		logger.info(`Connected to database: ${configurations.database.name}`);
	} catch (error: unknown) {
		logger.error("Failed to connect to database", {
			error: error instanceof Error ? error.message : error,
		});
	}
};
