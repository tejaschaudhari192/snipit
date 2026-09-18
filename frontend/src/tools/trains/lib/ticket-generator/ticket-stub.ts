import type { FormattedTicketData } from "./types";

/**
 * Builds the right-hand ticket stub in match pass style:
 * Prominent stacked journey date, ticket fare, authentic barcode with PNR number,
 * and 3-column COACH / BERTH / STATUS grid (matching SEAT / GATE / ROW in reference).
 */
export const buildTicketStubHtml = (data: FormattedTicketData): string => {
	// Barcode pattern with varied line thicknesses
	const barcodeLines = [
		2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4, 1, 2,
		3, 1, 2, 1, 4,
	]
		.map(
			(width) =>
				`<div style="height: 34px; width: ${width * 1.5}px; background: #0f172a; margin-right: 1.5px;"></div>`,
		)
		.join("");

	const hasMultiplePassengers = data.passengers.length > 1;

	return `
		<div style="width: 270px; background: #ffffff; color: #0f172a; padding: 24px 20px; display: flex; flex-direction: column; justify-content: space-between; flex-shrink: 0; box-sizing: border-box; border-left: 1px dashed #cbd5e1;">
			<!-- Top: Stacked Journey Date & Fare -->
			<div>
				<div style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b;">
					JOURNEY PASS
				</div>
				<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1.2; color: #0f172a; margin-top: 4px;">
					${data.departureDateStr}
				</div>
				<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
					<span style="font-size: 11px; font-weight: 700; color: #64748b;">
						START AT ${data.departureTime}
					</span>
					${
						data.ticketFare
							? `<span style="font-size: 12px; font-weight: 900; color: #0f172a; font-family: monospace;">FARE: ₹${data.ticketFare}</span>`
							: ""
					}
				</div>
			</div>

			<!-- Center: Authentic Barcode & PNR Number -->
			<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 8px 0;">
				<div style="display: flex; align-items: center; justify-content: center; overflow: hidden; width: 100%; max-width: 200px; height: 34px;">
					${barcodeLines}
				</div>
				<div style="font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 900; letter-spacing: 2px; color: #0f172a; margin-top: 5px; line-height: 1;">
					PNR: ${data.pnr}
				</div>
			</div>

			<!-- Bottom: 3-Column COACH / BERTH / STATUS Grid (Matching SEAT / GATE / ROW) -->
			<div>
				<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; padding: 8px 4px; border-top: 2px solid #0f172a; border-bottom: 1px solid #e2e8f0; text-align: center;">
					<div>
						<div style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
							COACH
						</div>
						<div style="font-family: Impact, 'Arial Black', sans-serif; font-size: 16px; font-weight: 900; line-height: 1.2; color: #0f172a; margin-top: 2px;">
							${data.primaryCoach}
						</div>
					</div>
					<div style="border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
						<div style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
							BERTH
						</div>
						<div style="font-family: Impact, 'Arial Black', sans-serif; font-size: 16px; font-weight: 900; line-height: 1.2; color: #0f172a; margin-top: 2px;">
							${data.primaryBerth}
						</div>
					</div>
					<div>
						<div style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
							STATUS
						</div>
						<div style="font-family: Impact, 'Arial Black', sans-serif; font-size: 15px; font-weight: 900; line-height: 1.2; color: ${
							data.isConfirmed ? "#16a34a" : "#ea580c"
						}; margin-top: 2px;">
							${data.primaryStatus}
						</div>
					</div>
				</div>

				${
					hasMultiplePassengers
						? `<div style="font-size: 10px; font-weight: 700; color: #64748b; text-align: center; margin-top: 4px; line-height: 1.2;">
							+${data.passengers.length - 1} more passenger${data.passengers.length > 2 ? "s" : ""} on ticket
						</div>`
						: ""
				}
			</div>
		</div>
	`;
};
