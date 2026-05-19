import type { Socket } from "socket.io-client";

export class GlobalClock {
	private offset = 0;
	private rtt = 0;
	private socket: Socket | null = null;
	private pingInterval: ReturnType<typeof setInterval> | null = null;

	constructor(socket?: Socket) {
		if (socket) {
			this.initialize(socket);
		}
	}

	public initialize(socket: Socket) {
		this.socket = socket;

		// Remove existing listeners if any
		this.socket.off("music:pong");

		this.socket.on(
			"music:pong",
			(data: { clientTimestamp: number; serverTimestamp: number }) => {
				const t1 = Date.now();
				const t0 = data.clientTimestamp;
				const serverTime = data.serverTimestamp;

				// RTT = t1 - t0
				const rtt = t1 - t0;
				this.rtt = rtt;

				// Clock Offset = ((serverTime - t0) + (serverTime - t1)) / 2
				const offset = (serverTime - t0 + (serverTime - t1)) / 2;

				// Moving average filter to smooth offset fluctuations
				this.offset =
					this.offset === 0
						? offset
						: this.offset * 0.7 + offset * 0.3;
			},
		);

		// Trigger initial sync burst
		this.sync();
		setTimeout(() => this.sync(), 500);
		setTimeout(() => this.sync(), 1000);

		// Continuous background synchronization every 10 seconds
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
		}
		this.pingInterval = setInterval(() => {
			this.sync();
		}, 10000);
	}

	public sync() {
		if (this.socket && this.socket.connected) {
			this.socket.emit("music:ping", { clientTimestamp: Date.now() });
		}
	}

	public getGlobalTime(): number {
		return Date.now() + this.offset;
	}

	public getLatency(): number {
		return this.rtt / 2;
	}

	public destroy() {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
		}
		if (this.socket) {
			this.socket.off("music:pong");
		}
	}
}

/**
 * Calculates the exact target seek position in seconds for playback sync
 * @param playbackStartTime The global synchronized timestamp when playback/seek started (in ms)
 * @param seekPosition The track's playback position at start (in seconds)
 * @param isPlaying Whether the track is actively playing
 * @param globalTime The current global synchronized time (in ms)
 */
export function calculateTargetSeek(
	playbackStartTime: number,
	seekPosition: number,
	isPlaying: boolean,
	globalTime: number,
): number {
	if (!isPlaying) {
		return seekPosition;
	}

	const elapsedMs = globalTime - playbackStartTime;
	const elapsedSeconds = Math.max(0, elapsedMs / 1000);
	return seekPosition + elapsedSeconds;
}
