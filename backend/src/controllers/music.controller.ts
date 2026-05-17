import type { Request, Response } from "express";
import { musicService } from "@/services/music.service.js";
import logger from "@/config/logger.js";

export const getPlaylist = async (req: Request, req_res: Response) => {
	try {
		const region = (req.query.region as string) || "default";
		const playlist = await musicService.getPlaylistByRegion(region);
		return req_res.status(200).json(playlist);
	} catch (error) {
		logger.error("Error in getPlaylist controller:", error);
		return req_res
			.status(500)
			.json({ error: "Failed to fetch music playlist" });
	}
};

export const searchTracks = async (req: Request, req_res: Response) => {
	try {
		const query = req.query.q as string;
		if (!query) {
			return req_res
				.status(400)
				.json({ error: "Search query is required" });
		}
		const tracks = await musicService.searchTracks(query);
		return req_res.status(200).json({ tracks });
	} catch (error) {
		logger.error("Error in searchTracks controller:", error);
		return req_res.status(500).json({ error: "Failed to search music" });
	}
};
