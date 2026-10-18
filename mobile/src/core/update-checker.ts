// Mobile update checking utility
import { CONFIG } from "../config/configuration";
import { offlineVault } from "../core/vault-storage";

function parseSemver(v: string) {
  const parts = v.split("-")[0].split(".").map((n) => parseInt(n, 10) || 0);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

function compareSemver(v1: string, v2: string): number {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);

  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1;
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1;
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1;
  return 0;
}

/**
 * Fetches version information from the backend.
 * Returns the raw JSON object defined in the backend version route.
 */
export async function fetchVersionInfo() {
  const baseUrl = await offlineVault.getApiBaseUrl();
  const resp = await fetch(`${baseUrl}/app/version`);
  if (!resp.ok) throw new Error("Failed to fetch version info");
  return await resp.json();
}

/**
 * Checks whether an update is available compared to the current app version.
 * Returns an object containing flags and the fetched version data.
 */
export async function checkAppUpdate() {
  const serverInfo = await fetchVersionInfo();
  const currentVersion = CONFIG.APP_VERSION;
  const isNewer = compareSemver(serverInfo.version, currentVersion) > 0;
  const force =
    Boolean(serverInfo.forceUpdate) &&
    Boolean(serverInfo.minSupportedVersion) &&
    compareSemver(currentVersion, serverInfo.minSupportedVersion) < 0;

  return {
    isAvailable: isNewer || force,
    forceUpdate: force,
    latestVersion: serverInfo.version,
    changelog: serverInfo.changelog,
    downloadUrl: serverInfo.downloadUrl,
  };
}
