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

		const user = configurations.database.user;
		const pass = configurations.database.password;
		const dbName = configurations.database.name;

		const dbUri =
			process.env.MONGODB_URI ||
			`mongodb+srv://${user}:${pass}@jaybalaji.s5azwy2.mongodb.net/${dbName}?retryWrites=true&w=majority`;

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
