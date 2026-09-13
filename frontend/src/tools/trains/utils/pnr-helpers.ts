import type { Passenger } from "../types/trains";

/**
 * Checks if all passengers on a ticket are confirmed.
 * Returns false if there are no passengers, or if any passenger has WL, RAC,
 * or unconfirmed status.
 */
export function checkIsAllConfirmed(passengers?: Passenger[]): boolean {
	if (!passengers || passengers.length === 0) return false;
	return passengers.every((p) => {
		const s = (p.status || "").toUpperCase();
		// If status has waitlist, RAC, or cancellation indicators
		if (
			s.includes("WL") ||
			s.includes("WAIT") ||
			s.includes("RAC") ||
			s.includes("CANCEL") ||
			s.includes("CAN")
		) {
			return false;
		}
		// If status explicitly indicates confirmed
		if (s.includes("CNF") || s.includes("CONFIRM")) {
			return true;
		}
		// If passenger has coach and berth assigned
		if (p.coach && p.berth) {
			return true;
		}
		// If status format matches coach & berth like "B1, 45" or "B1/45"
		if (/^[A-Z0-9]{1,5}\s*[,/]\s*\d+/.test(s)) {
			return true;
		}
		return false;
	});
}

/**
 * Parses coach, berth number, and berth code from arbitrary railway status strings.
 */
export function parseCoachAndBerthFromString(str?: string): {
	coach?: string;
	berth?: string;
	berthCode?: string;
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
 * Resiliently returns effective coach, berth, and clean status for a passenger.
 * If backend already provided coach & berth, those are used.
 * Otherwise, falls back to parsing from status and bookingStatus strings.
 */
export function getEffectiveCoachAndBerth(passenger?: Passenger): {
	coach?: string;
	berth?: string | number;
	cleanStatus: string;
} {
	if (!passenger) {
		return { cleanStatus: "No Status" };
	}

	let coach = passenger.coach?.trim();
	let berth = passenger.berth;
	const rawStatus = (passenger.status || "").trim();
	const rawBooking = (passenger.bookingStatus || "").trim();

	// If coach or berth is missing, attempt parsing from status
	if (!coach || !berth) {
		const fromStatus = parseCoachAndBerthFromString(rawStatus);
		if (fromStatus) {
			if (!coach && fromStatus.coach) coach = fromStatus.coach;
			if (!berth && fromStatus.berth) {
				berth = fromStatus.berthCode
					? `${fromStatus.berth} (${fromStatus.berthCode})`
					: fromStatus.berth;
			}
		}
	}

	// If still missing and status is confirmed, attempt parsing from booking status
	const isConfirmed =
		rawStatus.toUpperCase().includes("CNF") ||
		rawStatus.toUpperCase().includes("CONFIRM");

	if (isConfirmed && (!coach || !berth)) {
		const fromBooking = parseCoachAndBerthFromString(rawBooking);
		if (fromBooking) {
			if (!coach && fromBooking.coach) coach = fromBooking.coach;
			if (!berth && fromBooking.berth) {
				berth = fromBooking.berthCode
					? `${fromBooking.berth} (${fromBooking.berthCode})`
					: fromBooking.berth;
			}
		}
	}

	// Determine clean status display
	let cleanStatus = rawStatus;
	if (isConfirmed) {
		cleanStatus = "CNF";
	} else if (/^RAC\b/i.test(rawStatus)) {
		const racMatch = rawStatus.match(/^(RAC(?:\s*\d+)?)/i);
		cleanStatus =
			racMatch && racMatch[1] ? racMatch[1].toUpperCase() : "RAC";
	}

	return {
		coach: coach ? coach.toUpperCase() : undefined,
		berth,
		cleanStatus: cleanStatus || "No Status",
	};
}
