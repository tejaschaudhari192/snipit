import type { PnrData } from "../../types/trains";
import { formatTicketData } from "./types";
import { buildTicketBodyHtml } from "./ticket-body";
import { buildTicketPerforationHtml } from "./ticket-perforation";
import { buildTicketStubHtml } from "./ticket-stub";

/**
 * Builds the complete match-pass ticket HTML structure for rendering and PNG download.
 * Perfectly balanced 2-panel architecture:
 * Left Main Body (Dark Navy) + Vertical Perforation + Right Stub (White).
 */
export const buildTicketHtml = (rawPnrData: PnrData): string => {
	const data = formatTicketData(rawPnrData);

	const bodyHtml = buildTicketBodyHtml(data);
	const perforationHtml = buildTicketPerforationHtml();
	const stubHtml = buildTicketStubHtml(data);

	return `
		<div id="pnr-ticket-root" style="width: 860px; margin: 0 auto; border-radius: 16px; overflow: hidden; background: #0f172a; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box; border: 2px solid #0f172a;">
			<!-- Main Horizontal Match Ticket (Body + Perforation + Stub) -->
			<div style="display: flex; min-height: 335px; width: 100%; position: relative; background: #0f172a; align-items: stretch;">
				${bodyHtml}
				${perforationHtml}
				${stubHtml}
			</div>
		</div>
	`;
};
