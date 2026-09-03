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

export async function getSearchTrainsBetweenStations(
	req: Request,
	res: Response,
): Promise<void> {
	const source = req.query.source ? String(req.query.source).trim() : "";
	const destination = req.query.destination
		? String(req.query.destination).trim()
		: "";
	const departureDate = req.query.departureDate
		? String(req.query.departureDate).trim()
		: "";

	if (!source || !destination || !departureDate) {
		res.status(400).json({
			error: "Missing required query parameters: source, destination, departureDate",
		});
		return;
	}

	try {
		const data = await pnrService.fetchTrainsBetweenStations(
			source,
			destination,
			departureDate,
		);
		res.json(data);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		res.status(500).json({ error: message });
	}
}

export async function getTrainFareCalculation(
	req: Request,
	res: Response,
): Promise<void> {
	const trainNumber = req.query.trainNumber
		? String(req.query.trainNumber).trim()
		: "";
	const from = req.query.from ? String(req.query.from).trim() : "";
	const to = req.query.to ? String(req.query.to).trim() : "";
	const classCode = req.query.class ? String(req.query.class).trim() : "SL";
	const quota = req.query.quota ? String(req.query.quota).trim() : "GN";
	const category = req.query.category
		? String(req.query.category).trim()
		: "Adult";

	if (!trainNumber || !from || !to) {
		res.status(400).json({
			error: "Missing required query parameters: trainNumber, from, to",
		});
		return;
	}

	try {
		const fare = await pnrService.calculateFare(
			trainNumber,
			from,
			to,
			classCode,
			quota,
			category,
		);
		res.json(fare);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		res.status(500).json({ error: message });
	}
}

export async function getStationSuggestions(
	req: Request,
	res: Response,
): Promise<void> {
	const query = req.query.query ? String(req.query.query).trim() : "";

	if (!query) {
		res.json([]);
		return;
	}

	try {
		const stations = await pnrService.searchStations(query);
		res.json(stations);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		res.status(500).json({ error: message });
	}
}
