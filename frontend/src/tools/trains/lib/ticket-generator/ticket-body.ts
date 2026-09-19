import type { FormattedTicketData } from "./types";
import { buildTicketPassengersRosterHtml } from "./ticket-passengers-roster";

/**
 * Builds the left main body of the ticket in authentic match/boarding pass style.
 * Uses specific train name (e.g. AMARAVATHI EXP Ticket), centered class box,
 * route matchup with "TO" and boxed +xd badge, and integrated passenger manifest.
 */
export const buildTicketBodyHtml = (data: FormattedTicketData): string => {
	const rosterHtml = buildTicketPassengersRosterHtml(data);

	return `
		<div style="flex: 1; min-width: 0; position: relative; background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%); color: #ffffff; padding: 26px 28px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
			<!-- Decorative Background Locomotive Train Watermark -->
			<svg style="position: absolute; bottom: -20px; left: -15px; width: 230px; height: 230px; opacity: 0.05; pointer-events: none; transform: rotate(-5deg);" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5">
				<rect x="4" y="3" width="16" height="16" rx="2" />
				<path d="M4 11h16" />
				<path d="M12 3v8" />
				<path d="m8 19-2 3" />
				<path d="m18 22-2-3" />
				<circle cx="8" cy="15" r="1" fill="#ffffff" />
				<circle cx="16" cy="15" r="1" fill="#ffffff" />
			</svg>

			<!-- Top Header: Specific Train Name + Centered Class Badge Box -->
			<div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: flex-start;">
				<div>
					<div style="font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8;">
						INDIAN RAILWAYS • SNIPIT E-TICKET
					</div>
					<div style="display: flex; align-items: baseline; gap: 8px; margin-top: 3px;">
						<span style="font-family: Impact, 'Arial Black', -apple-system, sans-serif; font-size: 30px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.1; color: #ffffff;">
							${data.trainName}
						</span>
						<span style="font-family: 'Brush Script MT', 'Segoe Script', cursive, sans-serif; font-size: 25px; font-weight: 700; color: #f97316; font-style: italic; line-height: 1;">
							Ticket
						</span>
					</div>
				</div>

				<div style="text-align: right; flex-shrink: 0; margin-left: 12px; margin-top: 2px;">
					<!-- Class Badge -->
					<div style="display: inline-flex; align-items: center; justify-content: center; height: 26px; padding: 0 12px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 6px; font-size: 11px; font-weight: 700; color: #f1f5f9; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; line-height: 26px; text-align: center; box-sizing: border-box;">
						${data.travelClass}
					</div>
				</div>
			</div>

			<!-- Center: Matchup Route (ORIGIN TO DESTINATION) -->
			<div style="position: relative; z-index: 2; margin: 16px 0; padding: 14px 20px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px;">
				<div style="display: flex; justify-content: space-between; align-items: center; gap: 14px;">
					<!-- Origin -->
					<div style="flex: 1; min-width: 0;">
						<div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
							ORIGIN ${data.fromCode ? `[${data.fromCode}]` : ""}
						</div>
						<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 900; line-height: 1.3; color: #ffffff; text-transform: uppercase; margin-top: 3px; padding-bottom: 2px;">
							${data.fromStation}
						</div>
						<div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #38bdf8; line-height: 1.2; margin-top: 2px;">
							${data.departureTime}
						</div>
						<div style="font-size: 11px; color: #cbd5e1; margin-top: 2px; line-height: 1.2;">
							${data.departureDateStr}
						</div>
					</div>

					<!-- Route TO & Duration -->
					<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 10px; flex-shrink: 0;">
						<span style="font-family: Impact, 'Arial Black', sans-serif; font-size: 30px; font-weight: 900; font-style: italic; color: #f97316; line-height: 1; letter-spacing: 1px;">
							TO
						</span>
						<span style="font-size: 10px; font-weight: 800; color: #cbd5e1; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); padding: 3px 10px; border-radius: 12px; margin-top: 4px; white-space: nowrap;">
							${data.duration}
						</span>
					</div>

					<!-- Destination -->
					<div style="flex: 1; min-width: 0; text-align: right;">
						<div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
							${data.toCode ? `[${data.toCode}]` : ""} DESTINATION
						</div>
						<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 900; line-height: 1.3; color: #ffffff; text-transform: uppercase; margin-top: 3px; padding-bottom: 2px;">
							${data.toStation}
						</div>
						<div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 3px;">
							<span style="font-size: 18px; font-weight: 900; font-family: monospace; color: #38bdf8; line-height: 1;">
								${data.arrivalTime}
							</span>
							${
								data.crossDayOffset > 0
									? `<!-- Sleek +xd Badge -->
									<span style="display: inline-flex; align-items: center; justify-content: center; height: 18px; padding: 0 6px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 4px; color: #38bdf8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 800; line-height: 18px; text-align: center; box-sizing: border-box; white-space: nowrap;">+${data.crossDayOffset}d</span>`
									: ""
							}
						</div>
						<div style="font-size: 11px; color: #cbd5e1; margin-top: 3px; line-height: 1.2;">
							${data.arrivalDateStr}
						</div>
					</div>
				</div>
			</div>

			<!-- Attached Passenger Roster (Only rendered when > 1 passenger) -->
			${rosterHtml}

			<!-- Bottom Footer: Train Number + Chart Status -->
			<div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center; font-size: 12px; border-top: 1px solid rgba(255, 255, 255, 0.12); padding-top: 10px; margin-top: 6px;">
				<div style="font-weight: 700; color: #f1f5f9; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.4;">
					TRAIN NO: #${data.trainNumber || "---"} • ERS RESERVATION
				</div>
				<div style="font-size: 11px; font-weight: 800; color: ${
					data.chartStatus.toLowerCase().includes("prepared") &&
					!data.chartStatus.toLowerCase().includes("not")
						? "#4ade80"
						: "#fbbf24"
				}; text-transform: uppercase; letter-spacing: 0.5px;">
					● ${data.chartStatus}
				</div>
			</div>
		</div>
	`;
};
