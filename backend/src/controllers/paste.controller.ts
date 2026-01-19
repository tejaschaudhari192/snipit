import { dateConverter, uniqueIdGenerator } from "@/lib/utils.js";
import type { NextFunction, Request, Response } from "express";
import type { PasteData, IPaste } from "@/types/index.js";
import { createPasteSchema } from "@/validators/paste.validators.js";
import type { Logger } from "winston";
import User from "@/models/User.js";
import type PasteService from "@/services/paste.service.js";
import {
	getUserIdFromToken,
	extractTokenFromRequest,
} from "@/lib/auth.utils.js";
import bcrypt from "bcryptjs";

class PasteController {
	constructor(
		private readonly pasteService: PasteService,
		private readonly logger: Logger,
	) {}

	private getUserId(req: Request): string | null {
		const token = extractTokenFromRequest(req);
		return token ? getUserIdFromToken(token) : null;
	}

	private async getUserRole(
		req: Request,
		paste: IPaste,
	): Promise<"admin" | "editor" | "viewer" | "commenter"> {
		const userId = this.getUserId(req);
		let userEmail = null;
		if (userId) {
			const user = await User.findById(userId);
			if (user) userEmail = user.email;
		}

		const isOwner =
			paste.owner && userId && paste.owner.toString() === userId;
		const isAnonymousOwner = !paste.owner;

		if (isOwner || isAnonymousOwner) {
			return "admin";
		}

		let userRole: "admin" | "editor" | "viewer" | "commenter" = "viewer";

		// Check shareList
		if (paste.shareList && userEmail) {
			const shareEntry = paste.shareList.find(
				(s: { email: string; role: string }) => s.email === userEmail,
			);
			if (shareEntry) {
				userRole = shareEntry.role;
			}
		}

		// Fallback to legacy allowedUsers -> editor
		if (
			userRole === "viewer" &&
			paste.allowedUsers &&
			userEmail &&
			paste.allowedUsers.includes(userEmail)
		) {
			userRole = "editor";
		}

		// Check public role / editPermission
		if (userRole === "viewer") {
			if (paste.editPermission === "public") {
				userRole = "editor"; // Legacy compatibility
			} else if (
				paste.visibility === "public" ||
				paste.visibility === "shared"
			) {
				userRole = paste.publicRole || "viewer";
			}
		}

		return userRole;
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
				password,
				editPermission,
				shareList,
				publicRole,
				allowComments,
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
				password,
				editPermission,
				shareList,
				publicRole,
				allowComments,
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
					password: validatedBody.password,
					editPermission: validatedBody.editPermission,
					shareList: validatedBody.shareList,
					publicRole: validatedBody.publicRole,
					allowComments: validatedBody.allowComments,
				};

				if (pasteData.password) {
					const salt = await bcrypt.genSalt(10);
					pasteData.password = await bcrypt.hash(
						pasteData.password,
						salt,
					);
				}

