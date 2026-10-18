// Version endpoint for mobile app updates
import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, STORAGE_BUCKET } from "../config/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../config/app-version.json");

function getVersionConfig() {
	try {
		if (fs.existsSync(configPath)) {
			const raw = fs.readFileSync(configPath, "utf-8");
			return JSON.parse(raw);
		}
	} catch (err) {
		console.error("Error reading app-version.json:", err);
	}
	return {
		version: "1.0.0",
		buildNumber: 1,
		minSupportedVersion: "1.0.0",
		forceUpdate: false,
		downloadUrl: "",
		changelog: [],
	};
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
