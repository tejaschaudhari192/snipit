import type { Passenger, PaytmRawPassenger } from "../types/trains.types.js";

/**
 * Parses coach, berth number, and berth code from arbitrary railway status strings.
 * E.g., "CNF / B1 / 45 / LB", "CNF/B1/45/LB", "CNF B1 45", "B1, 45, LB", "B1 / 45", "S2-54"
 */
export function parseCoachAndBerthFromString(str?: string): {
	coach?: string | undefined;
	berth?: string | undefined;
	berthCode?: string | undefined;
} | null {
	if (!str || typeof str !== "string") return null;
	const trimmed = str.trim();

	// Exclude pure waitlist or cancelled strings without allocated coach
	if (
		/^(?:WL|RLWL|PQWL|GNWL|TQWL|RQWL|NOSB|CAN|CANCELLED)\b/i.test(trimmed)
	) {
		return null;
	}

	// Pattern 1: CNF / B1 / 45 / LB, CNF/B1/45/LB, CONFIRMED/B1/45, RAC / B1 / 45
	const m1 = trimmed.match(
		/(?:CNF|CONFIRM(?:ED)?|RAC)[\s,/]+([A-Z0-9]{1,5})[\s,/]+(\d+)(?:[\s,/]+([A-Za-z]+))?/i,
	);
	if (m1) {
		return {
			coach: m1[1]?.toUpperCase(),
			berth: m1[2],
			berthCode: m1[3] ? m1[3].toUpperCase() : undefined,
		};
	}

	// Pattern 2: B1 / 45 / LB, B1, 45, LB, B1 45, S2-54, HA1 / 12 / CP
	const m2 = trimmed.match(
		/\b([A-Z]{1,3}\d{0,2})[\s,/]+(\d{1,3})(?:[\s,/]+([A-Za-z]+))?\b/,
	);
	if (m2) {
		const code = m2[1]?.toUpperCase() || "";
		// Skip false coach codes that are waiting list or cancellation acronyms
		if (
			[
				"WL",
				"PQWL",
				"GNWL",
				"RLWL",
				"TQWL",
				"RQWL",
				"RAC",
				"CAN",
				"NOSB",
			].includes(code)
		) {
			return null;
		}
		return {
			coach: code,
			berth: m2[2],
			berthCode: m2[3] ? m2[3].toUpperCase() : undefined,
		};
	}

	return null;
}

/**
 * Normalizes status strings like "CNF / B1 / 45 / LB" into clean status like "CNF".
 */
export function normalizePassengerStatus(status: string): string {
	const trimmed = (status || "").trim();
	if (/^(?:CNF|CONFIRM(?:ED)?)\b/i.test(trimmed)) {
		return "CNF";
	}
	if (/^RAC\b/i.test(trimmed)) {
		const racMatch = trimmed.match(/^(RAC(?:\s*\d+)?)/i);
		if (racMatch && racMatch[1]) {
			return racMatch[1].toUpperCase();
		}
		return "RAC";
	}
	return trimmed || "No Status";
}

/**
 * Resolves coach, berth, and clean status for a passenger record.
 */
