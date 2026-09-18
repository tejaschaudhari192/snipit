import html2canvas from "html2canvas";
import type { PnrData } from "../types/trains";
import { buildTicketHtml } from "./ticket-generator/ticket-builder";

/**
 * Downloads the match-pass styled ticket as a high-resolution PNG image.
 * Uses an isolated hidden iframe to isolate the ticket markup completely from
 * document-level Tailwind CSS variables and unsupported modern color formats like `oklch`.
 */
export const downloadPnrTicketPng = async (data: PnrData): Promise<void> => {
	const ticketHtml = buildTicketHtml(data);

	// Create an isolated iframe to completely detach from parent document styles/CSS variables
	const iframe = document.createElement("iframe");
	iframe.style.position = "fixed";
	iframe.style.left = "0";
	iframe.style.top = "0";
	iframe.style.width = "900px";
	iframe.style.height = "700px";
	iframe.style.opacity = "0.01";
	iframe.style.pointerEvents = "none";
	iframe.style.zIndex = "-99999";
	iframe.style.border = "none";
	document.body.appendChild(iframe);

	try {
		const iframeDoc =
			iframe.contentDocument || iframe.contentWindow?.document;
		if (!iframeDoc) {
			throw new Error("Unable to access ticket render iframe");
		}

		iframeDoc.open();
		iframeDoc.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8" />
				<style>
					*, *::before, *::after {
						box-sizing: border-box;
					}
					html, body {
						margin: 0;
						padding: 16px;
						background-color: #f8fafc;
						color: #0f172a;
						font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
					}
				</style>
			</head>
			<body>
				${ticketHtml}
			</body>
			</html>
		`);
		iframeDoc.close();

		// Wait for iframe rendering
		await new Promise((r) => setTimeout(r, 120));

		const ticketEl =
			(iframeDoc.querySelector("#pnr-ticket-root") as HTMLElement) ||
			iframeDoc.body;

		const canvas = await html2canvas(ticketEl, {
			scale: 2,
			useCORS: true,
			allowTaint: true,
			backgroundColor: null,
			logging: false,
		});

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
		if (document.body.contains(iframe)) {
			document.body.removeChild(iframe);
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
