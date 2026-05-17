import configurations from "@/config/configurations.js";
import {
	REGION_PLAYLISTS,
	HINDI_BELT_STATES,
} from "@/config/music-playlists.js";
import logger from "@/config/logger.js";

interface MusicTrack {
	videoId: string;
	title: string;
	channel: string;
	thumbnail: string;
	duration?: string;
}

interface PlaylistResponse {
	region: string;
	displayName: string;
	tracks: MusicTrack[];
	fallback?: boolean;
}

interface CacheEntry {
	data: PlaylistResponse;
	timestamp: number;
}

class MusicService {
	private cache: Map<string, CacheEntry> = new Map();
	private CACHE_TTL = 3600 * 1000; // 1 hour

	async getPlaylistByRegion(region: string): Promise<PlaylistResponse> {
		// Normalize region
		let resolvedRegion = region.toLowerCase();
		if (HINDI_BELT_STATES.includes(resolvedRegion)) {
			resolvedRegion = "default";
		}

		if (!REGION_PLAYLISTS[resolvedRegion]) {
			resolvedRegion = "default";
		}

		// Check cache
		const cached = this.cache.get(resolvedRegion);
		if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
			return cached.data;
		}

		try {
			const config = REGION_PLAYLISTS[resolvedRegion];
			if (!config) {
				throw new Error(
					`Configuration not found for region: ${resolvedRegion}`,
				);
			}

			let response;
			let isRegionalSearch = false;
			let regionCode = "IN";

			if (resolvedRegion === "english") {
				regionCode = "US";
			} else if (resolvedRegion !== "default") {
				isRegionalSearch = true;
			}

			if (isRegionalSearch) {
				// For Indian states (like Tamil Nadu, Maharashtra, etc.), search YouTube for their regional music
				const query = config.searchQueries[0] || "Music";
				response = await fetch(
					`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(
						query,
					)}&type=video&videoCategoryId=10&key=${configurations.youtube_api_key}`,
				);
			} else {
				// For main country levels (Hindi/India, English/US), fetch official YouTube trending music charts directly
				response = await fetch(
					`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=50&regionCode=${regionCode}&key=${configurations.youtube_api_key}`,
				);
			}

			if (!response.ok) {
				const errorData = await response.json();
				logger.error("YouTube API Error:", JSON.stringify(errorData));
				throw new Error("Failed to fetch from YouTube API");
			}

			const data = await response.json();
			const seenTitles = new Set<string>();
			const tracks: MusicTrack[] = [];

			for (const item of data.items) {
				const videoId = isRegionalSearch ? item.id?.videoId : item.id;
				if (!videoId) continue;

				const title = item.snippet.title.toLowerCase().trim();
				const normalizedTitle = title
					.split("(")[0]
					.split("[")[0]
					.trim();

				if (!seenTitles.has(normalizedTitle) && tracks.length < 20) {
					seenTitles.add(normalizedTitle);
					tracks.push({
						videoId,
						title: item.snippet.title,
						channel: item.snippet.channelTitle,
						thumbnail:
							item.snippet.thumbnails.high?.url ||
							item.snippet.thumbnails.default?.url,
					});
				}
			}

			const result: PlaylistResponse = {
				region: resolvedRegion,
				displayName: config.displayName,
				tracks,
			};

			// Update cache
			this.cache.set(resolvedRegion, {
				data: result,
				timestamp: Date.now(),
			});

			return result;
		} catch (error) {
			logger.error("MusicService Error:", error);
			// Fallback: return an empty list or a pre-defined set if available
			return {
				region: resolvedRegion,
				displayName:
					REGION_PLAYLISTS[resolvedRegion]?.displayName || "Unknown",
				tracks: [],
				fallback: true,
			};
		}
	}

	async searchTracks(query: string): Promise<MusicTrack[]> {
		try {
			const response = await fetch(
				`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(
					query,
				)}&type=video&videoCategoryId=10&key=${configurations.youtube_api_key}`,
			);

			if (!response.ok) {
				const errorData = await response.json();
				logger.error(
					"YouTube Search API Error:",
					JSON.stringify(errorData),
				);
				throw new Error("Failed to fetch from YouTube Search API");
			}

			const data = await response.json();
			const tracks: MusicTrack[] = [];
			const seenTitles = new Set<string>();

			for (const item of data.items) {
				if (!item.id || !item.id.videoId) continue;
				const title = item.snippet.title.toLowerCase().trim();
				const normalizedTitle = title
					.split("(")[0]
					.split("[")[0]
					.trim();
				if (!seenTitles.has(normalizedTitle)) {
					seenTitles.add(normalizedTitle);
					tracks.push({
						videoId: item.id.videoId,
						title: item.snippet.title,
						channel: item.snippet.channelTitle,
						thumbnail:
							item.snippet.thumbnails.high?.url ||
							item.snippet.thumbnails.default?.url,
					});
				}
			}

			return tracks;
		} catch (error) {
			logger.error("MusicService Search Error:", error);
			return [];
		}
	}
}

export const musicService = new MusicService();