export function parsePassengerDetails(
	pax: PaytmRawPassenger,
	idx: number,
	metaBerths?: Record<string, string>,
): Passenger {
	const rawStatus = (
		pax.currentStatusDisplayText ||
		pax.currentStatus ||
		pax.bookingStatus ||
		"No Status"
	).trim();

	const rawBooking = (pax.bookingStatus || "").trim();

	// 1. Direct properties on passenger payload
	let coach: string | undefined = (
		pax.currentCoachId ||
		pax.coachId ||
		pax.currentCoach ||
		pax.coach ||
		pax.bookingCoachId ||
		pax.bookingCoach ||
		pax.coachNo ||
		pax.allocatedCoach ||
		""
	)
		.toString()
		.trim();

	if (!coach) coach = undefined;

	let rawBerthNum: string | number | undefined =
		pax.currentBerthNo ??
		pax.berthNo ??
		pax.berth ??
		pax.bookingBerthNo ??
		pax.seatNo ??
		pax.seat ??
		pax.allocatedBerth;

	let berthCode: string | undefined = (
		pax.currentBerthCode ||
		pax.berthCode ||
		pax.bookingBerthCode ||
		pax.berthType ||
		pax.berthPreference ||
		""
	)
		.toString()
		.trim();

	if (!berthCode) berthCode = undefined;

	// Check if berth number actually combined coach and seat: e.g. "B1 45"
	if (rawBerthNum && typeof rawBerthNum === "string" && !coach) {
		const parsed = parseCoachAndBerthFromString(rawBerthNum);
		if (parsed?.coach) {
			coach = parsed.coach;
			rawBerthNum = parsed.berth;
			if (parsed.berthCode && !berthCode) {
				berthCode = parsed.berthCode;
			}
		}
	}

	// 2. Parse from current status string if coach or berth is missing
	if (!coach || !rawBerthNum) {
		const parsedCurrent = parseCoachAndBerthFromString(rawStatus);
		if (parsedCurrent) {
			if (!coach && parsedCurrent.coach) coach = parsedCurrent.coach;
			if (!rawBerthNum && parsedCurrent.berth)
				rawBerthNum = parsedCurrent.berth;
			if (!berthCode && parsedCurrent.berthCode)
				berthCode = parsedCurrent.berthCode;
		}
	}

	// 3. If ticket is confirmed, check booking status string for coach / berth
	const isConfirmedStatus =
		rawStatus.toUpperCase().includes("CNF") ||
		rawStatus.toUpperCase().includes("CONFIRM");

	if (isConfirmedStatus && (!coach || !rawBerthNum)) {
		const parsedBooking = parseCoachAndBerthFromString(rawBooking);
		if (parsedBooking) {
			if (!coach && parsedBooking.coach) coach = parsedBooking.coach;
			if (!rawBerthNum && parsedBooking.berth)
				rawBerthNum = parsedBooking.berth;
			if (!berthCode && parsedBooking.berthCode)
				berthCode = parsedBooking.berthCode;
		}
	}

	// 4. Resolve human-readable berth type description (e.g. LB -> Lower Berth)
	let berthDesc: string | undefined;
	if (berthCode) {
		const upperCode = berthCode.toUpperCase();
		berthDesc =
			metaBerths?.[upperCode] || metaBerths?.[berthCode] || upperCode;
	}

	// 5. Build final berth display
	let finalBerth: string | number | undefined;
	if (
		rawBerthNum !== undefined &&
		rawBerthNum !== null &&
		rawBerthNum !== ""
	) {
		const bStr = String(rawBerthNum).trim();
		if (bStr) {
			if (berthDesc && !bStr.includes("(")) {
				finalBerth = `${bStr} (${berthDesc})`;
			} else if (berthCode && !bStr.includes("(")) {
				finalBerth = `${bStr} (${berthCode})`;
			} else {
				finalBerth = bStr;
			}
		}
	}

	// 6. Clean status
	const cleanStatus = isConfirmedStatus
		? "CNF"
		: normalizePassengerStatus(rawStatus);

	// 7. Format booking status
	let booking = rawBooking;
	if (booking) {
		if (coach && rawBerthNum && !booking.includes(coach)) {
			booking = `${booking} / ${coach} / ${rawBerthNum}`;
		} else if (
			pax.bookingBerthNo &&
			!booking.includes(String(pax.bookingBerthNo))
		) {
			booking = `${booking} / ${pax.bookingBerthNo}`;
		}
	}

	return {
		number: idx + 1,
		name: pax.passengerName || `Passenger ${idx + 1}`,
		status: cleanStatus,
		bookingStatus: booking,
		coach: coach ? coach.toUpperCase() : undefined,
		berth: finalBerth,
	};
}

