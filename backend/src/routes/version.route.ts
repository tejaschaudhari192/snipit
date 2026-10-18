// Version endpoint for mobile app updates
import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, STORAGE_BUCKET } from "../config/supabase.js";
import defaultVersionData from "../config/app-version.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getVersionConfig() {
	// Candidate paths for both TypeScript dev (src/routes) and compiled production (dist/routes)
	const candidatePaths = [
		path.resolve(__dirname, "../config/app-version.json"),
		path.resolve(process.cwd(), "src/config/app-version.json"),
		path.resolve(process.cwd(), "dist/config/app-version.json"),
		path.resolve(process.cwd(), "backend/src/config/app-version.json"),
	];

	for (const p of candidatePaths) {
		try {
			if (fs.existsSync(p)) {
				const raw = fs.readFileSync(p, "utf-8");
				return JSON.parse(raw);
			}
		} catch {
			// Try next candidate path
		}
	}

	return (
		defaultVersionData || {
			version: "1.0.4",
			buildNumber: 5,
			minSupportedVersion: "1.0.0",
			forceUpdate: false,
			downloadUrl: "https://cpaste.vercel.app/mobile",
			changelog: [],
		}
	);
}

const router: Router = Router();

router.get("/version", (_req, res) => {
	const versionData = getVersionConfig();

	// If downloadUrl is not a full URL or user specifies apkFileName in Supabase storage:
	if (versionData.apkFileName && supabase && STORAGE_BUCKET) {
		const { data } = supabase.storage
			.from(STORAGE_BUCKET)
			.getPublicUrl(versionData.apkFileName);

		if (
			data?.publicUrl &&
			(!versionData.downloadUrl ||
				versionData.downloadUrl.includes("YOUR_SUPABASE_PROJECT_REF"))
		) {
			versionData.downloadUrl = data.publicUrl;
		}
	}

	res.json(versionData);
});

export default router;
