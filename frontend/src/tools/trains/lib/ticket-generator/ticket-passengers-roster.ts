import type { FormattedTicketData } from "./types";

/**
 * Builds the compact passenger manifest table rendered inside the main ticket body,
 * only included when there are multiple passengers booked under the PNR.
 */
export const buildTicketPassengersRosterHtml = (
	data: FormattedTicketData,
): string => {
	if (data.passengers.length <= 1) {
		return "";
	}

	const rows = data.passengers
		.map(
			(p) => `
		<tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
			<td style="padding: 6px 10px; font-weight: 700; color: #ffffff;">#${p.number} ${p.name}</td>
			<td style="padding: 6px 10px; font-family: monospace; color: #cbd5e1; text-align: center;">${p.coach}</td>
			<td style="padding: 6px 10px; font-family: monospace; color: #cbd5e1; text-align: center;">${p.berth}</td>
			<td style="padding: 6px 10px; font-weight: 800; font-family: monospace; text-align: right; color: ${
				p.isCnf ? "#4ade80" : "#fb923c"
			};">${p.status}</td>
		</tr>
	`,
		)
		.join("");

	return `
		<div style="position: relative; z-index: 2; margin: 12px 0 6px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 10px 14px; box-sizing: border-box;">
			<div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px; padding-left: 2px;">
				Passenger Manifest (${data.passengers.length} Passengers)
			</div>
			<table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
				<thead>
					<tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); color: #94a3b8;">
						<th style="padding: 4px 10px; font-weight: 800;">PASSENGER</th>
						<th style="padding: 4px 10px; font-weight: 800; text-align: center;">COACH</th>
						<th style="padding: 4px 10px; font-weight: 800; text-align: center;">BERTH</th>
						<th style="padding: 4px 10px; font-weight: 800; text-align: right;">STATUS</th>
					</tr>
				</thead>
				<tbody>
					${rows}
				</tbody>
			</table>
		</div>
	`;
};
