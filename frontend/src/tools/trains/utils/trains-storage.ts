import type { PnrData } from "../types/trains";
import { checkIsAllConfirmed } from "./pnr-helpers";

export interface PnrSearchHistoryItem {
	pnr: string;
	trainNumber: string;
	trainName: string;
	from: string;
	fromCode?: string;
	to: string;
	toCode?: string;
	departureDate: string;
	travelClass?: string;
	statusSummary: string;
	isConfirmed: boolean;
	chartStatus?: string;
	searchedAt: number;
}

export interface StationSearchHistoryItem {
	id: string;
	source: string;
	sourceCode: string;
	destination: string;
	destCode: string;
	departureDate: string;
	searchedAt: number;
}

export interface TrainSearchHistoryItem {
	trainNumber: string;
	trainName: string;
	origin?: string;
	destination?: string;
	searchedAt: number;
}

const PNR_STORAGE_KEY = "snipit_pnr_search_history";
const STATION_SEARCH_KEY = "snipit_train_station_history";
const TRAIN_SEARCH_KEY = "snipit_train_search_history";

const MAX_HISTORY_ITEMS = 10;
const DEFAULT_BUFFER_HOURS = 24;

/**
 * Parses date string across formats (ISO, long standard, DD-MM-YYYY).
 */
export function parseTrainDate(dateStr?: string): number | null {
	if (!dateStr || !dateStr.trim()) return null;
	const clean = dateStr.trim();

	const standard = new Date(clean);
	if (!isNaN(standard.getTime())) {
		return standard.getTime();
	}

	const dmy = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
	if (dmy) {
		const day = parseInt(dmy[1], 10);
		const month = parseInt(dmy[2], 10) - 1;
		const year = parseInt(dmy[3], 10);
		const d = new Date(year, month, day);
		if (!isNaN(d.getTime())) {
			return d.getTime();
		}
	}

	// YYYYMMDD format like 20261007
	const ymd = clean.match(/^(\d{4})(\d{2})(\d{2})$/);
	if (ymd) {
		const year = parseInt(ymd[1], 10);
		const month = parseInt(ymd[2], 10) - 1;
		const day = parseInt(ymd[3], 10);
		const d = new Date(year, month, day);
		if (!isNaN(d.getTime())) {
			return d.getTime();
		}
	}

	return null;
}

/**
 * Checks whether a train journey has finished.
 * Finished if departure timestamp + bufferHours < current time.
 */
export function isJourneyFinished(
	dateStr?: string,
	bufferHours: number = DEFAULT_BUFFER_HOURS,
): boolean {
	const parsed = parseTrainDate(dateStr);
	if (parsed === null) return false;
	const expiry = parsed + bufferHours * 3600 * 1000;
	return Date.now() > expiry;
}

/**
 * Checks if a journey is today or within the upcoming 48 hours (or active now).
 */
export function isJourneyTodayOrUpcoming(dateStr?: string): boolean {
	const parsed = parseTrainDate(dateStr);
	if (parsed === null) return false;

	const now = Date.now();
	// Active window: from 24h ago to 48h in future
	const windowStart = now - 24 * 3600 * 1000;
	const windowEnd = now + 48 * 3600 * 1000;
	return parsed >= windowStart && parsed <= windowEnd;
}

/**
 * Formats any train date (ISO, DD-MM-YYYY, YYYYMMDD, timestamp) to YYYYMMDD
 * as required by live running status and schedule APIs.
 */
