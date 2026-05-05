import mongoose from "mongoose";
import logger from "@/config/logger.js";
import configurations from "@/config/configurations.js";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and across function invocations in serverless environments.
 */
interface GlobalWithMongoose {
	mongoose?: {
		conn: typeof mongoose | null;
		promise: Promise<typeof mongoose> | null;
	};
}

const globalWithMongoose = global as unknown as GlobalWithMongoose;

if (!globalWithMongoose.mongoose) {
	globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

export const connectDB = async () => {
	if (cached?.conn) {
		return cached.conn;
	}

	if (!cached?.promise) {
		const opts = {
			bufferCommands: true,
			serverSelectionTimeoutMS: 10000,
		};

		const dbUri = `mongodb+srv://${configurations.database.user}:${configurations.database.password}@jaybalaji.s5azwy2.mongodb.net/${configurations.database.name}?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000`;

		cached!.promise = mongoose
			.connect(dbUri, opts)

			.then((mongoose) => {
				logger.info(
					`Connected to database: ${configurations.database.name}`,
				);
				return mongoose;
			});
	}

	try {
		cached!.conn = await cached!.promise;
	} catch (error: unknown) {
		cached!.promise = null;
		logger.error("Failed to connect to database", {
			error: error instanceof Error ? error.message : error,
		});
		throw error;
	}

	return cached!.conn;
};
