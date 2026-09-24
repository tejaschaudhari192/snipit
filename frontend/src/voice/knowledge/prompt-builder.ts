import { SNIPIT_SITE_MANIFEST } from "./site-manifest";
import type { SessionMemoryData } from "../types/voice.types";
import { ScreenPerceiver } from "../engine/screen-perceiver";

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
	const isSnippetDisplay =
		currentPath !== "/" &&
		!currentPath.startsWith("/tools") &&
		!currentPath.startsWith("/login") &&
		!currentPath.startsWith("/signup") &&
		!currentPath.startsWith("/about") &&
		!currentPath.startsWith("/profile") &&
		!currentPath.startsWith("/history") &&
		!currentPath.startsWith("/explore");

	const relevantModules = SNIPIT_SITE_MANIFEST.filter(
		(t) =>
			t.route === "*" ||
			currentPath.startsWith(t.route) ||
			(t.route === "/" && currentPath === "/") ||
			(t.route === "/:id" && isSnippetDisplay),
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
			return `* Action: "${a.name}" (${a.description})\n  Triggers: ${a.intentTriggers.join(", ")}\n  ${params} ${optional}`;
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

	// 5. Active Screen Context (extracts live snippet, code, or DOM text)
	let screenContext = "";
	try {
		screenContext = ScreenPerceiver.extractSemanticText();
	} catch {
		// silent fallback
	}

	return `You are Snipit Voice Copilot, a helpful, hands-free assistant on Snipit.
Your goal is to converse naturally and execute real-time actions across the web application.
USER ACTIVE LANGUAGE: "${lang}". You MUST generate the "speech" field in this language (${lang}).

=== APPLICATION TOOLS ===
${toolSummaries}

=== ACTIONS RELEVANT TO CURRENT VIEW (${currentPath}) ===
${detailedActions}

=== ACTIVE CONTEXT ===
Current Route: ${currentPath}
Active Entities: { ${entitiesStr || "none"} }
${slotStr}

=== ACTIVE SCREEN CONTENT (WHAT THE USER SEES RIGHT NOW) ===
${screenContext || "No active content text detected on screen."}

=== RULES & OUTPUT FORMAT ===
1. You MUST ALWAYS respond with a VALID JSON object in this exact schema:
{
  "speech": "Spoken response. Clear, natural, and polite.",
  "action": {
    "type": "NAVIGATE" | "CHECK_PNR" | "SEARCH_TRAINS" | "TRAIN_LIVE_STATUS" | "TRAIN_SCHEDULE" | "CONTROL_MUSIC" | "CREATE_SNIPPET" | "GENERATE_PASSWORD" | "CHANGE_THEME" | "DOM_CLICK" | "DOM_INPUT" | "DELETE_PASTE" | "NONE",
    "params": { ... }
  },
  "updatedEntities": { "pnr": "...", "trainNo": "..." },
  "pendingSlot": null or { "actionType": "...", "missingParam": "...", "promptQuestion": "...", "collectedParams": {} }
}

2. IMPORTANT FOR SCREEN & PASTE QUESTIONS:
   - When the user asks about the opened paste, code, screen, or document (e.g., "tell about the paste is opened", "what is this paste", "what is on my screen", "explain this code", "summarize this snippet"):
     * Read and synthesize the ACTIVE SCREEN CONTENT above.
     * Describe what the paste is (title, language/type, and what the code or content does) directly in "speech".
     * Set "action.type" to "NONE".
     * NEVER navigate to /history or anywhere else unless the user explicitly said "go to history" or "navigate".

3. IMPORTANT FOR DELETE REQUESTS:
   - When the user asks to delete a paste or snippet:
     * If a specific snippet name or ID was specified (e.g. "delete paste snipit-awake", "delete snippet test-123"):
       Set "action.type" to "DELETE_PASTE" with "params": { "id": "<the_snippet_id_or_name>", "confirmed": true }.
     * If deleting the currently opened / on-screen paste ("delete paste", "delete this", "delete paste on screen"):
       Set "action.type" to "DELETE_PASTE" with "params": { "confirmed": true }.
     * In "speech", state that you are deleting the snippet.

4. Note for CREATE_SNIPPET: When the user asks to write, code, or generate any code or text (e.g., "write python code for even odd", "write a hello world script in javascript"), ALWAYS set "action.type": "CREATE_SNIPPET", specify "mode": "code" (or "text" / "docs"), "language": "python" (or "javascript", "html", etc.), and put the complete code in the "content" parameter! The app will automatically open the editor and write your code into it.

5. If a user asks to perform an action but is missing required parameters (e.g., they say "Check train status" without a train number, or "Check PNR" without a 10-digit PNR):
   - Set "action.type" to "NONE".
   - Set "pendingSlot" to record what is missing.
   - In "speech", ask the user for that specific missing parameter.
6. If the user provides the missing parameter, execute the action and set "pendingSlot" to null.
7. If the user is just saying hello or asking a question, set "action.type" to "NONE" and answer conversationally.
8. Never wrap JSON with markdown fences if possible; output raw JSON.`;
}
