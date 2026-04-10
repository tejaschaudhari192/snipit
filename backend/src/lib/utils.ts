import cryptoRandomString from "crypto-random-string";
export function uniqueIdGenerator(): string {
	return cryptoRandomString({ length: 5 });
}

export function dateConverter(expiresTime: string) {
	let expiresAt: Date | null;
	const now = new Date();

	switch (expiresTime) {
		case "1h":
			expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000); // +1 hour
			break;
		case "1d":
			expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
			break;
		case "1w":
			expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +1 week
			break;
		case "1m":
			expiresAt = new Date(now.setMonth(now.getMonth() + 1)); // +1 month
			break;
		case "1y":
			expiresAt = new Date(now.setFullYear(now.getFullYear() + 1)); // +1 year
			break;
		case "one-time":
			expiresAt = null; // special handling (e.g. delete after first view)
			break;
		default: {
			const customDate = new Date(expiresTime);
			expiresAt =
				expiresTime && !isNaN(customDate.getTime()) ? customDate : null;
		}
	}

	return expiresAt;
}
