import type { Request, Response } from "express";
import { musicService } from "@/services/music.service.js";
import logger from "@/config/logger.js";

export const getPlaylist = async (req: Request, req_res: Response) => {
	try {
		const region = (req.query.region as string) || "default";
		logger.info(
			`MusicController: Request received for regional playlist: "${region}"`,
		);
		const playlist = await musicService.getPlaylistByRegion(region);
		return req_res.status(200).json(playlist);
	} catch (error) {
		logger.error("MusicController: Error in getPlaylist:", error);
		return req_res
			.status(500)
			.json({ error: "Failed to fetch music playlist" });
	}
};

export const searchTracks = async (req: Request, req_res: Response) => {
	try {
		const query = req.query.q as string;
		logger.info(
			`MusicController: Request received for track search with query: "${query}"`,
		);
		if (!query) {
			return req_res
				.status(400)
				.json({ error: "Search query is required" });
		}
		const tracks = await musicService.searchTracks(query);
		return req_res.status(200).json({ tracks });
	} catch (error) {
		logger.error("MusicController: Error in searchTracks:", error);
		return req_res.status(500).json({ error: "Failed to search music" });
	}
};

export const getSuggestions = async (req: Request, req_res: Response) => {
	try {
		const query = req.query.q as string;
		logger.info(
			`MusicController: Request received for search suggestions with query: "${query}"`,
		);
		if (!query) {
			return req_res.status(200).json([]);
		}
		const suggestions = await musicService.getSuggestions(query);
		return req_res.status(200).json(suggestions);
	} catch (error) {
		logger.error("MusicController: Error in getSuggestions:", error);
		return req_res
			.status(500)
			.json({ error: "Failed to fetch suggestions" });
	}
};

export const downloadTrack = async (req: Request, req_res: Response) => {
	try {
		const videoId = req.query.v as string;
		const quality = (req.query.q as string) || "128";
		logger.info(
			`MusicController: Request received to download audio for video: "${videoId}" at quality: "${quality}kbps"`,
		);

		if (!videoId) {
			return req_res.status(400).json({ error: "Video ID is required" });
		}

		const downloadUrl = await musicService.getDownloadUrl(videoId, quality);
		return req_res.status(200).json({ url: downloadUrl });
	} catch (error) {
		logger.error("MusicController: Error in downloadTrack:", error);
		return req_res
			.status(500)
			.json({ error: "Failed to resolve download URL" });
	}
};

export const getTrackDetails = async (req: Request, req_res: Response) => {
	try {
		const videoIds = req.query.ids as string;
		logger.info(
			`MusicController: Request received to fetch details for video IDs: "${videoIds}"`,
		);
		if (!videoIds) {
			return req_res.status(400).json({ error: "videoIds are required" });
		}
		const tracks = await musicService.getTrackDetails(videoIds);
		return req_res.status(200).json({ tracks });
	} catch (error) {
		logger.error("MusicController: Error in getTrackDetails:", error);
		return req_res
			.status(500)
			.json({ error: "Failed to fetch track details" });
	}
};
