/**
 * Audio processing and formatting utilities
 */

/**
 * Calculates the Root Mean Square (RMS) amplitude from a TimeDomain data array.
 * @param dataArray Uint8Array of time domain data
 * @returns number between 0 and 100 representing the amplitude
 */
export const calculateRMS = (dataArray: Uint8Array): number => {
	let sumSquares = 0;
	for (let i = 0; i < dataArray.length; i++) {
		const normalized = (dataArray[i] - 128) / 128;
		sumSquares += normalized * normalized;
	}
	const rms = Math.sqrt(sumSquares / dataArray.length);
	// Boost and clamp the value for visualization purposes
	return Math.max(0, Math.min(100, rms * 100 * 5));
};

/**
 * Formats seconds into a m:ss string
 * @param seconds number of seconds
 * @returns string formatted as m:ss
 */
export const formatAudioDuration = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
};
