import type { PasteData, ContentMode } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import errorSound from "@/assets/audio/error.mp3";
import startSound from "@/assets/audio/start.mp3";
import bruhSound from "@/assets/audio/bruh.mp3";

import removeSound from "@/assets/audio/remove.mp3";
import undoSound from "@/assets/audio/undo.mp3";

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

export function playErrorSound() {
	try {
		const audio = new Audio(errorSound);
		audio.volume = 0.4;
		audio.play();
	} catch (e) {
		console.error("Audio error:", e);
	}
}
export function playSuccessSound() {
	try {
		const audio = new Audio(startSound);
		audio.volume = 0.4;
		audio.play();
	} catch (e) {
		console.error("Audio error:", e);
	}
}

export function playBruhSound() {
	try {
		const audio = new Audio(bruhSound);
		audio.volume = 0.4;
		audio.play();
	} catch (e) {
		console.error("Audio error:", e);
	}
}

export function playRemoveSound() {
	try {
		const audio = new Audio(removeSound);
		audio.volume = 0.4;
		audio.play();
	} catch (e) {
		console.error("Audio error:", e);
	}
}

export function playUndoSound() {
	try {
		const audio = new Audio(undoSound);
		audio.volume = 0.4;
		audio.play();
	} catch (e) {
		console.error("Audio error:", e);
	}
}
