// 1. Agent Status
export type VoiceAgentStatus =
	| "idle" // Inactive, waiting for click or wake word
	| "listening" // User mic is active, capturing speech
	| "thinking" // Processing utterance via Puter AI / intent matcher
	| "executing" // Performing UI navigation, DOM click, or product API call
	| "observing" // Waiting for data load and reading screen results
	| "speaking" // Synthesizing & playing voice response via TTS
	| "error"; // Temporary error state (with auto-recovery)

// 2. Action Types across Snipit Products
export type VoiceActionType =
	| "NAVIGATE"
	| "CHECK_PNR"
	| "SEARCH_TRAINS"
	| "TRAIN_LIVE_STATUS"
	| "TRAIN_SCHEDULE"
	| "CONTROL_MUSIC"
	| "CREATE_SNIPPET"
	| "GENERATE_PASSWORD"
	| "CHANGE_THEME"
	| "DOM_CLICK"
	| "DOM_INPUT"
	| "NONE";

// 3. Action Payloads (Discriminated Union)
export type VoiceActionPayload =
	| { type: "NAVIGATE"; params: { path: string; label?: string } }
	| { type: "CHECK_PNR"; params: { pnr: string } }
	| {
			type: "SEARCH_TRAINS";
			params: { from: string; to: string; date?: string };
	  }
	| { type: "TRAIN_LIVE_STATUS"; params: { trainNo: string; day?: string } }
	| { type: "TRAIN_SCHEDULE"; params: { trainNo: string } }
	| {
			type: "CONTROL_MUSIC";
			params: {
				action: "play" | "pause" | "next" | "prev" | "search";
				query?: string;
			};
	  }
	| {
			type: "CREATE_SNIPPET";
			params: { title?: string; language?: string; content?: string };
	  }
	| {
			type: "GENERATE_PASSWORD";
			params: { length?: number; includeSymbols?: boolean };
	  }
	| { type: "CHANGE_THEME"; params: { theme: "dark" | "light" | "toggle" } }
	| { type: "DOM_CLICK"; params: { selector: string; description?: string } }
	| {
			type: "DOM_INPUT";
			params: {
				selector: string;
				value: string;
				submitSelector?: string;
			};
	  }
	| { type: "NONE"; params?: Record<string, unknown> };

// 4. Site Knowledge Manifest Schema
export interface ToolActionKnowledge {
	name: VoiceActionType;
	description: string;
	intentTriggers: string[];
	requiredParams: string[];
	optionalParams?: string[];
	domTarget?: {
		inputSelector?: string;
		submitSelector?: string;
		containerSelector?: string;
	};
	navigationTarget?: {
		path: string;
		tab?: string;
		paramMapping?: Record<string, string>; // Maps payload param to URL query param
	};
}

export interface ToolModuleKnowledge {
	id: string;
	name: string;
	route: string;
	description: string;
	summary: string; // 1-line summary for global injection
	actions: ToolActionKnowledge[];
}

// 5. Session Working Memory State
export interface ActiveEntityState {
	pnr?: string;
	trainNo?: string;
	fromStation?: string;
	toStation?: string;
	journeyDate?: string;
	snippetLanguage?: string;
	musicTrack?: string;
	theme?: "dark" | "light";
}

export interface PendingSlotState {
	actionType: VoiceActionType;
	missingParam: string;
	promptQuestion: string;
	collectedParams: Record<string, unknown>;
}

export interface ConversationTurn {
	role: "user" | "assistant";
	content: string;
	timestamp: number;
}

export interface SessionMemoryData {
	currentRoute: string;
	entities: ActiveEntityState;
	pendingSlot: PendingSlotState | null;
	history: ConversationTurn[];
}

// 6. Brain Decision Output Format
export interface BrainDecision {
	speech: string;
	action: VoiceActionPayload;
	updatedEntities?: Partial<ActiveEntityState>;
	pendingSlot?: PendingSlotState | null;
}