				return await this.pasteService.savePaste(pasteData);
			};

			try {
				const result = await createAndSavePaste(pasteId);
				this.logger.info(`Created paste with id: ${pasteId} `);
				return res.status(201).json(result.toObject());
			} catch (error: unknown) {
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

				// Check new shareList for read access
				let hasShareListAccess = false;
				if (result.shareList && userEmail) {
					const shareEntry = result.shareList.find(
						(s) => s.email === userEmail,
					);
					if (shareEntry) hasShareListAccess = true;
				}

				if (!isOwner && !isAllowed && !hasShareListAccess) {
					return res.status(403).json({
						error: "Access denied. Private or Shared snippet.",
					});
				}
			}

			if (result.password) {
				const userId = this.getUserId(req);
				const isOwner =
					result.owner &&
					userId &&
					result.owner.toString() === userId;

				if (!isOwner) {
					const pasteObj = result.toObject();
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { content, password, ...rest } = pasteObj;
					return res.json({
						...rest,
						isPasswordProtected: true,
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
			const existingPaste = await this.pasteService.getPasteById(id!);
			if (!existingPaste) {
				return res.status(404).json({ error: "Paste not found" });
			}

			const userRole = await this.getUserRole(req, existingPaste);

			if (userRole !== "admin") {
				return res.status(403).json({
					error: "Unauthorized: You do not have permission to delete this paste",
				});
			}

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
		const { content, redirectUrl, language } = req.body;
		let {
			visibility,
			allowedUsers,
			newId,
			password,
			editPermission,
			shareList,
			publicRole,
			allowComments,
			expiresTime,
		} = req.body;
		try {
			const existingPaste = await this.pasteService.getPasteById(id!);
			if (!existingPaste) {
				return res.status(404).json({ error: "Paste not found" });
			}

			const userRole = await this.getUserRole(req, existingPaste);

			if (userRole === "viewer" || userRole === "commenter") {
				return res.status(403).json({
					error: "Unauthorized: You do not have permission to edit this paste",
				});
			}

			// Restrict sensitive fields for Editors (Admins can do everything)
			if (userRole === "editor") {
				visibility = undefined;
				allowedUsers = undefined;
				newId = undefined;
				password = undefined;
				editPermission = undefined;
				shareList = undefined;
				publicRole = undefined;
				allowComments = undefined;
			}

			let expiresAt: Date | undefined;
			if (expiresTime) {
				const parsed = expiresTime
					? dateConverter(expiresTime)
					: dateConverter("1d");
				if (expiresTime === "one-time") {
					expiresAt = dateConverter("1d") || undefined;
				} else if (parsed) {
					expiresAt = parsed;
				}

				if (expiresAt && isNaN(expiresAt.getTime())) {
					return res
						.status(400)
						.json({ error: "Invalid date format" });
				}
				if (expiresAt && expiresAt < new Date()) {
					return res.status(400).json({
						error: "Expiration time cannot be in the past",
					});
				}
			}

			if (password) {
				const salt = await bcrypt.genSalt(10);
				password = await bcrypt.hash(password, salt);
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
				password,
				editPermission,
				shareList,
				publicRole,
				allowComments,
				expiresTime,
				expiresAt,
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

	async verifyPassword(req: Request, res: Response, next: NextFunction) {
		const id = req.params.id;
		const { password } = req.body;

		try {
			const paste = await this.pasteService.getPasteById(id!);

			if (!paste) {
				return res.status(404).json({ error: "Paste not found" });
			}

			if (!paste.password) {
				return res.json(paste.toObject());
			}

			const isMatch = await bcrypt.compare(password, paste.password);

			if (isMatch) {
				return res.json(paste.toObject());
			} else {
				return res.status(401).json({ error: "Incorrect password" });
			}
		} catch (error) {
			this.logger.error("Error verifying paste password", id, error);
			return next(error);
		}
	}

	async addComment(req: Request, res: Response, next: NextFunction) {
		const id = req.params.id;
		const { content, author } = req.body;

		try {
			const paste = await this.pasteService.getPasteById(id!);
			if (!paste) {
				return res.status(404).json({ error: "Paste not found" });
			}

			if (!paste.allowComments) {
				return res
					.status(403)
					.json({ error: "Comments are disabled for this snippet" });
			}

			const userRole = await this.getUserRole(req, paste);
			// editor and admins can comment
			if (
				userRole !== "admin" &&
				userRole !== "editor" &&
				userRole !== "commenter"
			) {
				return res.status(403).json({
					error: "Unauthorized: You do not have permission to comment",
				});
			}

			const userId = this.getUserId(req);
			let finalAuthor: string = author || "Anonymous";

			if (userId && !author) {
				const user = await User.findById(userId);
				if (user) finalAuthor = user.username || user.email;
			}

			const comment = {
				id: uniqueIdGenerator(),
				author: finalAuthor,
				content: content as string,
				createdAt: new Date(),
				userId: userId || undefined,
			};

			const result = await this.pasteService.addComment(id!, comment);
			return res.status(201).json(result?.toObject());
		} catch (error) {
			this.logger.error("Error adding comment", id, error);
			return next(error);
		}
	}
}

export default PasteController;
