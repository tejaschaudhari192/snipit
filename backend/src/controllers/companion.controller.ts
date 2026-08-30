import type { Response } from "express";
import CompanionSession from "@/models/Companion.js";
import type { AuthRequest } from "@/middleware/auth.middleware.js";
import Groq from "groq-sdk";
import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";

const groq = new Groq({ apiKey: configurations.groq_api_key });

export class CompanionController {
	/**
	 * List available AI models supported by backend
	 */
	async getModels(_req: AuthRequest, res: Response): Promise<void> {
		try {
			const models = configurations.groq_models.map((m: string) => ({
				id: m,
				label: m,
			}));
			res.status(200).json({
				success: true,
				models,
			});
		} catch (error) {
			logger.error("Failed to list companion models:", error);
			res.status(500).json({ success: false, models: [] });
		}
	}

	/**
	 * Intelligent LLM-based memory extraction
	 */
	async extractMemories(req: AuthRequest, res: Response): Promise<void> {
		const { recentMessages, existingMemories } = req.body;

		if (!Array.isArray(recentMessages) || recentMessages.length === 0) {
			res.status(200).json({ success: true, memories: [] });
			return;
		}

		try {
			const prompt = `You are a memory extraction engine for an intimate human-AI companion.
Analyze the following recent conversation snippet and extract ONLY genuine, persistent, important facts, feelings, or preferences about the human user.
DO NOT extract common adverbs, filler words, or transient conversation phrases (e.g. NEVER extract "really", "very", "today", "now", "well").

Existing stored memories:
${JSON.stringify(existingMemories || [])}

Recent chat messages:
${JSON.stringify(recentMessages)}

Respond with ONLY a JSON array of extracted memories matching this format, or an empty array [] if no new significant facts were shared:
[
  {
    "category": "fact" | "preference" | "story" | "observation",
    "key": "Short descriptive key (e.g. City / Location, Career Situation, Close Friend Issue)",
    "detail": "Specific concise fact (e.g. Lives in Chennai and feels lonely in current job)",
    "importance": 1-5
  }
]`;

			const completion = await groq.chat.completions.create({
				messages: [{ role: "user", content: prompt }],
				model:
					configurations.groq_smart_model ||
					"llama-3.3-70b-versatile",
				temperature: 0.1,
				max_tokens: 300,
				response_format: { type: "json_object" },
			});

			const raw = completion.choices[0]?.message?.content?.trim() || "{}";
			const parsed:
				| { memories?: Array<Record<string, unknown>> }
				| Array<Record<string, unknown>> = JSON.parse(raw);
			let memoriesList: Array<Record<string, unknown>> = [];
			if (Array.isArray(parsed)) {
				memoriesList = parsed;
			} else if (parsed && Array.isArray(parsed.memories)) {
				memoriesList = parsed.memories;
			}

			const validated = memoriesList
				.filter(
					(m) =>
						m &&
						typeof m.key === "string" &&
						typeof m.detail === "string",
				)
				.map((m) => ({
					id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
					category: m.category || "fact",
					key: String(m.key).trim(),
					detail: String(m.detail).trim(),
					importance:
						typeof m.importance === "number" ? m.importance : 2,
					createdAt: new Date().toISOString(),
				}));

			res.status(200).json({
				success: true,
				memories: validated,
			});
		} catch (error) {
			logger.error("Companion memory extraction error:", error);
			res.status(200).json({ success: true, memories: [] });
		}
	}

	/**
	 * Get or initialize user's companion session
	 */
	async getSession(req: AuthRequest, res: Response): Promise<void> {
		if (!req.user?._id) {
			res.status(200).json({
				success: true,
				isGuest: true,
				session: null,
			});
			return;
		}

		let session = await CompanionSession.findOne({ userId: req.user._id });

		if (!session) {
			session = await CompanionSession.create({
				userId: req.user._id,
				companionName: "",
				stage: "Discovery",
				mood: "Curious & observant",
				metrics: {
					turns: 0,
					fondness: 10,
					friction: 0,
					intimacyScore: 0,
				},
				memories: [],
				messages: [],
				unresolvedThreads: [],
			});
		}

		res.status(200).json({
			success: true,
			isGuest: false,
			session,
		});
	}

	/**
	 * Synchronize and persist state from client
	 */
	async syncSession(req: AuthRequest, res: Response): Promise<void> {
		if (!req.user?._id) {
			res.status(200).json({
				success: true,
				isGuest: true,
				message: "Guest session acknowledged",
			});
			return;
		}

		const {
			companionName,
			stage,
			mood,
			metrics,
			memories,
			messages,
			unresolvedThreads,
		} = req.body;

		// Keep only last 100 messages for storage efficiency
		const trimmedMessages = Array.isArray(messages)
			? messages.slice(-100)
			: [];

		const session = await CompanionSession.findOneAndUpdate(
			{ userId: req.user._id },
			{
				$set: {
					...(companionName !== undefined && { companionName }),
					...(stage && { stage }),
					...(mood && { mood }),
					...(metrics && { metrics }),
					...(memories && { memories }),
					...(unresolvedThreads && { unresolvedThreads }),
					messages: trimmedMessages,
				},
			},
			{ new: true, upsert: true, setDefaultsOnInsert: true },
		);

		res.status(200).json({
			success: true,
			session,
		});
	}

	/**
	 * Clear messages or full reset of companion state
	 */
	async resetSession(req: AuthRequest, res: Response): Promise<void> {
		if (!req.user?._id) {
			res.status(200).json({ success: true, isGuest: true });
			return;
		}

		const { hardReset } = req.body;

		if (hardReset) {
			await CompanionSession.findOneAndDelete({ userId: req.user._id });
		} else {
			await CompanionSession.findOneAndUpdate(
				{ userId: req.user._id },
				{
					$set: {
						messages: [],
						mood: "Observant & reflective",
						"metrics.friction": 0,
					},
				},
			);
		}

		res.status(200).json({
			success: true,
			message: hardReset ? "Session hard reset" : "Chat cleared",
		});
	}

	/**
	 * Remove a specific memory
	 */
	async deleteMemory(req: AuthRequest, res: Response): Promise<void> {
		if (!req.user?._id) {
			res.status(200).json({ success: true, isGuest: true });
			return;
		}

		const { memoryId } = req.params;

		const session = await CompanionSession.findOneAndUpdate(
			{ userId: req.user._id },
			{
				$pull: { memories: { id: memoryId } },
			},
			{ new: true },
		);

		res.status(200).json({
			success: true,
			session,
		});
	}
}

export default new CompanionController();
