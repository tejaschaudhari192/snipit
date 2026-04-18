import type { PasteData, ContentMode } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function detectContentMode(
	data: Pick<
		PasteData,
		"contentMode" | "redirectUrl" | "fileUrl" | "language"
	>,
): ContentMode {
	return (
		data.contentMode ??
		(data.redirectUrl
			? "link"
			: data.fileUrl
				? "file"
				: data.language !== "text"
					? "code"
					: "text")
	);
}

export function saveToLocal(pasteData: PasteData) {
	const key = "items";
	const stored = localStorage.getItem(key);
	let items: Array<PasteData> = stored ? JSON.parse(stored) : [];

	items = items.filter((item: PasteData) => item.id !== pasteData.id);

	items.unshift(pasteData);

	localStorage.setItem(key, JSON.stringify(items));
}

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

export function playErrorSound() {}
export function playSuccessSound() {}
export function playBruhSound() {}
export function playRemoveSound() {}
export function playUndoSound() {}
export function saveDraft(mode: string, content: string, id?: string) {
	const key = id ? `draft_${id}_${mode}` : `draft_${mode}`;
	localStorage.setItem(key, content);
}

export function getDraft(mode: string, id?: string): string | null {
	const key = id ? `draft_${id}_${mode}` : `draft_${mode}`;
	return localStorage.getItem(key);
}

export function clearDrafts(id?: string) {
	const modes = ["text", "code", "draw", "link", "file"];
	modes.forEach((mode) => {
		localStorage.removeItem(id ? `draft_${id}_${mode}` : `draft_${mode}`);
	});
}
