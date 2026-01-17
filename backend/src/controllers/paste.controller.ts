import { dateConverter, uniqueIdGenerator } from "@/lib/utils.js";
import type { NextFunction, Request, Response } from "express";
import type { PasteData } from "@/types/index.js";
import { createPasteSchema } from "@/validators/paste.validators.js";
import type { Logger } from "winston";
import User from "@/models/User.js";
import type PasteService from "@/services/paste.service.js";
import {
	getUserIdFromToken,
	extractTokenFromRequest,
} from "@/lib/auth.utils.js";

class PasteController {
	constructor(
		private readonly pasteService: PasteService,
		private readonly logger: Logger,
	) {}

	private getUserId(req: Request): string | null {
		const token = extractTokenFromRequest(req);
		return token ? getUserIdFromToken(token) : null;
	}

	async createPaste(req: Request, res: Response, next: NextFunction) {
		try {
			const createdAt = new Date(Date.now());
			const {
				content,
				expiresTime,
				idType,
				customId,
				redirectUrl,
				language,
				burnAfterRead,
				visibility,
				allowedUsers,
			} = req.body;

			const expiresAt = expiresTime
				? dateConverter(expiresTime)
				: dateConverter("1d");

			if (!expiresAt && expiresTime !== "one-time") {
				this.logger.warn(
					`Invalid expiration time format received: ${expiresTime} `,
				);
				return res
					.status(400)
					.json({ error: "Invalid expiration time format" });
			}

			if (expiresAt && isNaN(expiresAt.getTime())) {
				this.logger.warn(
					`Invalid date format during conversion: ${expiresTime} `,
				);
				return res.status(400).json({ error: "Invalid date format" });
			}

			if (expiresAt && expiresAt < new Date()) {
				this.logger.warn(
					`Attempted to create paste with past date: ${expiresAt.toISOString()} `,
				);
				return res
					.status(400)
					.json({ error: "Expiration time cannot be in the past" });
			}

			let finalExpiresAt: Date | null = expiresAt;
			let finalBurnAfterRead: boolean = !!burnAfterRead;

			if (expiresTime === "one-time") {
				finalExpiresAt = dateConverter("1d");
				finalBurnAfterRead = true;
			}

			if (!finalExpiresAt) {
				finalExpiresAt = dateConverter("1d");
			}

			const validatedBody = createPasteSchema.parse({
				content,
				expiresAt: finalExpiresAt,
				idType,
				customId,
				redirectUrl,
				language,
				burnAfterRead: finalBurnAfterRead,
				expiresTime,
				visibility,
				allowedUsers,
			});

			const owner = this.getUserId(req);

			if (
				validatedBody.visibility &&
				validatedBody.visibility !== "public" &&
				!owner
			) {
				return res.status(401).json({
					error: "Login required for private/shared pastes",
				});
			}

			let pasteId =
				validatedBody.customId ||
				(validatedBody.idType === "system"
					? uniqueIdGenerator()
					: customId || uniqueIdGenerator());

			const createAndSavePaste = async (id: string) => {
				const pasteData: PasteData = {
					id,
					content: validatedBody.content,
					expiresAt: validatedBody.expiresAt,
					createdAt,
					redirectUrl: validatedBody.redirectUrl,
					language: validatedBody.language,
					burnAfterRead: validatedBody.burnAfterRead,
					expiresTime: validatedBody.expiresTime,
					owner: owner || undefined,
					visibility: validatedBody.visibility,
					allowedUsers: validatedBody.allowedUsers,
				};
				return await this.pasteService.savePaste(pasteData);
			};

			try {
				const result = await createAndSavePaste(pasteId);
				this.logger.info(`Created paste with id: ${pasteId} `);
				return res.status(201).json(result.toObject());
			} catch (error: unknown) {
				// Handle duplicate key error (code 11000)
				const err = error as {
					code?: number;
					errorResponse?: { code?: number };
				};
				const isDuplicateKey =
					err?.code === 11000 || err?.errorResponse?.code === 11000;

				if (isDuplicateKey) {
					if (validatedBody.customId) {
						const isExpired =
							await this.pasteService.isPasteExpired(pasteId);
						if (isExpired) {
							await this.pasteService.deletePaste(pasteId);
							const result = await createAndSavePaste(pasteId);
							this.logger.info(
								`Replaced expired paste with id: ${pasteId} `,
							);
							return res.json(result.toObject());
						}
						return res
							.status(409)
							.json({ error: "ID already in use" });
					}

					// For system IDs, try one more time with a new ID
					pasteId =
						validatedBody.idType === "system"
							? uniqueIdGenerator()
							: customId;
					try {
						const result = await createAndSavePaste(pasteId);
						this.logger.info(
							`Created paste with new id after conflict: ${pasteId} `,
						);
						return res.json(result);
					} catch (retryError) {
						return next(retryError);
					}
				}

				// For all other errors, bubble up to outer catch
				throw error;
			}
		} catch (error) {
			this.logger.error("Error creating paste:", error);
			return next(error);
		}
	}

