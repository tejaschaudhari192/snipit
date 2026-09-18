/**
 * Calculate the originating train start date based on intermediate station day count.
 * E.g., if a passenger boards on 2026-09-04 at a station with dayCount = 2,
 * the train originally departed its origin station on 2026-09-03.
 */
export function calculateOriginDepartureDate(
	boardingDate: string,
	dayCount?: number | string,
): string {
	const stationDayOffset = (dayCount ? Number(dayCount) : 1) - 1;
	if (stationDayOffset <= 0 || boardingDate.length !== 8) {
		return boardingDate;
	}

	try {
		const year = parseInt(boardingDate.substring(0, 4), 10);
		const month = parseInt(boardingDate.substring(4, 6), 10) - 1;
		const day = parseInt(boardingDate.substring(6, 8), 10);

		const originDate = new Date(year, month, day);
		originDate.setDate(originDate.getDate() - stationDayOffset);

		const yyyy = originDate.getFullYear();
		const mm = String(originDate.getMonth() + 1).padStart(2, "0");
		const dd = String(originDate.getDate()).padStart(2, "0");

		return `${yyyy}${mm}${dd}`;
	} catch {
		return boardingDate;
	}
}

export interface DateOption {
	label: string;
	value: string;
}

/**
 * Generate boarding date choices (-2 days, -1 yesterday, 0 today, +1 tomorrow)
 * Typically used for live running status checks.
 */
export function generateDateOptions(today = new Date()): DateOption[] {
	const dates: DateOption[] = [];

	for (let offset = -2; offset <= 1; offset++) {
		const d = new Date(today);
		d.setDate(today.getDate() + offset);

		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const dd = String(d.getDate()).padStart(2, "0");
		const val = `${yyyy}${mm}${dd}`;

		let label = d.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		});

		if (offset === 0) label += " (Today)";
		else if (offset === -1) label += " (Yesterday)";
		else if (offset === 1) label += " (Tomorrow)";

		dates.push({ label, value: val });
	}

	return dates;
}

/**
 * Convert YYYYMMDD string to HTML input date YYYY-MM-DD format.
 */
export function toInputDateFormat(val: string): string {
	if (val && val.length === 8) {
		return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`;
	}
	return val;
}

/**
 * Convert HTML input date YYYY-MM-DD string to API YYYYMMDD format.
 */
export function toApiDateFormat(val: string): string {
	return val.replace(/-/g, "");
}

export interface TrainBookingRange {
	minDate: Date;
	maxDate: Date;
	todayYmd: string;
	tomorrowYmd: string;
}

/**
 * Parse YYYYMMDD string to Date object
 */
export function parseDateFromYmd(ymd: string): Date {
	if (ymd && ymd.length === 8) {
		const y = parseInt(ymd.slice(0, 4), 10);
		const m = parseInt(ymd.slice(4, 6), 10) - 1;
		const d = parseInt(ymd.slice(6, 8), 10);
		const dt = new Date(y, m, d);
		if (!isNaN(dt.getTime())) return dt;
	}
	return new Date();
}

/**
 * Format Date object to YYYYMMDD string
 */
export function formatYmdFromDate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}${m}${d}`;
}

/**
 * Get booking date range boundaries and Today / Tomorrow shortcuts for advance reservations (up to 120 days).
 */
export function getTrainBookingRange(
	today = new Date(),
	maxAdvanceDays = 120,
): TrainBookingRange {
	const minDate = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);

	const maxDate = new Date(minDate);
	maxDate.setDate(minDate.getDate() + maxAdvanceDays);

	const tomorrow = new Date(minDate);
	tomorrow.setDate(minDate.getDate() + 1);

	return {
		minDate,
		maxDate,
		todayYmd: formatYmdFromDate(minDate),
		tomorrowYmd: formatYmdFromDate(tomorrow),
	};
}

/**
 * Format YYYYMMDD or ISO date string into human readable display (e.g. "Thu, 17 Sep 2026").
 */
export function formatReadableTrainDate(dateStr?: string): string {
	if (!dateStr) return "";
	const clean = dateStr.trim();
	try {
		let dt: Date;
		if (/^\d{8}$/.test(clean)) {
			const y = parseInt(clean.slice(0, 4), 10);
			const m = parseInt(clean.slice(4, 6), 10) - 1;
			const d = parseInt(clean.slice(6, 8), 10);
			dt = new Date(y, m, d);
		} else {
			dt = new Date(clean);
		}

		if (isNaN(dt.getTime())) return "";
		return dt.toLocaleDateString(undefined, {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	} catch {
		return "";
	}
}

/**
 * Calculate the calendar day difference between departure and arrival.
 * Uses explicit day counts if available, otherwise falls back to date string differences.
 */
export function getCrossDayOffset(
	departureDate?: string,
	arrivalDate?: string,
	boardingDayCount?: number,
	arrivalDayCount?: number,
): number {
	if (
		typeof arrivalDayCount === "number" &&
		typeof boardingDayCount === "number" &&
		arrivalDayCount >= boardingDayCount
	) {
		return arrivalDayCount - boardingDayCount;
	}

	if (departureDate && arrivalDate && departureDate !== arrivalDate) {
		try {
			const dep = new Date(departureDate);
			const arr = new Date(arrivalDate);
			if (!isNaN(dep.getTime()) && !isNaN(arr.getTime())) {
				const diffDays = Math.round(
					(arr.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24),
				);
				return Math.max(0, diffDays);
			}
		} catch {
			return 0;
		}
	}

	return 0;
}
