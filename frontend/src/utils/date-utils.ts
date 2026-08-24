/**
 * Utility functions for dates and expiration checks
 */

/**
 * Checks if a given expiration ISO date string is already expired.
 */
export const isExpired = (expiresAt: string): boolean => {
	if (!expiresAt || expiresAt === "never" || expiresAt === "one-time")
		return false;
	const time = new Date(expiresAt).getTime();
	return !isNaN(time) && time < Date.now();
};

/**
 * Checks if a given expiration ISO date string will expire within the next 24 hours.
 */
export const isExpiringSoon = (expiresAt: string): boolean => {
	if (!expiresAt || expiresAt === "never" || expiresAt === "one-time")
		return false;
	const time = new Date(expiresAt).getTime();
	if (isNaN(time)) return false;
	const hoursRemaining = (time - Date.now()) / (1000 * 60 * 60);
	return hoursRemaining > 0 && hoursRemaining < 24;
};
