// Mobile update checking utility
import { CONFIG } from "../config/configuration";
import { offlineVault } from "../core/vault-storage";

import * as Device from "expo-device";

function parseSemver(v: string) {
  const parts = v.split("-")[0].split(".").map((n) => parseInt(n, 10) || 0);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

export function compareSemver(v1: string, v2: string): number {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);

  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1;
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1;
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1;
  return 0;
}

/**
 * Returns primary CPU architecture / ABI of the current device if available
 */
export function getDeviceCpuArch(): string {
  try {
    const supported = Device.supportedCpuArchitectures;
    if (Array.isArray(supported) && supported.length > 0) {
      return supported[0].toLowerCase();
    }
  } catch {
    // ignore
  }
  return "";
}

/**
 * Resolves the optimal download URL for this device's architecture.
 */
export function resolveDownloadUrl(serverInfo: any): string {
  const arch = getDeviceCpuArch();
  const downloadUrls = serverInfo.downloadUrls;

  if (downloadUrls && typeof downloadUrls === "object") {
    if (arch.includes("arm64") || arch.includes("aarch64")) {
      if (downloadUrls["arm64-v8a"]) return downloadUrls["arm64-v8a"];
    } else if (arch.includes("v7a") || arch.includes("armeabi")) {
      if (downloadUrls["armeabi-v7a"]) return downloadUrls["armeabi-v7a"];
    } else if (arch && downloadUrls[arch]) {
      return downloadUrls[arch];
    }
    if (downloadUrls["universal"]) return downloadUrls["universal"];
  }

  return serverInfo.downloadUrl || "https://cpaste.vercel.app/snipit-universal";
}

/**
 * Fetches version information from the backend.
 * Passes device CPU architecture as a query parameter for server-side matching.
 */
export async function fetchVersionInfo() {
  const baseUrl = await offlineVault.getApiBaseUrl();
  const arch = getDeviceCpuArch();
  const query = arch ? `?arch=${encodeURIComponent(arch)}` : "";
  try {
    const resp = await fetch(`${baseUrl}/app/version${query}`);
    if (!resp.ok) {
      throw new Error(`Server returned status ${resp.status}`);
    }
    return await resp.json();
  } catch (err: any) {
    const msg = (err?.message || "").toLowerCase();
    if (
      msg.includes("unknownhostexception") ||
      msg.includes("network request failed") ||
      msg.includes("failed to fetch") ||
      msg.includes("enotfound") ||
      msg.includes("econnrefused") ||
      msg.includes("offline")
    ) {
      throw new Error("You are currently offline. Please connect to the internet and try again.");
    }
    throw new Error("Unable to check for updates right now. Please check your connection and try again.");
  }
}

/**
 * Checks whether an update is available compared to the current app version.
 * Returns an object containing flags and the fetched version data with architecture-tailored download URL.
 */
export async function checkAppUpdate() {
  const serverInfo = await fetchVersionInfo();
  const currentVersion = CONFIG.APP_VERSION;
  const isNewer = compareSemver(serverInfo.version, currentVersion) > 0;
  const force =
    Boolean(serverInfo.forceUpdate) &&
    Boolean(serverInfo.minSupportedVersion) &&
    compareSemver(currentVersion, serverInfo.minSupportedVersion) < 0;

  // Filter changelog entries to only show versions strictly newer than current app version
  const newerChangelogs = Array.isArray(serverInfo.changelog)
    ? serverInfo.changelog.filter((entry: any) =>
        entry && entry.version ? compareSemver(entry.version, currentVersion) > 0 : false
      )
    : [];

  const finalDownloadUrl = resolveDownloadUrl(serverInfo);

  return {
    isAvailable: isNewer || force,
    forceUpdate: force,
    latestVersion: serverInfo.version,
    changelog: newerChangelogs,
    downloadUrl: finalDownloadUrl,
  };
}
