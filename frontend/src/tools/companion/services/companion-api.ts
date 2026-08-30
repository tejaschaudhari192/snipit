import api from "@/lib/api";

export interface CompanionMemory {
	id: string;
	category: "fact" | "preference" | "story" | "inside_joke" | "observation";
	key: string;
	detail: string;
	importance?: number;
	createdAt: string | Date;
}

export interface CompanionMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: string | Date;
}

export interface UnresolvedThread {
	topic: string;
	dateMentioned: string | Date;
	resolved: boolean;
}

export interface CompanionSessionData {
	companionName: string;
	stage: "Discovery" | "Confidant" | "Intimate";
	mood: string;
	metrics: {
		turns: number;
		fondness: number;
		friction: number;
		intimacyScore: number;
	};
	memories: CompanionMemory[];
	messages: CompanionMessage[];
	unresolvedThreads: UnresolvedThread[];
}

const LOCAL_STORAGE_KEY = "snipit_companion_session_v2";

export const getLocalCompanionSession = (): CompanionSessionData => {
	try {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (raw) {
			return JSON.parse(raw);
		}
	} catch {
		// Ignore parse errors
	}
	return {
		companionName: "",
		stage: "Discovery",
		mood: "Curious & observant",
		metrics: {
			turns: 0,
			fondness: 10,
			friction: 0,
			intimacyScore: 0,
		},
		memories: [],
		messages: [],
		unresolvedThreads: [],
	};
};

export const saveLocalCompanionSession = (data: CompanionSessionData): void => {
	try {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Handle quota or private browsing errors gracefully
	}
};

export const clearLocalCompanionSession = (hardReset = false): void => {
	try {
		if (hardReset) {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
		} else {
			const current = getLocalCompanionSession();
			current.messages = [];
			current.mood = "Observant & reflective";
			current.metrics.friction = 0;
			saveLocalCompanionSession(current);
		}
	} catch {
		// Ignore storage errors
	}
};

/**
 * Fetch session from backend if authenticated, otherwise return local storage session
 */
export const fetchCompanionSession = async (): Promise<{
	session: CompanionSessionData;
	isGuest: boolean;
}> => {
	try {
		const response = await api.get("/tools/companion/session");
		if (response.data.session) {
			const serverSession = response.data.session;
			// Sync local storage as backup cache
			saveLocalCompanionSession(serverSession);
			return { session: serverSession, isGuest: false };
		}
	} catch {
		// Proceed with guest local session on network / auth fallback
	}

	return { session: getLocalCompanionSession(), isGuest: true };
};

/**
 * Sync state to backend if authenticated, and always persist to local storage
 */
export const syncCompanionSession = async (
	session: CompanionSessionData,
): Promise<void> => {
	saveLocalCompanionSession(session);
	try {
		await api.post("/tools/companion/sync", session);
	} catch {
		// Silent fail for guest mode or offline
	}
};

/**
 * Call backend AI for companion chat completion if Puter client is unavailable
 */
export const sendBackendCompanionChat = async (
	messages: Array<{ role: string; content: string }>,
	model?: string,
): Promise<string> => {
	try {
		const response = await api.post("/tools/companion/chat", {
			messages,
			model,
		});
		if (response.data?.success && response.data?.reply) {
			return response.data.reply;
		}
	} catch (err) {
		console.warn("Backend companion chat fallback error:", err);
	}
	return "";
};

/**
 * Fetch available companion AI models dynamically from backend
 */
export const fetchBackendCompanionModels = async (): Promise<
	Array<{ id: string; label: string }>
> => {
	try {
		const response = await api.get("/tools/companion/models");
		if (response.data?.success && Array.isArray(response.data?.models)) {
			return response.data.models;
		}
	} catch (err) {
		console.warn("Failed to fetch backend companion models:", err);
	}
	return [];
};

/**
 * Extract genuine subconscious memories using backend AI
 */
export const extractCompanionMemories = async (
	recentMessages: Array<{ role: string; content: string }>,
	existingMemories: CompanionMemory[],
): Promise<CompanionMemory[]> => {
	try {
		const response = await api.post("/tools/companion/extract-memories", {
			recentMessages,
			existingMemories,
		});
		if (response.data?.success && Array.isArray(response.data?.memories)) {
			return response.data.memories;
		}
	} catch (err) {
		console.warn("Failed to extract companion memories:", err);
	}
	return [];
};

/**
 * Reset conversation or perform hard wipe
 */
export const resetCompanionSession = async (
	hardReset = false,
): Promise<void> => {
	clearLocalCompanionSession(hardReset);
	try {
		await api.post("/tools/companion/reset", { hardReset });
	} catch {
		// Guest fallback
	}
};

/**
 * Delete a specific memory
 */
export const deleteCompanionMemory = async (
	memoryId: string,
	currentSession: CompanionSessionData,
): Promise<CompanionSessionData> => {
	const updatedMemories = currentSession.memories.filter(
		(m) => m.id !== memoryId,
	);
	const updatedSession = { ...currentSession, memories: updatedMemories };
	saveLocalCompanionSession(updatedSession);

	try {
		await api.delete(`/tools/companion/memory/${memoryId}`);
	} catch {
		// Guest fallback
	}

	return updatedSession;
};
