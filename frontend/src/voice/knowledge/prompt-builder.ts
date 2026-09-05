import { SNIPIT_SITE_MANIFEST } from "./site-manifest";
import type { SessionMemoryData } from "../types/voice.types";

export function buildSystemPrompt(
	memory: SessionMemoryData,
	lang = "en",
): string {
	const currentPath = memory.currentRoute || window.location.pathname;

	// 1. High-level 1-line tool summaries (always included)
	const toolSummaries = SNIPIT_SITE_MANIFEST.map(
		(t) => `- ${t.name} (${t.route}): ${t.summary}`,
	).join("\n");

	// 2. Deep-dive action details for matching or global tools
	const relevantModules = SNIPIT_SITE_MANIFEST.filter(
		(t) =>
			t.route === "*" ||
			currentPath.startsWith(t.route) ||
			(t.route === "/" && currentPath === "/"),
	);

	const detailedActions = relevantModules
		.flatMap((m) => m.actions)
		.map((a) => {
			const params =
				a.requiredParams.length > 0
					? `Required params: [${a.requiredParams.join(", ")}]`
					: "No required params";
			const optional = a.optionalParams
				? `Optional params: [${a.optionalParams.join(", ")}]`
				: "";
			return `* Action: "${a.name}"\n  Triggers: ${a.intentTriggers.slice(0, 4).join(", ")}\n  ${params} ${optional}`;
		})
		.join("\n");

	// 3. Active Entity state
	const entitiesStr = Object.entries(memory.entities)
		.filter(([, v]) => Boolean(v))
		.map(([k, v]) => `${k}: "${v}"`)
		.join(", ");

	// 4. Pending Slot
	const slotStr = memory.pendingSlot
		? `PENDING_SLOT: We are waiting for parameter "${memory.pendingSlot.missingParam}" for action "${memory.pendingSlot.actionType}". Question asked: "${memory.pendingSlot.promptQuestion}". Prior collected: ${JSON.stringify(memory.pendingSlot.collectedParams)}`
		: "PENDING_SLOT: None";

	return `You are Snipit Voice Copilot, a helpful, hands-free assistant on Snipit.
Your goal is to converse naturally and execute real-time actions across the web application.
USER ACTIVE LANGUAGE: "${lang}". You MUST generate the "speech" field in this language (${lang}).

=== APPLICATION TOOLS ===
${toolSummaries}

=== ACTIONS RELEVANT TO CURRENT VIEW (${currentPath}) ===
${detailedActions}

=== ACTIVE CONTEXT ===
Active Entities: { ${entitiesStr || "none"} }
${slotStr}

=== RULES & OUTPUT FORMAT ===
1. You MUST ALWAYS respond with a VALID JSON object in this exact schema:
{
  "speech": "Brief spoken response (under 20 words). Natural, polite.",
  "action": {
    "type": "NAVIGATE" | "CHECK_PNR" | "SEARCH_TRAINS" | "TRAIN_LIVE_STATUS" | "TRAIN_SCHEDULE" | "CONTROL_MUSIC" | "CREATE_SNIPPET" | "GENERATE_PASSWORD" | "CHANGE_THEME" | "DOM_CLICK" | "DOM_INPUT" | "NONE",
    "params": { ... }
  },
  "updatedEntities": { "pnr": "...", "trainNo": "..." },
  "pendingSlot": null or { "actionType": "...", "missingParam": "...", "promptQuestion": "...", "collectedParams": {} }
}

2. If a user asks to perform an action but is missing required parameters (e.g., they say "Check train status" without a train number, or "Check PNR" without a 10-digit PNR):
   - Set "action.type" to "NONE".
   - Set "pendingSlot" to record what is missing.
   - In "speech", ask the user for that specific missing parameter.
3. If the user provides the missing parameter, execute the action and set "pendingSlot" to null.
4. If the user is just saying hello or asking a question, set "action.type" to "NONE" and answer conversationally.
5. Never wrap JSON with markdown fences if possible; output raw JSON.`;
}
