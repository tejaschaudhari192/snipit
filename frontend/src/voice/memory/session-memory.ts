import type {
	ActiveEntityState,
	PendingSlotState,
	SessionMemoryData,
} from "../types/voice.types";

const MAX_HISTORY_TURNS = 6;

export class SessionMemory {
	private data: SessionMemoryData;

	constructor() {
		this.data = {
			currentRoute:
				typeof window !== "undefined" ? window.location.pathname : "/",
			entities: {},
			pendingSlot: null,
			history: [],
		};
	}

	public getState(): SessionMemoryData {
		return {
			...this.data,
			currentRoute:
				typeof window !== "undefined"
					? window.location.pathname
					: this.data.currentRoute,
		};
	}

	public setCurrentRoute(route: string): void {
		this.data.currentRoute = route;
	}

	public updateEntities(partial: Partial<ActiveEntityState>): void {
		this.data.entities = {
			...this.data.entities,
			...partial,
		};
	}

	public setPendingSlot(slot: PendingSlotState | null): void {
		this.data.pendingSlot = slot;
	}

	public addTurn(role: "user" | "assistant", content: string): void {
		this.data.history.push({
			role,
			content,
			timestamp: Date.now(),
		});

		// Keep sliding window
		if (this.data.history.length > MAX_HISTORY_TURNS) {
			this.data.history = this.data.history.slice(-MAX_HISTORY_TURNS);
		}
	}

	public clear(): void {
		this.data = {
			currentRoute:
				typeof window !== "undefined" ? window.location.pathname : "/",
			entities: {},
			pendingSlot: null,
			history: [],
		};
	}
}
