import html2canvas from "html2canvas";
import type { PnrData } from "../types/trains";

/**
 * Builds the exact HTML string for the ticket with all styles and content.
 */
const buildTicketHtml = (data: PnrData): string => {
	const formatJourneyDate = (dateStr?: string) => {
		if (!dateStr) return "--";
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString("en-IN", {
				weekday: "short",
				day: "numeric",
				month: "short",
				year: "numeric",
			});
		} catch {
			return dateStr || "--";
		}
	};

	const passengerRows = (data.passengers || [])
		.map(
			(p) => `
			<tr style="border-bottom: 1px solid #e2e8f0;">
				<td style="padding: 10px 14px; font-weight: 600;">#${p.number} ${p.name || `Passenger ${p.number}`}</td>
				<td style="padding: 10px 14px; font-family: monospace; color: #475569;">${p.bookingStatus || "--"}</td>
				<td style="padding: 10px 14px; font-weight: 700; color: ${
					(p.status || "").toLowerCase().includes("cnf") ||
					(p.status || "").toLowerCase().includes("confirm")
						? "#15803d"
						: (p.status || "").toLowerCase().includes("rac")
							? "#d97706"
							: "#b91c1c"
				};">${p.status}</td>
				<td style="padding: 10px 14px; font-family: monospace;">${p.coach ? `Coach ${p.coach}` : "--"}</td>
				<td style="padding: 10px 14px; font-family: monospace;">${p.berth ? `Berth ${p.berth}` : "--"}</td>
			</tr>
		`,
		)
		.join("");

	return `
		<div id="pnr-ticket-root" style="border: 2px solid #0284c7; border-radius: 14px; overflow: hidden; background: #ffffff; max-width: 800px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; color: #0f172a;">
			<div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center;">
				<div>
					<div style="font-size: 19px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">INDIAN RAILWAYS / IRCTC</div>
					<div style="font-size: 11px; opacity: 0.9; margin-top: 2px;">Electronic Reservation Slip (ERS) • Valid with Original Photo ID</div>
				</div>
				<div style="background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 8px; padding: 6px 14px; text-align: right;">
					<div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.85;">PNR Number</div>
					<div style="font-family: monospace; font-size: 19px; font-weight: 900; letter-spacing: 1.5px;">${data.pnr}</div>
				</div>
			</div>

			<div style="background: #f0f9ff; border-bottom: 1px solid #bae6fd; padding: 12px 22px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 14px; font-size: 12px;">
				<div style="display: flex; flex-direction: column;">
					<span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Train Number & Name</span>
					<span style="font-weight: 700; color: #0f172a;">${data.trainNumber ? `#${data.trainNumber} - ` : ""}${data.train}</span>
				</div>
				<div style="display: flex; flex-direction: column;">
					<span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Travel Class</span>
					<span style="font-weight: 700; color: #0f172a;">${data.class}</span>
				</div>
				<div style="display: flex; flex-direction: column;">
					<span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Journey Date</span>
					<span style="font-weight: 700; color: #0f172a;">${formatJourneyDate(data.departureDate || data.date)}</span>
				</div>
				<div style="display: flex; flex-direction: column;">
					<span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Chart Status</span>
					<span style="font-weight: 700; color: #0f172a;">${data.chartStatus || "Chart Not Prepared"}</span>
				</div>
				${
					data.ticketFare
						? `
				<div style="display: flex; flex-direction: column;">
					<span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Fare</span>
					<span style="font-weight: 700; color: #0f172a;">₹${data.ticketFare}</span>
				</div>
				`
						: ""
				}
			</div>

			<div style="padding: 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #cbd5e1; background: #fafafa;">
				<div style="flex: 1;">
					<div style="font-size: 22px; font-weight: 900; color: #0f172a;">${data.from}</div>
					<div style="font-size: 15px; color: #0284c7; font-weight: 700; margin-top: 2px;">Departure: ${data.departure || "--:--"}</div>
					<div style="font-size: 11px; color: #64748b;">${formatJourneyDate(data.departureDate || data.date)}</div>
				</div>
				<div style="padding: 0 18px; text-align: center; color: #64748b; font-size: 11px; font-weight: 600;">
					<div>${data.duration || "Direct"}</div>
					<div style="width: 80px; height: 2px; background: #94a3b8; margin: 4px auto; position: relative;"></div>
					<div>${data.expectedPlatformNo ? `Platform #${data.expectedPlatformNo}` : "Platform TBA"}</div>
				</div>
				<div style="flex: 1; text-align: right;">
					<div style="font-size: 22px; font-weight: 900; color: #0f172a;">${data.to}</div>
					<div style="font-size: 15px; color: #0284c7; font-weight: 700; margin-top: 2px;">Arrival: ${data.arrival || "--:--"}</div>
					<div style="font-size: 11px; color: #64748b;">${formatJourneyDate(data.arrivalDate || data.date)}</div>
				</div>
			</div>

			<div style="padding: 18px 22px;">
				<div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Passenger Details & Booking Status</div>
				<table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
					<thead>
						<tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
							<th style="padding: 8px 14px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569;">Passenger</th>
							<th style="padding: 8px 14px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569;">Booking Status</th>
							<th style="padding: 8px 14px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569;">Current Status</th>
							<th style="padding: 8px 14px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569;">Coach</th>
							<th style="padding: 8px 14px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569;">Berth</th>
						</tr>
					</thead>
					<tbody>
						${passengerRows}
					</tbody>
				</table>
			</div>

			<div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
				<div>
					<strong>Generated via Snipit</strong> • Check coach display board before boarding.
				</div>
				<div style="font-family: monospace; letter-spacing: 4px; font-size: 13px; color: #0f172a; font-weight: bold;">
					||||| | |||| ||| |||||
				</div>
			</div>
		</div>
	`;
};

/**
 * Downloads the exact HTML-styled ticket as a high-resolution PNG image.
 */
export const downloadPnrTicketPng = async (data: PnrData): Promise<void> => {
	const ticketHtml = buildTicketHtml(data);
	const wrapper = document.createElement("div");
	wrapper.id = "snipit-ticket-export-container";
	wrapper.style.position = "fixed";
	wrapper.style.left = "0px";
	wrapper.style.top = "0px";
	wrapper.style.width = "800px";
	wrapper.style.opacity = "0.01"; // Non-zero opacity avoids browsers skipping rendering tree
	wrapper.style.pointerEvents = "none";
	wrapper.style.zIndex = "-99999";
	wrapper.style.backgroundColor = "#ffffff";
	wrapper.innerHTML = ticketHtml;
	document.body.appendChild(wrapper);

	try {
		// Wait a browser tick for DOM layout and styling calculation
		await new Promise((r) => setTimeout(r, 60));

		const ticketEl =
			(wrapper.querySelector("#pnr-ticket-root") as HTMLElement) ||
			(wrapper.firstElementChild as HTMLElement) ||
			wrapper;

		const canvas = await html2canvas(ticketEl, {
			scale: 2,
			useCORS: true,
			allowTaint: true,
			backgroundColor: "#ffffff",
			logging: false,
			windowWidth: 1024,
		});

		// Trigger PNG download using DataURL or Blob
		const triggerDownload = (url: string) => {
			const a = document.createElement("a");
			a.href = url;
			a.download = `PNR_${data.pnr}_Ticket.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		};

		if (canvas.toBlob) {
			await new Promise<void>((resolve) => {
				canvas.toBlob((blob) => {
					if (blob) {
						const URL_API =
							window.URL || window.webkitURL || window;
						const url = URL_API.createObjectURL(blob);
						triggerDownload(url);
						setTimeout(() => URL_API.revokeObjectURL(url), 2000);
					} else {
						triggerDownload(canvas.toDataURL("image/png"));
					}
					resolve();
				}, "image/png");
			});
		} else {
			triggerDownload(canvas.toDataURL("image/png"));
		}
	} finally {
		if (document.body.contains(wrapper)) {
			document.body.removeChild(wrapper);
		}
	}
};

/**
 * Generates an IRCTC-style printable Electronic Reservation Slip (ERS) / Ticket PDF
 * via the browser print/PDF subsystem for authentic styling and pixel-perfect fidelity.
 */
export const downloadPnrTicketPdf = (data: PnrData): void => {
	const printWindow = window.open("", "_blank");
	if (!printWindow) {
		window.print();
		return;
	}

	const ticketHtml = buildTicketHtml(data);

	printWindow.document.write(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="utf-8" />
			<title>PNR_${data.pnr}_Ticket</title>
			<style>
				@page {
					size: A4 portrait;
					margin: 12mm;
				}
				* {
					box-sizing: border-box;
					-webkit-print-color-adjust: exact !important;
					print-color-adjust: exact !important;
				}
				body {
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
					color: #0f172a;
					background: #ffffff;
					margin: 0;
					padding: 16px;
				}
			</style>
		</head>
		<body>
			${ticketHtml}
			<script>
				window.onload = () => {
					setTimeout(() => {
						window.print();
						window.close();
					}, 400);
				};
			</script>
		</body>
		</html>
	`);
	printWindow.document.close();
};