	async getPaste(req: Request, res: Response, next: NextFunction) {
		const id = req.params.id;
		try {
			// Increment views atomically
			const result = await this.pasteService.incrementViews(id!);

			if (!result) {
				this.logger.info("Paste not found:", id);
				return res.status(404).json({ error: "Paste not found" });
			}

			if (result.expiresAt && new Date() > result.expiresAt) {
				await this.pasteService.deletePaste(id!);
				this.logger.info("Paste expired and deleted:", id);
				return res.status(404).json({ error: "Paste expired" });
			}

			if (result.burnAfterRead && result.views > 3) {
				await this.pasteService.deletePaste(id!);
				this.logger.info(`Paste burned after 3rd public read: ${id} `);
			}

			// Visibility Check
			if (result.visibility && result.visibility !== "public") {
				const userId = this.getUserId(req);
				let userEmail = null;
				if (userId) {
					const user = await User.findById(userId);
					if (user) userEmail = user.email;
				}

				const isOwner =
					result.owner &&
					userId &&
					result.owner.toString() === userId;
				const isAllowed =
					result.allowedUsers &&
					userEmail &&
					result.allowedUsers.includes(userEmail);

				if (!isOwner && !isAllowed) {
					return res.status(403).json({
						error: "Access denied. Private or Shared snippet.",
					});
				}
			}

			return res.json(result.toObject());
		} catch (error) {
			this.logger.error("Error fetching paste", id, error);
			return next(error);
		}
	}

	async deletePaste(req: Request, res: Response, next: NextFunction) {
		const id = req.params.id;
		try {
			const result = await this.pasteService.deletePaste(id!);
			this.logger.info("Deleting paste:", id);
			return res.json(result);
		} catch (error) {
			this.logger.error("Error deleting paste", id, error);
			return next(error);
		}
	}

	async updatePaste(req: Request, res: Response, next: NextFunction) {
		const id = req.params.id;
		const {
			content,
			redirectUrl,
			language,
			visibility,
			allowedUsers,
			newId,
		} = req.body;
		try {
			// Check ownership
			const existingPaste = await this.pasteService.getPasteById(id!);
			if (!existingPaste) {
				return res.status(404).json({ error: "Paste not found" });
			}

			if (existingPaste.owner) {
				const userId = this.getUserId(req);

				if (existingPaste.owner.toString() !== userId) {
					return res.status(403).json({
						error: "Unauthorized: You are not the owner of this paste",
					});
				}
			}

			this.logger.info(
				`Update request for paste ${id}: visibility = ${visibility}, newId = ${newId} `,
			);
			const result = await this.pasteService.updatePaste(
				id!,
				content,
				redirectUrl,
				language,
				visibility,
				allowedUsers,
				newId,
			);

			this.logger.info(`Successfully updated paste: ${id} `);
			return res.json(result!.toObject());
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === "ID_ALREADY_EXISTS"
			) {
				return res.status(409).json({ error: "ID already in use" });
			}
			this.logger.error("Error updating paste", id, error);
			return next(error);
		}
	}

	async getUserPastes(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = this.getUserId(req);

			if (!userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const pastes = await this.pasteService.getUserPastes(userId);
			return res.json(pastes.map((p) => p.toObject()));
		} catch (error) {
			this.logger.error("Error fetching user pastes", error);
			return next(error);
		}
	}
}

export default PasteController;
