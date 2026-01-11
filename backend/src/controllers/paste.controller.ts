import { dateConverter, uniqueIdGenerator } from "@/lib/utils.js";

import type PasteService from "@/services/paste.service.js";
import { createPasteSchema } from "@/validators/paste.validators.js";
import type { NextFunction, Request, Response } from "express";
import type { Logger } from "winston";

class PasteController {
  constructor(
    private readonly pasteService: PasteService,
    private readonly logger: Logger,
  ) {}

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
      } = req.body;

      const expiresAt = expiresTime
        ? dateConverter(expiresTime)
        : dateConverter("1d");

      if (!expiresAt && expiresTime !== "one-time") {
        this.logger.warn(
          `Invalid expiration time format received: ${expiresTime}`,
        );
        return res
          .status(400)
          .json({ error: "Invalid expiration time format" });
      }

      if (expiresAt && isNaN(expiresAt.getTime())) {
        this.logger.warn(
          `Invalid date format during conversion: ${expiresTime}`,
        );
        return res.status(400).json({ error: "Invalid date format" });
      }

      if (expiresAt && expiresAt < new Date()) {
        this.logger.warn(
          `Attempted to create paste with past date: ${expiresAt.toISOString()}`,
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
      });

      let pasteId =
        validatedBody.customId ||
        (validatedBody.idType === "system"
          ? uniqueIdGenerator()
          : customId || uniqueIdGenerator());

      const createAndSavePaste = async (id: string) => {
        const pasteData = {
          id,
          content: validatedBody.content,
          expiresAt: validatedBody.expiresAt,
          createdAt,
          redirectUrl: validatedBody.redirectUrl,
          language: validatedBody.language,
          burnAfterRead: validatedBody.burnAfterRead,
          expiresTime: validatedBody.expiresTime,
        };
        this.logger.info(
          `Saving paste with data: ${JSON.stringify(pasteData)}`,
        );
        return await this.pasteService.savePaste(pasteData as any);
      };

      try {
        const result = await createAndSavePaste(pasteId);
        this.logger.info(`Created paste with id: ${pasteId}`);
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
            const isExpired = await this.pasteService.isPasteExpired(pasteId);
            if (isExpired) {
              await this.pasteService.deletePaste(pasteId);
              const result = await createAndSavePaste(pasteId);
              this.logger.info(`Replaced expired paste with id: ${pasteId}`);
              return res.json(result.toObject());
            }
            return res.status(409).json({ error: "ID already in use" });
          }

          // For system IDs, try one more time with a new ID
          pasteId =
            validatedBody.idType === "system" ? uniqueIdGenerator() : customId;
          try {
            const result = await createAndSavePaste(pasteId);
            this.logger.info(
              `Created paste with new id after conflict: ${pasteId}`,
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
      const result = await this.pasteService.getPasteById(id!);
      if (!result) {
        this.logger.info("Paste not found:", id);
        return res.status(404).json({ error: "Paste not found" });
      }

      if (result.expiresAt && new Date() > result.expiresAt) {
        await this.pasteService.deletePaste(id!);
        this.logger.info("Paste expired and deleted:", id);
        return res.status(404).json({ error: "Paste expired" });
      }
      if (result.burnAfterRead) {
        await this.pasteService.deletePaste(id!);
        this.logger.info(`Paste burned after read: ${id}`);
      }

      this.logger.info(
        `Getting paste: ${id}, burnAfterRead: ${result.burnAfterRead}`,
      );
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
    const { content, redirectUrl, language } = req.body;
    try {
      const result = await this.pasteService.updatePaste(
        id!,
        content,
        redirectUrl,
        language,
      );
      this.logger.info("Updating paste:", id);
      return res.json(result);
    } catch (error) {
      this.logger.error("Error updating paste", id, error);
      return next(error);
    }
  }
}

export default PasteController;
