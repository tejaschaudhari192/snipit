import type { PnrData } from "../../types/trains";
import {
	formatReadableTrainDate,
	getCrossDayOffset,
} from "../../utils/train-date-calculations";
import { getEffectiveCoachAndBerth } from "../../utils/pnr-helpers";

export interface FormattedTicketData {
	pnr: string;
	trainName: string;
	trainNumber: string;
	travelClass: string;
	chartStatus: string;
	ticketFare: string;
	fromStation: string;
	fromCode: string;
	toStation: string;
	toCode: string;
	departureTime: string;
	arrivalTime: string;
	departureDateStr: string;
	arrivalDateStr: string;
	duration: string;
	crossDayOffset: number;
	primaryCoach: string;
	primaryBerth: string;
	primaryStatus: string;
	isConfirmed: boolean;
	passengers: Array<{
		number: number;
		name: string;
		status: string;
		coach: string;
		berth: string;
		isCnf: boolean;
	}>;
}

/**
 * Normalizes PnrData into clean, formatted values for ticket rendering.
 */
export const formatTicketData = (data: PnrData): FormattedTicketData => {
	const crossDayOffset = getCrossDayOffset(
		data.departureDate || data.date,
		data.arrivalDate,
		data.boardingDayCount,
		data.arrivalDayCount,
	);

	const formatDate = (dateStr?: string): string => {
		if (!dateStr) return "--";
		const formatted = formatReadableTrainDate(dateStr);
		if (formatted) return formatted;
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString("en-IN", {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
			});
		} catch {
			return dateStr || "--";
		}
	};

	const primaryPax = data.passengers?.[0];
	const {
		coach: pCoach,
		berth: pBerth,
		cleanStatus: pStatus,
	} = primaryPax
		? getEffectiveCoachAndBerth(primaryPax)
		: { coach: undefined, berth: undefined, cleanStatus: undefined };

	const primaryStatus =
		pStatus || primaryPax?.status || data.chartStatus || "CONFIRMED";
	const isPrimaryCnf =
		primaryStatus.toLowerCase().includes("cnf") ||
		primaryStatus.toLowerCase().includes("confirm");
	const isPrimaryRac = primaryStatus.toLowerCase().includes("rac");
	const primaryCoachDisplay =
		(isPrimaryCnf || isPrimaryRac) && pCoach !== undefined
			? String(pCoach)
			: "--";
	const primaryBerthDisplay =
		(isPrimaryCnf || isPrimaryRac) && pBerth !== undefined
			? String(pBerth)
			: "--";

	const cleanTrainName = (data.train || "Express Special")
		.replace(/\(\d{4,5}\)/, "")
		.trim();

	// Sanitize travel class (e.g. "SLEEPER CLASS - GENERAL CLASS" -> "SLEEPER CLASS")
	let cleanClass = (data.class || "3A").trim();
	if (cleanClass.includes(" - ")) {
		cleanClass = cleanClass.split(" - ")[0].trim();
	}

	const passengers = (data.passengers || []).map((p) => {
		const { coach, berth, cleanStatus } = getEffectiveCoachAndBerth(p);
		const status = cleanStatus || p.status || "--";
		const isCnf =
			status.toLowerCase().includes("cnf") ||
			status.toLowerCase().includes("confirm");
		const isRac = status.toLowerCase().includes("rac");

		return {
			number: p.number,
			name: p.name || `Passenger ${p.number}`,
			status,
			coach: (isCnf || isRac) && coach ? `Coach ${coach}` : "--",
			berth: (isCnf || isRac) && berth ? `Berth ${berth}` : "--",
			isCnf,
		};
	});

	return {
		pnr: data.pnr || "0000000000",
		trainName: cleanTrainName,
		trainNumber: data.trainNumber || "",
		travelClass: cleanClass,
		chartStatus: data.chartStatus || "Chart Prepared",
		ticketFare: data.ticketFare ? String(data.ticketFare) : "",
		fromStation: data.from || "Origin Station",
		fromCode: data.fromCode || "",
		toStation: data.to || "Destination Station",
		toCode: data.toCode || "",
		departureTime: data.departure || "--:--",
		arrivalTime: data.arrival || "--:--",
		departureDateStr: formatDate(data.departureDate || data.date),
		arrivalDateStr: formatDate(data.arrivalDate || data.date),
		duration: data.duration || "Direct",
		crossDayOffset,
		primaryCoach: primaryCoachDisplay,
		primaryBerth: primaryBerthDisplay,
		primaryStatus,
		isConfirmed: isPrimaryCnf,
		passengers,
	};
};
