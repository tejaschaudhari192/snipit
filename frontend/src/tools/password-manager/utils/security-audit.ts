import zxcvbn from "zxcvbn";
import type { PasswordItem } from "../types";
import { isOlderThan3Months } from "./formatters";

export interface PasswordAuditItem {
	item: PasswordItem;
	score: number; // 0 to 4 (zxcvbn)
	isWeak: boolean;
	isReused: boolean;
	reuseCount: number;
	isStale: boolean;
	issues: string[];
}

export interface VaultSecurityReport {
	totalItems: number;
	loginsCount: number;
	cardsCount: number;
	apiKeysCount: number;
	passkeysCount: number;
	credFilesCount: number;
	notesCount: number;
	identitiesCount: number;

	// Password metrics
	totalPasswordsEvaluated: number;
	healthScore: number; // 0 - 100
	healthStatus: "excellent" | "good" | "warning" | "critical";

	// Vulnerabilities
	weakPasswordsCount: number;
	reusedPasswordsCount: number;
	stalePasswordsCount: number;
	no2faOrFolderCount: number;

	// Score distribution
	scoreDistribution: {
		veryWeak: number; // 0
		weak: number; // 1
		fair: number; // 2
		strong: number; // 3
		veryStrong: number; // 4
	};

	// Detailed audited items
	auditedItems: PasswordAuditItem[];
	weakItems: PasswordAuditItem[];
	reusedItems: PasswordAuditItem[];
	staleItems: PasswordAuditItem[];
}

/**
 * Computes a detailed security health audit for all items in the vault.
 */
export function analyzeVaultSecurity(
	items: PasswordItem[],
): VaultSecurityReport {
	const totalItems = items.length;

	let loginsCount = 0;
	let cardsCount = 0;
	let apiKeysCount = 0;
	let passkeysCount = 0;
	let credFilesCount = 0;
	let notesCount = 0;
	let identitiesCount = 0;

	// Count by type
	items.forEach((item) => {
		const type = item.itemType || "login";
		if (type === "login") loginsCount++;
		else if (type === "card") cardsCount++;
		else if (type === "apikey") apiKeysCount++;
		else if (type === "passkey") passkeysCount++;
		else if (type === "credfile") credFilesCount++;
		else if (type === "note") notesCount++;
		else if (type === "identity") identitiesCount++;
	});

	// Build map of password frequencies to detect reused passwords
	const passwordUsageMap = new Map<string, number>();
	items.forEach((item) => {
		const pwd = item.password || item.metadata?.password;
		if (pwd && typeof pwd === "string" && pwd.trim().length > 0) {
			passwordUsageMap.set(pwd, (passwordUsageMap.get(pwd) || 0) + 1);
		}
	});

	const scoreDistribution = {
		veryWeak: 0,
		weak: 0,
		fair: 0,
		strong: 0,
		veryStrong: 0,
	};

	const auditedItems: PasswordAuditItem[] = [];
	let totalScorePoints = 0;
	let evaluatedCount = 0;

	items.forEach((item) => {
		const pwd = item.password || item.metadata?.password;
		if (!pwd || typeof pwd !== "string" || pwd.trim().length === 0) {
			return;
		}

		evaluatedCount++;
		const evalResult = zxcvbn(pwd);
		const score = evalResult.score; // 0 - 4
		totalScorePoints += score;

		if (score === 0) scoreDistribution.veryWeak++;
		else if (score === 1) scoreDistribution.weak++;
		else if (score === 2) scoreDistribution.fair++;
		else if (score === 3) scoreDistribution.strong++;
		else if (score === 4) scoreDistribution.veryStrong++;

		const isWeak = score <= 1 || pwd.length < 8;
		const reuseCount = passwordUsageMap.get(pwd) || 1;
		const isReused = reuseCount > 1;
		const isStale = isOlderThan3Months(item.updatedAt || item.createdAt);

		const issues: string[] = [];
		if (score === 0) issues.push("Very weak password");
		else if (score === 1) issues.push("Weak password");
		if (pwd.length < 8) issues.push("Password length under 8 characters");
		if (isReused) issues.push(`Reused across ${reuseCount} items`);
		if (isStale) issues.push("Not updated in over 90 days");

		auditedItems.push({
			item,
			score,
			isWeak,
			isReused,
			reuseCount,
			isStale,
			issues,
		});
	});

	const weakItems = auditedItems.filter((i) => i.isWeak);
	const reusedItems = auditedItems.filter((i) => i.isReused);
	const staleItems = auditedItems.filter((i) => i.isStale);
	const no2faOrFolderCount = items.filter(
		(i) => !i.folderId || i.folderId === "none",
	).length;

	// Calculate overall composite health score (0 - 100)
	// Factors: average password score (60%), penalty for reused passwords (25%), penalty for stale passwords (15%)
	let healthScore = 100;

	if (evaluatedCount > 0) {
		const avgScoreRatio = totalScorePoints / (evaluatedCount * 4); // 0 to 1
		const baseScore = avgScoreRatio * 60; // Up to 60 pts

		const reuseRatio = reusedItems.length / evaluatedCount;
		const reuseScore = Math.max(0, (1 - reuseRatio) * 25); // Up to 25 pts

		const staleRatio = staleItems.length / evaluatedCount;
		const staleScore = Math.max(0, (1 - staleRatio) * 15); // Up to 15 pts

		healthScore = Math.round(baseScore + reuseScore + staleScore);
	} else if (totalItems === 0) {
		healthScore = 100;
	}

	let healthStatus: "excellent" | "good" | "warning" | "critical" =
		"excellent";
	if (healthScore < 50) healthStatus = "critical";
	else if (healthScore < 70) healthStatus = "warning";
	else if (healthScore < 85) healthStatus = "good";

	return {
		totalItems,
		loginsCount,
		cardsCount,
		apiKeysCount,
		passkeysCount,
		credFilesCount,
		notesCount,
		identitiesCount,
		totalPasswordsEvaluated: evaluatedCount,
		healthScore,
		healthStatus,
		weakPasswordsCount: weakItems.length,
		reusedPasswordsCount: reusedItems.length,
		stalePasswordsCount: staleItems.length,
		no2faOrFolderCount,
		scoreDistribution,
		auditedItems,
		weakItems,
		reusedItems,
		staleItems,
	};
}
