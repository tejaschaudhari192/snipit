export interface PnrTicketSharedEmailData {
	pnr: string;
	trainName: string;
	trainNumber: string;
	travelClass?: string | undefined;
	from: string;
	fromCode?: string | undefined;
	to: string;
	toCode?: string | undefined;
	departureDate?: string | undefined;
	departureTime?: string | undefined;
	arrivalDate?: string | undefined;
	arrivalTime?: string | undefined;
	passengers?:
		| Array<{
				number: number;
				name?: string | undefined;
				coach?: string | undefined;
				berth?: string | number | undefined;
				status: string;
		  }>
		| undefined;
	senderName?: string | undefined;
	senderEmail?: string | undefined;
	note?: string | undefined;
	alertsSubscribed?: boolean | undefined;
	pnrUrl: string;
}

export const PNR_TICKET_SHARED = (data: PnrTicketSharedEmailData) => {
	const senderHeader = data.senderName
		? `${data.senderName} shared an IRCTC Train Ticket with you`
		: "A train ticket has been shared with you";

	const passengerRows = (data.passengers || [])
		.map((p) => {
			const isCnf =
				p.status.toLowerCase().includes("cnf") ||
				p.status.toLowerCase().includes("confirm");
			const statusColor = isCnf ? "#16a34a" : "#ea580c";

			return `
				<tr style="border-bottom: 1px solid #e4e4e7;">
					<td style="padding: 10px 14px; font-weight: 600; color: #18181b;">#${p.number} ${p.name || `Passenger ${p.number}`}</td>
					<td style="padding: 10px 14px; font-family: monospace; color: #52525b; text-align: center;">${p.coach || "--"}</td>
					<td style="padding: 10px 14px; font-family: monospace; color: #52525b; text-align: center;">${p.berth ? String(p.berth) : "--"}</td>
					<td style="padding: 10px 14px; font-weight: 700; font-family: monospace; text-align: right; color: ${statusColor};">${p.status}</td>
				</tr>
			`;
		})
		.join("");

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Train Ticket Shared - PNR: ${data.pnr}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.06);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 26px 28px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8;">Snipit Trains Portal • ERS Ticket</span>
                                ${data.travelClass ? `<span style="display: inline-block; padding: 3px 10px; border-radius: 6px; background-color: rgba(249, 115, 22, 0.2); border: 1px solid #f97316; color: #fb923c; font-size: 11px; font-weight: 800;">${data.travelClass}</span>` : ""}
                            </div>
                            <h1 style="margin: 14px 0 4px 0; font-size: 22px; font-weight: 900; color: #ffffff;">${data.trainName}</h1>
                            <div style="font-size: 13px; color: #cbd5e1;">Train #${data.trainNumber} • PNR: <strong style="color: #38bdf8; font-family: monospace; letter-spacing: 1px;">${data.pnr}</strong></div>
                        </td>
                    </tr>

                    <!-- Sender Intro Notice -->
                    <tr>
                        <td style="padding: 16px 28px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155;">
                            <strong>${senderHeader}</strong>
                            ${data.note ? `<div style="margin-top: 6px; padding: 10px 14px; background: #ffffff; border-left: 3px solid #f97316; border-radius: 4px; font-style: italic; color: #475569;">"${data.note}"</div>` : ""}
                        </td>
                    </tr>

                    <!-- Route & Station Details -->
                    <tr>
                        <td style="padding: 22px 28px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td width="44%" valign="top">
                                        <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Origin</div>
                                        <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">${data.from} ${data.fromCode ? `[${data.fromCode}]` : ""}</div>
                                        <div style="font-size: 15px; font-weight: 800; color: #0284c7; font-family: monospace; margin-top: 2px;">${data.departureTime || "--:--"}</div>
                                        ${data.departureDate ? `<div style="font-size: 11px; color: #64748b; margin-top: 1px;">${data.departureDate}</div>` : ""}
                                    </td>
                                    <td width="12%" align="center" style="font-size: 20px; font-weight: 900; color: #f97316;">➔</td>
                                    <td width="44%" valign="top" align="right">
                                        <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Destination</div>
                                        <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">${data.to} ${data.toCode ? `[${data.toCode}]` : ""}</div>
                                        <div style="font-size: 15px; font-weight: 800; color: #0284c7; font-family: monospace; margin-top: 2px;">${data.arrivalTime || "--:--"}</div>
                                        ${data.arrivalDate ? `<div style="font-size: 11px; color: #64748b; margin-top: 1px;">${data.arrivalDate}</div>` : ""}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Passengers Manifest -->
                    ${
						passengerRows
							? `
                    <tr>
                        <td style="padding: 20px 28px;">
                            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Passenger Details & Status</div>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 12px; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background: #f8fafc; border-bottom: 2px solid #e4e4e7;">
                                        <th style="padding: 8px 14px; text-align: left; font-weight: 800; color: #475569;">PASSENGER</th>
                                        <th style="padding: 8px 14px; text-align: center; font-weight: 800; color: #475569;">COACH</th>
                                        <th style="padding: 8px 14px; text-align: center; font-weight: 800; color: #475569;">BERTH</th>
                                        <th style="padding: 8px 14px; text-align: right; font-weight: 800; color: #475569;">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${passengerRows}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    `
							: ""
					}

                    <!-- Status Alerts Notice (if enabled) -->
                    ${
						data.alertsSubscribed
							? `
                    <tr>
                        <td style="padding: 0 28px 16px 28px;">
                            <div style="padding: 12px 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 12px; color: #065f46; display: flex; align-items: center; gap: 8px;">
                                <span>🔔 <strong>Automated Alerts Active:</strong> You are subscribed to real-time status updates. You will be emailed automatically whenever the chart is prepared or passenger status changes.</span>
                            </div>
                        </td>
                    </tr>
                    `
							: ""
					}

                    <!-- Live PNR CTA Button -->
                    <tr>
                        <td style="padding: 12px 28px 26px 28px; text-align: center;">
                            <a href="${data.pnrUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; letter-spacing: -0.01em;">View Live Ticket & Status</a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 16px 28px; background-color: #f8fafc; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
                            © 2026 Snipit Trains • Automated Railway Intelligence
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};
