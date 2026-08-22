import { CONFIG } from "@/configurations";
import { decodeHtml } from "@/utils";
import type { MusicTrack } from "@/types";

export async function fetchMusicTrackDetails(
	videoIds: string[],
): Promise<MusicTrack[]> {
	if (videoIds.length === 0) return [];
	try {
		const response = await fetch(
			`${CONFIG.apiBaseUrl}/music/details?ids=${encodeURIComponent(
				videoIds.join(","),
			)}`,
		);
		if (!response.ok) throw new Error("Failed to fetch track details");
		const data = await response.json();

		const decodedTracks: MusicTrack[] = data.tracks.map(
			(track: MusicTrack) => ({
				...track,
				title: decodeHtml(track.title),
				channel: decodeHtml(track.channel),
			}),
		);

		return decodedTracks;
	} catch (error) {
		console.error("Music fetch details error:", error);
		return [];
	}
}

export async function searchYouTubeMusic(query: string): Promise<MusicTrack[]> {
	if (!query.trim()) return [];
	try {
		const response = await fetch(
			`${CONFIG.apiBaseUrl}/music/search?q=${encodeURIComponent(query)}`,
		);
		if (!response.ok) throw new Error("Search failed");
		const data = await response.json();

		if (data.tracks && data.tracks.length > 0) {
			const decodedTracks: MusicTrack[] = data.tracks.map(
				(track: MusicTrack) => ({
					...track,
					title: decodeHtml(track.title),
					channel: decodeHtml(track.channel),
				}),
			);
			return decodedTracks;
		}
		return [];
	} catch (error) {
		console.error("Search error:", error);
		throw error;
	}
}
