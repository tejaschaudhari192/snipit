/**
 * Date and Time utilities for formatting and calculations
 */

/**
 * Returns a human-readable "time ago" string
 */
export const timeAgo = (
	timestamp: string,
	t?: (key: string, options?: Record<string, unknown>) => string,
): string => {
	const seconds = Math.floor(
		(new Date().getTime() - new Date(timestamp).getTime()) / 1000,
	);
	let interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return t
			? t("common.time.years_ago", { count: interval })
			: `${interval} years ago`;
	}

	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return t
			? t("common.time.months_ago", { count: interval })
			: `${interval} months ago`;
	}

	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return t
			? t("common.time.days_ago", { count: interval })
			: `${interval} days ago`;
	}

	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return t
			? t("common.time.hours_ago", { count: interval })
			: `${interval} hours ago`;
	}

	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return t
			? t("common.time.minutes_ago", { count: interval })
			: `${interval} minutes ago`;
	}

	return t ? t("common.time.just_now") : "Just now";
};

/**
 * Calculates remaining time until a given ISO date string
 */
export function getTimeRemaining(
	isoString: string,
	t?: (key: string, options?: Record<string, unknown>) => string,
) {
	const expiryDate = new Date(isoString);
	const currentDate = new Date();

	const timeDifference = expiryDate.getTime() - currentDate.getTime();

	if (timeDifference <= 0) {
		return t ? t("common.time.expired") : "Expired";
	}

	const seconds = Math.floor(timeDifference / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30.44);
	const years = Math.floor(months / 12);

	const remainingMonths = months % 12;
	const remainingDays = Math.floor(days % 30.44);
	const remainingHours = hours % 24;
	const remainingMinutes = minutes % 60;

	if (years > 0) {
		return t
			? t(years > 1 ? "common.time.years" : "common.time.year", {
					count: years,
				})
			: `${years} year${years > 1 ? "s" : ""}`;
	}
	if (remainingMonths > 0) {
		return t
			? t(
					remainingMonths > 1
						? "common.time.months"
						: "common.time.month",
					{ count: remainingMonths },
				)
			: `${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
	}
	if (remainingDays > 0) {
		return t
			? t(remainingDays > 1 ? "common.time.days" : "common.time.day", {
					count: remainingDays,
				})
			: `${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
	}
	if (remainingHours > 0) {
		return t
			? t(remainingHours > 1 ? "common.time.hours" : "common.time.hour", {
					count: remainingHours,
				})
			: `${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
	}
	if (remainingMinutes > 0) {
		return t
			? t(
					remainingMinutes > 1
						? "common.time.minutes"
						: "common.time.minute",
					{ count: remainingMinutes },
				)
			: `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
	}

	return t ? t("common.time.less_than_minute") : "Less than a minute";
}

/**
 * Formats a date string into a human-readable format
 */
export function formatDate(
	date: string | Date,
	options: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
		year: "numeric",
	},
	locale: string = "en-US",
): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString(locale, options);
}

/**
 * Converts expiration time strings into actual Date objects
 */
export function dateConverter(expiresTime: string): Date | null {
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
		case "never":
			expiresAt = null;
			break;
		case "one-time":
			expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day default, but burn-after-read handles logic
			break;
		default: {
			const customDate = new Date(expiresTime);
			expiresAt =
				expiresTime && !isNaN(customDate.getTime()) ? customDate : null;
		}
	}

	return expiresAt;
}
