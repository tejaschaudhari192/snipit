import logger from "@/config/logger.js";

export interface ParsedDeviceInfo {
	deviceType: "desktop" | "mobile" | "tablet";
	deviceName: string;
	browser: string;
	os: string;
	location: string;
	cleanIp: string;
}

/**
 * Parse user agent and resolve approximate IP location
 */
export async function parseUserAgentDetails(
	userAgentHeader: string,
	ipAddress: string,
): Promise<ParsedDeviceInfo> {
	let deviceType: "desktop" | "mobile" | "tablet";
	let browser = "Unknown Browser";
	let os = "Unknown OS";
	let deviceName: string;

	const ua = userAgentHeader || "";
	if (/ipad|tablet/i.test(ua)) {
		deviceType = "tablet";
		deviceName = "Tablet Device";
	} else if (/mobi|iphone|android/i.test(ua)) {
		deviceType = "mobile";
		deviceName = /iphone/i.test(ua) ? "Apple iPhone" : "Android Smartphone";
	} else {
		deviceType = "desktop";
		deviceName = /macintosh|mac os x/i.test(ua)
			? "Apple Mac PC"
			: "Windows PC";
	}

	if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua)) {
		browser = "Google Chrome";
	} else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
		browser = "Apple Safari";
	} else if (/firefox|fxios/i.test(ua)) {
		browser = "Mozilla Firefox";
	} else if (/edge|edg/i.test(ua)) {
		browser = "Microsoft Edge";
	} else if (/opera|opr/i.test(ua)) {
		browser = "Opera";
	}

	if (/windows/i.test(ua)) {
		os = "Windows";
	} else if (/macintosh|mac os x/i.test(ua)) {
		os = "macOS";
	} else if (/iphone|ipad|ipod/i.test(ua)) {
		os = "iOS";
	} else if (/android/i.test(ua)) {
		os = "Android";
	} else if (/linux/i.test(ua)) {
		os = "Linux";
	}

	// Clean and resolve IP Location
	let location = "Unknown Location";
	const cleanIp =
		ipAddress === "::1" || ipAddress === "127.0.0.1"
			? "Localhost"
			: ipAddress;

	if (
		cleanIp !== "Localhost" &&
		!cleanIp.startsWith("192.168.") &&
		!cleanIp.startsWith("10.")
	) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 1500);

			const response = await fetch(`http://ip-api.com/json/${cleanIp}`, {
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (response.ok) {
				const ipData = (await response.json()) as {
					city?: string;
					country?: string;
					status?: string;
				};
				if (ipData.status === "success") {
					location = `${ipData.city || "Unknown City"}, ${ipData.country || "Unknown Country"}`;
				}
			}
		} catch (err) {
			logger.warn(`Failed to resolve IP location for ${cleanIp}:`, err);
		}
	} else {
		location = "Localhost Network";
	}

	return {
		deviceType,
		deviceName,
		browser,
		os,
		location,
		cleanIp,
	};
}
