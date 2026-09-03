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
