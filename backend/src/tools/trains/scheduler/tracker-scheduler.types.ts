export interface ITrackerSchedulerStats {
	isRunning: boolean;
	lastSweepAt?: Date;
	lastProcessedCount: number;
	totalErrors: number;
}
