import type {
	IPnrStatusSnapshot,
	IPnrDiffResult,
} from "../types/pnr-tracking.types.js";
import type { PnrData } from "../types/trains.types.js";

export class PnrDiffService {
	/**
	 * Convert live PnrData into an IPnrStatusSnapshot
	 */
	public static createSnapshot(pnrData: PnrData): IPnrStatusSnapshot {
		return {
			chartStatus: pnrData.chartStatus,
			coachPosition: pnrData.coachPosition,
			expectedPlatformNo: pnrData.expectedPlatformNo,
			passengers: (pnrData.passengers || []).map((pax) => ({
				number: pax.number,
				name: pax.name,
				status: pax.status,
				bookingStatus: pax.bookingStatus,
				confirmTktStatus: pax.confirmTktStatus,
				coach: pax.coach,
				berth: pax.berth,
			})),
			capturedAt: new Date(),
		};
	}

	/**
	 * Compare previous snapshot with current live status and extract meaningful changes
	 */
	public static diff(
		previous: IPnrStatusSnapshot | undefined,
		current: PnrData,
	): IPnrDiffResult {
		const changes: string[] = [];
		let isConfirmed = false;
		let isChartPrepared = false;

		if (!previous) {
			return {
				hasChanged: false,
				changes: [],
				changeSummary: "Initial status captured",
				isConfirmed: false,
				isChartPrepared: false,
			};
		}

		// 1. Chart Preparation status check
		const prevChart = (previous.chartStatus || "").trim().toLowerCase();
		const currChart = (current.chartStatus || "").trim().toLowerCase();
		if (prevChart && currChart && prevChart !== currChart) {
			if (currChart.includes("prepared") && !currChart.includes("not")) {
				changes.push(`Reservation Chart has been prepared!`);
				isChartPrepared = true;
			} else {
				changes.push(`Chart Status changed: ${current.chartStatus}`);
			}
		}

		// 2. Passenger status changes
		const prevPaxMap = new Map(
			(previous.passengers || []).map((p) => [p.number, p]),
		);

		for (const currPax of current.passengers || []) {
			const prevPax = prevPaxMap.get(currPax.number);
			if (!prevPax) {
				continue;
			}

			const prevStat = (prevPax.status || "").trim();
			const currStat = (currPax.status || "").trim();
			const prevCoachBerth = [prevPax.coach, prevPax.berth]
				.filter(Boolean)
				.join("/");
			const currCoachBerth = [currPax.coach, currPax.berth]
				.filter(Boolean)
				.join("/");

			const statusChanged =
				prevStat.toLowerCase() !== currStat.toLowerCase();
			const coachBerthChanged =
				currCoachBerth && prevCoachBerth !== currCoachBerth;

			const isNowConfirmed =
				currStat.toUpperCase().includes("CNF") ||
				currStat.toUpperCase().includes("CONFIRM");

			if (statusChanged || coachBerthChanged) {
				if (isNowConfirmed) {
					isConfirmed = true;
					const allocation = currCoachBerth
						? ` (Coach ${currPax.coach}, Berth ${currPax.berth})`
						: "";
					changes.push(
						`Passenger ${currPax.number} (${currPax.name || "Traveller"}): Status updated from ${prevStat || "Waiting"} to CONFIRMED${allocation}`,
					);
				} else if (currStat.toUpperCase().includes("RAC")) {
					changes.push(
						`Passenger ${currPax.number} (${currPax.name || "Traveller"}): Moved to RAC (${currStat})`,
					);
				} else {
					changes.push(
						`Passenger ${currPax.number} (${currPax.name || "Traveller"}): Status updated from ${prevStat} to ${currStat}`,
					);
				}
			}
		}

		// 3. Platform change check
		if (
			current.expectedPlatformNo &&
			previous.expectedPlatformNo &&
			current.expectedPlatformNo !== previous.expectedPlatformNo
		) {
			changes.push(
				`Expected platform changed from Platform ${previous.expectedPlatformNo} to Platform ${current.expectedPlatformNo}`,
			);
		}

		const hasChanged = changes.length > 0;
		const changeSummary = hasChanged
			? isConfirmed
				? "Ticket status confirmed!"
				: isChartPrepared
					? "Reservation chart prepared"
					: changes[0] || "Status update detected"
			: "No change detected";

		return {
			hasChanged,
			changes,
			changeSummary,
			isConfirmed,
			isChartPrepared,
		};
	}
}

export default PnrDiffService;
