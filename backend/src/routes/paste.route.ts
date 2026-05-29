import logger from "@/config/logger.js";
import PasteController from "@/controllers/paste.controller.js";
import PasteService from "@/services/paste.service.js";
import EmailService from "@/services/email.service.js";
import PermissionService from "@/services/permission.service.js";
import { Router } from "express";
import { protect, optionalProtect } from "@/middleware/auth.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import {
	createPasteSchema,
	updatePasteSchema,
} from "@/validators/paste.validators.js";
import { catchAsync } from "@/lib/errors.js";

const router: Router = Router();

const emailService = new EmailService();
const pasteService = new PasteService(emailService);
const permissionService = new PermissionService();
const pasteController = new PasteController(
	pasteService,
	permissionService,
	logger,
);

router.get(
	"/user/pastes",
	protect,
	catchAsync(pasteController.getUserPastes.bind(pasteController)),
);

router.get(
	"/user/stats",
	protect,
	catchAsync(pasteController.getUserStats.bind(pasteController)),
);

router.post(
	"/",
	optionalProtect,
	validate(createPasteSchema),
	catchAsync(pasteController.createPaste.bind(pasteController)),
);

router.get(
	"/check/:id",
	catchAsync(pasteController.checkIdAvailability.bind(pasteController)),
);

router.get(
	"/generate-word-id",
	catchAsync(pasteController.generateWordId.bind(pasteController)),
);

router.get(
	"/word-categories",
	catchAsync(pasteController.getWordCategories.bind(pasteController)),
);

router.get(
	"/:id",
	optionalProtect,
	catchAsync(pasteController.getPaste.bind(pasteController)),
);

router.delete(
	"/:id",
	optionalProtect,
	catchAsync(pasteController.deletePaste.bind(pasteController)),
);

router.put(
	"/:id",
	optionalProtect,
	validate(updatePasteSchema),
	catchAsync(pasteController.updatePaste.bind(pasteController)),
);

router.post(
	"/:id/verify-password",
	optionalProtect,
	catchAsync(pasteController.verifyPassword.bind(pasteController)),
);

router.post(
	"/validate-stream",
	catchAsync(async (req, res) => {
		const { url } = req.body;
		if (!url) {
			return res.status(400).json({ ok: false, error: "URL is empty" });
		}

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 6000);

			let response = await fetch(url, {
				method: "HEAD",
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				},
				signal: controller.signal,
			}).catch(async () => {
				return fetch(url, {
					method: "GET",
					headers: {
						Range: "bytes=0-0",
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					},
					signal: controller.signal,
				});
			});

			clearTimeout(timeoutId);

			if (
				response.ok ||
				response.status === 206 ||
				response.status === 200
			) {
				const contentType = response.headers.get("content-type") || "";
				const isMedia =
					contentType.startsWith("video/") ||
					contentType.includes("application/x-mpegurl") ||
					contentType.includes("application/dash+xml") ||
					contentType.startsWith("audio/") ||
					contentType.includes("octet-stream");

				if (isMedia) {
					return res.json({ ok: true });
				}

				if (contentType.includes("text/html")) {
					return res.json({
						ok: false,
						error: "URL points to a web page (text/html) instead of a direct raw video stream",
					});
				}

				return res.json({
					ok: false,
					error: `URL returned non-video format: ${contentType || "unknown"}. Make sure it is a direct movie stream.`,
				});
			}

			return res.json({
				ok: false,
				error: `Server responded with status ${response.status}. Make sure the link is live.`,
			});
		} catch (error: any) {
			return res.json({
				ok: false,
				error: `Unable to connect to stream server: ${error.message || "Connection refused"}. Make sure the link is live.`,
			});
		}
	}),
);

export default router;
