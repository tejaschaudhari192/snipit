type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
	private log(level: LogLevel, message: string, ...args: unknown[]) {
		const timestamp = new Date().toISOString();
		const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

		switch (level) {
			case 'info':
				console.info(formattedMessage, ...args);
				break;
			case 'warn':
				console.warn(formattedMessage, ...args);
				break;
			case 'error':
				console.error(formattedMessage, ...args);
				break;
			case 'debug':
				console.debug(formattedMessage, ...args);
				break;
		}
	}

	info(message: string, ...args: unknown[]) {
		this.log('info', message, ...args);
	}

	warn(message: string, ...args: unknown[]) {
		this.log('warn', message, ...args);
	}

	error(message: string, ...args: unknown[]) {
		this.log('error', message, ...args);
	}

	debug(message: string, ...args: unknown[]) {
		this.log('debug', message, ...args);
	}
}

export const logger = new Logger();