export function formatTrainDateToYYYYMMDD(
	dateInput?: string | number | Date,
): string {
	const today = new Date();
	const defaultYmd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

	if (!dateInput) return defaultYmd;

	if (typeof dateInput === "string") {
		const clean = dateInput.trim();
		if (/^\d{8}$/.test(clean)) {
			return clean;
		}
	}

	let d: Date | null = null;
	if (dateInput instanceof Date) {
		d = dateInput;
	} else if (typeof dateInput === "number") {
		d = new Date(dateInput);
	} else {
		const ts = parseTrainDate(dateInput);
		if (ts !== null) {
			d = new Date(ts);
		}
	}

	if (!d || isNaN(d.getTime())) {
		return defaultYmd;
	}

	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${yyyy}${mm}${dd}`;
}

/**
 * Returns PNR search history items that are today or upcoming within the active tracking window.
 */
export function getActiveUpcomingPnrJourneys(): PnrSearchHistoryItem[] {
	const all = loadPnrSearchHistory();
	return all.filter((item) => isJourneyTodayOrUpcoming(item.departureDate));
}

// ======================== PNR HISTORY ========================

export function loadPnrSearchHistory(): PnrSearchHistoryItem[] {
	if (typeof window === "undefined" || !window.localStorage) return [];

	try {
		const raw = localStorage.getItem(PNR_STORAGE_KEY);
		if (!raw) return [];
		const parsed: PnrSearchHistoryItem[] = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		// Filter out finished journeys
		const activeItems = parsed.filter(
			(item) => !isJourneyFinished(item.departureDate),
		);

		if (activeItems.length !== parsed.length) {
			localStorage.setItem(PNR_STORAGE_KEY, JSON.stringify(activeItems));
		}
		return activeItems;
	} catch {
		return [];
	}
}

export function savePnrToHistory(data: PnrData): PnrSearchHistoryItem[] {
	if (typeof window === "undefined" || !window.localStorage || !data?.pnr)
		return [];

	try {
		const cleanPnr = data.pnr.trim();
		if (!/^\d{10}$/.test(cleanPnr)) return [];

		const currentHistory = loadPnrSearchHistory();
		const isConfirmed = checkIsAllConfirmed(data.passengers);

		let statusSummary = "Checked";
		if (isConfirmed) {
			statusSummary = "100% CNF";
		} else if (data.passengers && data.passengers.length > 0) {
			const firstPax = data.passengers[0];
			statusSummary = firstPax?.status || "WL/RAC";
		} else if (data.chartStatus) {
			statusSummary = data.chartStatus;
		}

		let trainNo = data.trainNumber || "";
		const trainName = data.train || "";
		if (!trainNo && trainName) {
			const numMatch = trainName.match(/\b(\d{4,5})\b/);
			if (numMatch) {
				trainNo = numMatch[1];
			}
		}

		const newItem: PnrSearchHistoryItem = {
			pnr: cleanPnr,
			trainNumber: trainNo,
			trainName: trainName.replace(/\(\d{4,5}\)/, "").trim() || trainName,
			from: data.from || "",
			fromCode: data.fromCode,
			to: data.to || "",
			toCode: data.toCode,
			departureDate: data.departureDate || data.date || "",
			travelClass: data.class,
			statusSummary,
			isConfirmed,
			chartStatus: data.chartStatus,
			searchedAt: Date.now(),
		};

		const filtered = currentHistory.filter((item) => item.pnr !== cleanPnr);
		const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
		localStorage.setItem(PNR_STORAGE_KEY, JSON.stringify(updated));
		return updated;
	} catch {
		return [];
	}
}

export function removePnrFromHistory(pnr: string): PnrSearchHistoryItem[] {
	if (typeof window === "undefined" || !window.localStorage) return [];
	try {
		const current = loadPnrSearchHistory();
		const updated = current.filter((item) => item.pnr !== pnr.trim());
		localStorage.setItem(PNR_STORAGE_KEY, JSON.stringify(updated));
		return updated;
	} catch {
		return [];
	}
}

export function clearPnrSearchHistory(): void {
	if (typeof window === "undefined" || !window.localStorage) return;
	try {
		localStorage.removeItem(PNR_STORAGE_KEY);
	} catch {
		// ignore
	}
}

// ======================== STATION PAIR SEARCH HISTORY ========================

export function loadStationSearchHistory(): StationSearchHistoryItem[] {
	if (typeof window === "undefined" || !window.localStorage) return [];
	try {
		const raw = localStorage.getItem(STATION_SEARCH_KEY);
		if (!raw) return [];
		const parsed: StationSearchHistoryItem[] = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch {
		return [];
	}
}

export function saveStationSearchToHistory(
	source: string,
	sourceCode: string,
	destination: string,
	destCode: string,
	departureDate: string,
): StationSearchHistoryItem[] {
	if (typeof window === "undefined" || !window.localStorage) return [];
	try {
		const sCode = (sourceCode || source).trim().toUpperCase();
		const dCode = (destCode || destination).trim().toUpperCase();
		if (!sCode || !dCode || sCode === dCode) return [];

		const id = `${sCode}_${dCode}`;
		const current = loadStationSearchHistory();

		const newItem: StationSearchHistoryItem = {
			id,
			source: source.trim(),
			sourceCode: sCode,
			destination: destination.trim(),
			destCode: dCode,
			departureDate,
			searchedAt: Date.now(),
		};

		const filtered = current.filter((item) => item.id !== id);
		const updated = [newItem, ...filtered].slice(0, 6);
		localStorage.setItem(STATION_SEARCH_KEY, JSON.stringify(updated));
		return updated;
	} catch {
		return [];
	}
}

export function removeStationSearchFromHistory(
	id: string,
): StationSearchHistoryItem[] {
	if (typeof window === "undefined" || !window.localStorage) return [];
	try {
		const current = loadStationSearchHistory();
		const updated = current.filter((item) => item.id !== id);
		localStorage.setItem(STATION_SEARCH_KEY, JSON.stringify(updated));
		return updated;
	} catch {
		return [];
	}
}

// ======================== TRAIN / LIVE / SCHEDULE SEARCH HISTORY ========================

export function loadTrainSearchHistory(): TrainSearchHistoryItem[] {
	if (typeof window === "undefined" || !window.localStorage) return [];
	try {
		const raw = localStorage.getItem(TRAIN_SEARCH_KEY);
		if (!raw) return [];
		const parsed: TrainSearchHistoryItem[] = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch {
		return [];
	}
}

export function saveTrainSearchToHistory(
	trainNumber: string,
	trainName: string,
	origin?: string,
	destination?: string,
): TrainSearchHistoryItem[] {
	if (typeof window === "undefined" || !window.localStorage) return [];
	try {
		const cleanNo = trainNumber.trim();
		if (!cleanNo) return [];

		const current = loadTrainSearchHistory();
		const newItem: TrainSearchHistoryItem = {
			trainNumber: cleanNo,
			trainName: trainName.trim(),
			origin: origin?.trim(),
			destination: destination?.trim(),
			searchedAt: Date.now(),
		};

		const filtered = current.filter((t) => t.trainNumber !== cleanNo);
		const updated = [newItem, ...filtered].slice(0, 6);
		localStorage.setItem(TRAIN_SEARCH_KEY, JSON.stringify(updated));
		return updated;
	} catch {
		return [];
	}
}