/**
 * Shift an ISO YYYY-MM-DD date string by a number of calendar days using UTC date math.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
	if (!dateStr || days === 0) return dateStr;
	const rawParts = dateStr.split("-");
	if (rawParts.length === 3) {
		const year = Number(rawParts[0]);
		const month = Number(rawParts[1]);
		const day = Number(rawParts[2]);
		if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
			const date = new Date(Date.UTC(year, month - 1, day));
			date.setUTCDate(date.getUTCDate() + days);
			const y = date.getUTCFullYear();
			const m = String(date.getUTCMonth() + 1).padStart(2, "0");
			const d = String(date.getUTCDate()).padStart(2, "0");
			return `${y}-${m}-${d}`;
		}
	}
	const d = new Date(dateStr);
	if (!isNaN(d.getTime())) {
		d.setDate(d.getDate() + days);
		const iso = d.toISOString().split("T")[0];
		return iso || dateStr;
	}
	return dateStr;
}

export interface CalculateArrivalDateOptions {
	departureDate: string;
	boardingDayCount?: string | number | undefined;
	destDayCount?: string | number | undefined;
	explicitArrivalDate?: string | undefined;
	departureTime?: string | undefined;
	arrivalTime?: string | undefined;
	duration?: string | undefined;
}

/**
 * Accurately calculate arrival date relying on official API day_count data.
 */
export function calculateArrivalDate({
	departureDate,
	boardingDayCount,
	destDayCount,
	explicitArrivalDate,
	departureTime,
	arrivalTime,
	duration,
}: CalculateArrivalDateOptions): {
	arrivalDate: string;
	boardingDay: number;
	destDay: number;
	dayOffset: number;
} {
	const boardingDay = Math.max(
		1,
		parseInt(String(boardingDayCount || 1), 10) || 1,
	);
	let destDay = Math.max(
		1,
		parseInt(String(destDayCount || boardingDay), 10) || boardingDay,
	);

	// Direct explicit arrival date from provider if present and valid
	if (explicitArrivalDate && explicitArrivalDate !== departureDate) {
		const dayOffset = Math.max(0, destDay - boardingDay);
		return {
			arrivalDate: explicitArrivalDate,
			boardingDay,
			destDay,
			dayOffset,
		};
	}

	// 1. Primary: Use API day_count offset
	let dayOffset = destDay - boardingDay;

	// 2. Fallback: If day_count is identical (e.g. both 1), but times/duration show overnight crossing
	if (dayOffset <= 0 && departureTime && arrivalTime) {
		const depParts = departureTime.split(":");
		const arrParts = arrivalTime.split(":");
		const depH = parseInt(depParts[0] || "", 10);
		const depM = parseInt(depParts[1] || "0", 10);
		const arrH = parseInt(arrParts[0] || "", 10);
		const arrM = parseInt(arrParts[1] || "0", 10);

		if (!isNaN(depH) && !isNaN(arrH)) {
			const depMins = depH * 60 + (isNaN(depM) ? 0 : depM);
			const arrMins = arrH * 60 + (isNaN(arrM) ? 0 : arrM);

			let durationMins = 0;
			if (duration) {
				const hMatch = duration.match(/(\d+)\s*h/i);
				const mMatch = duration.match(/(\d+)\s*m/i);
				if (hMatch && hMatch[1])
					durationMins += parseInt(hMatch[1], 10) * 60;
				if (mMatch && mMatch[1])
					durationMins += parseInt(mMatch[1], 10);
			}

			if (durationMins > 0) {
				dayOffset = Math.floor((depMins + durationMins) / 1440);
			} else if (arrMins < depMins) {
				dayOffset = 1;
			}
			if (dayOffset > 0) {
				destDay = boardingDay + dayOffset;
			}
		}
	}

	dayOffset = Math.max(0, dayOffset);
	const arrivalDate = departureDate
		? addDaysToDateString(departureDate, dayOffset)
		: "";

	return {
		arrivalDate: arrivalDate || departureDate || "",
		boardingDay,
		destDay,
		dayOffset,
	};
}
