export interface PnrStatusUpdateEmailData {
	pnr: string;
	trainName: string;
	trainNumber: string;
	from: string;
	to: string;
	departureDate?: string;
	changes: string[];
	isConfirmed?: boolean;
	isChartPrepared?: boolean;
	pnrUrl: string;
}

export const PNR_STATUS_UPDATE = (data: PnrStatusUpdateEmailData) => {
	const changeBadgeBg = data.isConfirmed
		? "#10b981"
		: data.isChartPrepared
			? "#8b5cf6"
			: "#f59e0b";
	const badgeLabel = data.isConfirmed
		? "CONFIRMED UPDATE"
		: data.isChartPrepared
			? "CHART PREPARED"
			: "STATUS UPDATE";

	const changesList = data.changes
		.map(
			(c) =>
				`<li style="margin-bottom: 8px; font-weight: 500; color: #18181b;">${c}</li>`,
		)
		.join("");

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PNR Status Update - ${data.pnr}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 24px; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); color: #ffffff;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #a1a1aa;">Snipit Trains Portal</span>
                                <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background-color: ${changeBadgeBg}; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.04em;">${badgeLabel}</span>
                            </div>
                            <h1 style="margin: 12px 0 4px 0; font-size: 22px; font-weight: 800; color: #ffffff;">PNR: ${data.pnr}</h1>
                            <p style="margin: 0; font-size: 14px; color: #d4d4d8;">${data.trainName} (#${data.trainNumber})</p>
                        </td>
                    </tr>

                    <!-- Route & Date Card -->
                    <tr>
                        <td style="padding: 20px 24px; background-color: #fafafa; border-bottom: 1px solid #f4f4f5;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td width="45%" valign="top">
                                        <div style="font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase;">From</div>
                                        <div style="font-size: 14px; font-weight: 700; color: #18181b; margin-top: 2px;">${data.from || "Source"}</div>
                                    </td>
                                    <td width="10%" align="center" style="font-size: 16px; color: #a1a1aa;">➔</td>
                                    <td width="45%" valign="top" align="right">
                                        <div style="font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase;">To</div>
                                        <div style="font-size: 14px; font-weight: 700; color: #18181b; margin-top: 2px;">${data.to || "Destination"}</div>
                                    </td>
                                </tr>
                            </table>
                            ${data.departureDate ? `<div style="margin-top: 8px; font-size: 12px; color: #71717a; text-align: center;">Journey Date: <strong style="color: #18181b;">${data.departureDate}</strong></div>` : ""}
                        </td>
                    </tr>

                    <!-- Changes Content -->
                    <tr>
                        <td style="padding: 24px;">
                            <h2 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #09090b;">Recent Changes Detected:</h2>
                            <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; line-height: 1.5; color: #27272a;">
                                ${changesList}
                            </ul>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                <tr>
                                    <td align="center">
                                        <a href="${data.pnrUrl}" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; letter-spacing: -0.01em;">Check Live PNR Status</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 20px 0 0 0; font-size: 12px; color: #a1a1aa; text-align: center; line-height: 1.4;">
                                You are receiving this automated alert because you enabled Hourly PNR Tracking on Snipit. Checks run hourly while your ticket is unconfirmed.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 16px 24px; background-color: #f4f4f5; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7;">
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
