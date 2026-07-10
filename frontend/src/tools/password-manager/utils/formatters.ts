import { PASSWORD_MANAGER_CONFIG } from "@/tools/password-manager/config/constants";

export function getDomain(urlStr?: string): string {
	if (!urlStr) return "";
	try {
		const url = new URL(
			urlStr.startsWith("http") ? urlStr : `https://${urlStr}`,
		);
		return url.hostname.replace("www.", "");
	} catch {
		return "";
	}
}

export function getInitials(title: string): string {
	return title.slice(0, 2).toUpperCase();
}

export function getBrandColor(title: string): string {
	const colors = [
		"bg-blue-600",
		"bg-emerald-600",
		"bg-purple-600",
		"bg-rose-600",
		"bg-amber-600",
		"bg-cyan-600",
		"bg-pink-600",
		"bg-teal-600",
	];
	let hash = 0;
	for (let i = 0; i < title.length; i++) {
		hash = title.charCodeAt(i) + ((hash << 5) - hash);
	}
	return colors[Math.abs(hash) % colors.length];
}

export function isOlderThan3Months(dateStr?: string): boolean {
	if (!dateStr) return false;
	const expiryTime =
		PASSWORD_MANAGER_CONFIG.PASSWORD_EXPIRY_WARNING_DAYS *
		PASSWORD_MANAGER_CONFIG.MS_PER_DAY;
	return Date.now() - new Date(dateStr).getTime() > expiryTime;
}

export function formatDate(dateStr?: string): string {
	if (!dateStr) return "";
	try {
		return new Intl.DateTimeFormat(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(dateStr));
	} catch {
		return "";
	}
}
