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
