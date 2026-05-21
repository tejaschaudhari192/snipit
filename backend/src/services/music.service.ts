import configurations from "@/config/configurations.js";
import {
	REGION_PLAYLISTS,
	HINDI_BELT_STATES,
} from "@/config/music-playlists.js";
import logger from "@/config/logger.js";

export interface MusicTrack {
	videoId: string;
	title: string;
	channel: string;
	thumbnail: string;
	duration?: string;
}

export interface PlaylistResponse {
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
		logger.info(
			`MusicService: Received playlist request for region: "${region}"`,
		);

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
			logger.info(
				`MusicService: Serving regional playlist from cache for: "${resolvedRegion}"`,
			);
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

			logger.info(
				`MusicService: Fetching playlist from YouTube. RegionalSearch: ${isRegionalSearch}, RegionCode: ${regionCode}`,
			);

			if (isRegionalSearch) {
				const query = config.searchQueries[0] || "Music";
				response = await fetch(
					`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(
						query,
					)}&type=video&videoCategoryId=10&key=${configurations.youtube_api_key}`,
				);
			} else {
				response = await fetch(
					`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=50&regionCode=${regionCode}&key=${configurations.youtube_api_key}`,
				);
			}

			if (!response.ok) {
				const errorData = await response.json();
				logger.error(
					"YouTube API Error Details:",
					JSON.stringify(errorData),
				);
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

			logger.info(
				`MusicService: Successfully retrieved ${tracks.length} tracks for region: "${resolvedRegion}"`,
			);
			return result;
		} catch (error) {
			logger.error(
				`MusicService Playlist Error for "${resolvedRegion}":`,
				error,
			);
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
					"YouTube Search API Error Details:",
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

			logger.info(
				`MusicService: YouTube search resolved successfully for query "${query}". Found ${tracks.length} matching tracks.`,
			);
			return tracks;
		} catch (error) {
			logger.error(
				`MusicService: Search failed for query "${query}":`,
				error,
			);
			return [];
		}
	}

	async getSuggestions(query: string): Promise<string[]> {
		try {
			const response = await fetch(
				`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(
					query,
				)}`,
			);
			if (!response.ok) {
				throw new Error(
					"Failed to fetch suggestions from Google Suggest API",
				);
			}
			const data = (await response.json()) as [string, string[]];
			if (Array.isArray(data) && Array.isArray(data[1])) {
				logger.info(
					`MusicService: Resolved ${data[1].length} autocomplete suggestions successfully for query: "${query}".`,
				);
				return data[1];
			}
			return [];
		} catch (error) {
			logger.error(
				`MusicService: Failed to retrieve suggestions for query "${query}":`,
				error,
			);
			return [];
		}
	}

	async getDownloadUrl(videoId: string, quality: string): Promise<string> {
		logger.info(
			`MusicService: Requesting download link for video "${videoId}", quality: ${quality}kbps`,
		);

		const cobaltInstances = [
			"https://api.cobalt.blackcat.sweeux.org/",
			"https://api.dl.woof.monster/",
			"https://api.cobalt.tools/",
			"https://cobalt.hnd.me/",
		];

		for (const instance of cobaltInstances) {
			try {
				logger.info(
					`MusicService: Trying to resolve audio via instance: ${instance}`,
				);
				const response = await fetch(instance, {
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						url: `https://www.youtube.com/watch?v=${videoId}`,
						downloadMode: "audio",
						audioFormat: "mp3",
						audioBitrate: quality,
					}),
				});

				if (response.ok) {
					const data = await response.json();
					if (data.url) {
						logger.info(
							`MusicService: Successfully resolved download for video "${videoId}" via ${instance} -> ${data.url}`,
						);
						return data.url;
					}
				} else {
					const errorText = await response.text();
					logger.warn(
						`MusicService: Instance ${instance} returned status ${response.status}: ${errorText}`,
					);
				}
			} catch (err) {
				logger.warn(
					`MusicService: Failed to fetch from Cobalt instance ${instance}: ${err}`,
				);
			}
		}

		logger.warn(
			`MusicService: All public Cobalt instances failed to resolve. Returning fallback converter URL.`,
		);
		return `https://y2mate.tools/en/download?url=https://www.youtube.com/watch?v=${videoId}`;
	}

	async getTrackDetails(videoIds: string): Promise<MusicTrack[]> {
		logger.info(
			`MusicService: Request details for video IDs: "${videoIds}"`,
		);
		try {
			const response = await fetch(
				`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(
					videoIds,
				)}&key=${configurations.youtube_api_key}`,
			);

			if (!response.ok) {
				const errorData = await response.json();
				logger.error(
					"YouTube Videos API Error Details:",
					JSON.stringify(errorData),
				);
				throw new Error("Failed to fetch from YouTube Videos API");
			}

			const data = await response.json();
			const tracks: MusicTrack[] = [];

			for (const item of data.items) {
				tracks.push({
					videoId: item.id,
					title: item.snippet.title,
					channel: item.snippet.channelTitle,
					thumbnail:
						item.snippet.thumbnails.high?.url ||
						item.snippet.thumbnails.default?.url,
				});
			}

			logger.info(
				`MusicService: Successfully retrieved details for ${tracks.length} tracks.`,
			);
			return tracks;
		} catch (error) {
			logger.error(
				`MusicService: getTrackDetails failed for "${videoIds}":`,
				error,
			);
			return [];
		}
	}
}

export const musicService = new MusicService();
