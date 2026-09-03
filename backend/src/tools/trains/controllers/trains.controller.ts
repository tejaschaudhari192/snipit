import type { Request, Response } from "express";
import { pnrService } from "../services/trains.service.js";

export async function getPnrStatus(req: Request, res: Response): Promise<void> {
	const pnr = req.query.pnr ? String(req.query.pnr).trim() : "";

	if (!pnr) {
		res.status(400).json({ error: "Missing ?pnr= parameter" });
		return;
	}

	if (!/^\d{10}$/.test(pnr)) {
		res.status(400).json({ error: "PNR must be exactly 10 digits" });
		return;
	}

	try {
		const data = await pnrService.fetchPnrStatus(pnr);
		res.json(data);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		const statusCode =
			message.includes("not found") || message.includes("not available")
				? 404
				: 500;
		res.status(statusCode).json({ error: message });
	}
}

export async function getTrainSchedule(
	req: Request,
	res: Response,
): Promise<void> {
	const trainNumber = req.query.trainNumber
		? String(req.query.trainNumber).trim()
		: "";
	const query = req.query.query ? String(req.query.query).trim() : "";
	const departureDate = req.query.departureDate
		? String(req.query.departureDate).trim()
		: "";
	const source = req.query.source ? String(req.query.source).trim() : "";

	const searchQuery = query || trainNumber;

	if (!searchQuery) {
		res.status(400).json({
			error: "Missing ?query= or ?trainNumber= parameter",
		});
		return;
	}

	try {
		// If query provided or search fails, try searchTrainByNameOrNumber first
		const searchResults =
			await pnrService.searchTrainByNameOrNumber(searchQuery);
		const first = searchResults[0];
		if (first) {
			res.json({
				trainNumber: first.trainNumber,
				trainName: first.trainName,
				stations: first.schedule,
				origin: first.origin,
				destination: first.destination,
				journeyClasses: first.journeyClasses,
				runningOn: first.runningOn,
			});
			return;
		}

		// Fallback to schedule endpoint
		const schedule = await pnrService.fetchTrainSchedule(
			searchQuery,
			departureDate,
			source,
		);
		res.json(schedule);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		res.status(500).json({ error: message });
	}
}

export async function searchTrainSuggestions(
	req: Request,
	res: Response,
): Promise<void> {
	const query = req.query.query ? String(req.query.query).trim() : "";

	if (!query) {
		res.json([]);
		return;
	}

	try {
		const results = await pnrService.searchTrainByNameOrNumber(query);
		res.json(results);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		res.status(500).json({ error: message });
	}
}

export async function getTrainLiveStatus(
	req: Request,
	res: Response,
): Promise<void> {
	const trainNumber = req.query.trainNumber
		? String(req.query.trainNumber).trim()
		: "";
	const departureDate = req.query.departureDate
		? String(req.query.departureDate).trim()
		: "";

	if (!trainNumber) {
		res.status(400).json({ error: "Missing ?trainNumber= parameter" });
		return;
	}

	if (!departureDate) {
		res.status(400).json({ error: "Missing ?departureDate= parameter" });
		return;
	}

	try {
		const status = await pnrService.fetchTrainLiveStatus(
			trainNumber,
			departureDate,
		);
		res.json(status);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		res.status(500).json({ error: message });
	}
}
