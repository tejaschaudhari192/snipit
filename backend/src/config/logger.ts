import {
	createLogger,
	format,
	transports,
	addColors,
	type Logger,
} from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, errors, json } = format;

const customLevels = {
	crit: 0,
	error: 1,
	warn: 2,
	notice: 3,
	info: 4,
	success: 5,
	http: 6,
	debug: 7,
	trace: 8,
};

const customColors = {
	crit: "red bgWhite bold",
	error: "red",
	warn: "yellow",
	notice: "magenta",
	info: "cyan",
	success: "green",
	http: "blue",
	debug: "gray",
	trace: "white",
};

addColors(customColors);

const consoleFormat = combine(
	colorize({ all: true }),
	timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	errors({ stack: true }),
	printf(({ timestamp, level, message, stack, ...meta }) => {
		const metaStr = Object.keys(meta).length
			? ` ${JSON.stringify(meta)}`
			: "";
		return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ""}${metaStr}`;
	}),
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = createLogger({
	levels: customLevels,
	level: "debug",
	transports: [
		new transports.Console({
			format: consoleFormat,
		}),
		new transports.DailyRotateFile({
			filename: "logs/error-%DATE%.log",
			level: "error",
			datePattern: "YYYY-MM-DD",
			zippedArchive: true,
			maxSize: "20m",
			maxFiles: "14d",
			format: fileFormat,
		}),
		new transports.DailyRotateFile({
			filename: "logs/combined-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			zippedArchive: true,
			maxSize: "20m",
			maxFiles: "14d",
			format: fileFormat,
		}),
	],
}) as unknown as Logger & {
	crit: (message: string, ...meta: any[]) => Logger;
	notice: (message: string, ...meta: any[]) => Logger;
	success: (message: string, ...meta: any[]) => Logger;
	trace: (message: string, ...meta: any[]) => Logger;
};

export default logger;
