import { useState, useEffect, useCallback } from "react";
import { CONFIG } from "@/configurations";

export interface GithubContributor {
	id: number;
	login: string;
	avatar_url: string;
	html_url: string;
	contributions: number;
	type: string;
}

export interface GithubRepoInfo {
	name: string;
	full_name: string;
	html_url: string;
	description: string;
	stargazers_count: number;
	forks_count: number;
	open_issues_count: number;
	watchers_count?: number;
}

export interface CachedGithubData {
	timestamp: number;
	repo: GithubRepoInfo;
	contributors: GithubContributor[];
}

interface RawGithubContributor {
	id: number;
	login: string;
	avatar_url: string;
	html_url: string;
	contributions?: number;
	type?: string;
}

const STORAGE_KEY = CONFIG.storageKeys.githubRepoData;
const CACHE_TTL_MS = CONFIG.github.cacheDurationMs;

/**
 * Get cached GitHub data from localStorage
 */
function getCachedData(): CachedGithubData | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed: CachedGithubData = JSON.parse(raw);
		if (
			!parsed ||
			!parsed.timestamp ||
			!parsed.repo ||
			!Array.isArray(parsed.contributors)
		) {
			return null;
		}
		return parsed;
	} catch (e) {
		console.warn("Failed to read GitHub cache from localStorage", e);
		return null;
	}
}

/**
 * Save GitHub data to localStorage
 */
function setCachedData(
	repo: GithubRepoInfo,
	contributors: GithubContributor[],
): void {
	try {
		const payload: CachedGithubData = {
			timestamp: Date.now(),
			repo,
			contributors,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch (e) {
		console.warn("Failed to save GitHub cache to localStorage", e);
	}
}

/**
 * Fetch GitHub repository info and contributors directly from GitHub API with 3-hour localStorage cache.
 * No hardcoded fallback data: GitHub is the single unified source of truth.
 */
export async function fetchGithubData(forceRefresh = false): Promise<{
	repo: GithubRepoInfo | null;
	contributors: GithubContributor[];
	isFromCache: boolean;
}> {
	const cached = getCachedData();
	const now = Date.now();

	// If cache is fresh and forceRefresh is false, return cached
	if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
		return {
			repo: cached.repo,
			contributors: cached.contributors,
			isFromCache: true,
		};
	}

	const { owner, repo } = CONFIG.github;
	const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
	const contributorsApiUrl = `https://api.github.com/repos/${owner}/${repo}/contributors`;

	try {
		const [repoRes, contribRes] = await Promise.all([
			fetch(repoApiUrl, {
				headers: { Accept: "application/vnd.github.v3+json" },
			}),
			fetch(contributorsApiUrl, {
				headers: { Accept: "application/vnd.github.v3+json" },
			}),
		]);

		if (!repoRes.ok || !contribRes.ok) {
			throw new Error(
				`GitHub API error: repo status ${repoRes.status}, contributors status ${contribRes.status}`,
			);
		}

		const repoJson = await repoRes.json();
		const contribJson = await contribRes.json();

		const repoInfo: GithubRepoInfo = {
			name: repoJson.name || repo,
			full_name: repoJson.full_name || `${owner}/${repo}`,
			html_url: repoJson.html_url || CONFIG.github.repoUrl,
			description: repoJson.description || "",
			stargazers_count: Number(repoJson.stargazers_count) || 0,
			forks_count: Number(repoJson.forks_count) || 0,
			open_issues_count: Number(repoJson.open_issues_count) || 0,
			watchers_count:
				Number(repoJson.subscribers_count || repoJson.watchers_count) ||
				0,
		};

		const contributors: GithubContributor[] = Array.isArray(contribJson)
			? (contribJson as RawGithubContributor[]).map((c) => ({
					id: c.id,
					login: c.login,
					avatar_url: c.avatar_url,
					html_url: c.html_url,
					contributions: c.contributions || 0,
					type: c.type || "User",
				}))
			: [];

		// Cache in localStorage for 3 hours
		setCachedData(repoInfo, contributors);

		return {
			repo: repoInfo,
			contributors,
			isFromCache: false,
		};
	} catch (error) {
		console.warn("GitHub fetch failed", error);

		// If a previous real cache exists, serve it
		if (cached) {
			return {
				repo: cached.repo,
				contributors: cached.contributors,
				isFromCache: true,
			};
		}

		return {
			repo: null,
			contributors: [],
			isFromCache: false,
		};
	}
}

/**
 * React hook to access live GitHub repository and contributor data
 */
export function useGithubData() {
	const cached = getCachedData();
	const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

	const [repo, setRepo] = useState<GithubRepoInfo | null>(
		cached?.repo || null,
	);
	const [contributors, setContributors] = useState<GithubContributor[]>(
		cached?.contributors || [],
	);
	const [loading, setLoading] = useState<boolean>(!isFresh);
	const [error, setError] = useState<string | null>(null);
	const [isFromCache, setIsFromCache] = useState<boolean>(Boolean(isFresh));

	const load = useCallback(async (force = false) => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchGithubData(force);
			setRepo(data.repo);
			setContributors(data.contributors);
			setIsFromCache(data.isFromCache);
		} catch (err: unknown) {
			const message =
				err instanceof Error
					? err.message
					: "Failed to load GitHub data";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!isFresh) {
			load();
		}
	}, [isFresh, load]);

	return {
		repo,
		contributors,
		loading,
		error,
		isFromCache,
		refresh: () => load(true),
	};
}
