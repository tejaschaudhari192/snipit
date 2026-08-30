import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { getUserPastes, deletePaste, getUserStats } from "@/lib/api/pastes";
import { useAuth } from "@/context/AuthContext";
import type { PasteData } from "@/types";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import { guestStorage } from "@/utils/guest-storage";

interface SnippetState {
	items: PasteData[];
	page: number;
	hasMore: boolean;
	loading: boolean;
	isLoadingMore: boolean;
}

interface UserStats {
	totalSnippets: number;
	totalViews: number;
	mostUsedLanguage: string;
}

interface SnippetContextType {
	history: SnippetState;
	profile: SnippetState;
	stats: UserStats | null;
	loadHistory: (isFirstLoad?: boolean) => Promise<void>;
	loadProfile: (isFirstLoad?: boolean) => Promise<void>;
	loadStats: () => Promise<void>;
	clearHistoryState: () => void;
	refreshSnippets: () => void;
	deleteSnippet: (id: string) => Promise<void>;
}

const SnippetContext = createContext<SnippetContextType | undefined>(undefined);

const initialState: SnippetState = {
	items: [],
	page: 1,
	hasMore: true,
	loading: true,
	isLoadingMore: false,
};

export const SnippetProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { t } = useTranslation();
	const { user } = useAuth();

	const [history, setHistory] = useState<SnippetState>(initialState);
	const [profile, setProfile] = useState<SnippetState>(initialState);
	const [stats, setStats] = useState<UserStats | null>(null);

	const isHistoryFetching = useRef(false);
	const isProfileFetching = useRef(false);
	const historyStateRef = useRef(history);
	const profileStateRef = useRef(profile);

	// Update refs when state changes
	useEffect(() => {
		historyStateRef.current = history;
	}, [history]);

	useEffect(() => {
		profileStateRef.current = profile;
	}, [profile]);

	const loadHistory = useCallback(
		async (isFirstLoad = false) => {
			if (isHistoryFetching.current) return;

			const currentState = historyStateRef.current;
			if (
				!isFirstLoad &&
				(!currentState.hasMore || currentState.isLoadingMore)
			) {
				return;
			}

			isHistoryFetching.current = true;
			setHistory((prev) => ({
				...prev,
				loading: isFirstLoad,
				isLoadingMore: !isFirstLoad,
			}));

			try {
				let fetchedPastes: PasteData[] = [];
				let hasMore = false;

				if (user) {
					// Use current state for page number
					const limit = isFirstLoad ? 20 : 10;
					const backendData = await getUserPastes(
						isFirstLoad ? 1 : historyStateRef.current.page,
						limit,
					);
					fetchedPastes = backendData.pastes;
					hasMore = backendData.hasMore;

					setHistory((prev) => {
						let newItems = [];
						if (isFirstLoad) {
							const localItems = guestStorage.getHistory();
							const userPasteIds = new Set(
								fetchedPastes.map((p) => p.id),
							);
							const filteredLocal = localItems.filter(
								(p) => !userPasteIds.has(p.id),
							);
							newItems = [
								...fetchedPastes,
								...filteredLocal,
							].sort(
								(a, b) =>
									new Date(b.createdAt).getTime() -
									new Date(a.createdAt).getTime(),
							);
						} else {
							const existingIds = new Set(
								prev.items.map((p) => p.id),
							);
							const newUniquePastes = fetchedPastes.filter(
								(p) => !existingIds.has(p.id),
							);
							newItems = [...prev.items, ...newUniquePastes].sort(
								(a, b) =>
									new Date(b.createdAt).getTime() -
									new Date(a.createdAt).getTime(),
							);
						}

						return {
							items: newItems,
							page: isFirstLoad ? 2 : prev.page + 1,
							hasMore: user ? hasMore : false,
							loading: false,
							isLoadingMore: false,
						};
					});
				} else {
					// Guest Pagination for History
					const allHistory = guestStorage.getHistory();
					const limit = 10;
					const page = isFirstLoad ? 1 : historyStateRef.current.page;
					const startIndex = (page - 1) * limit;
					const endIndex = startIndex + limit;

					setHistory(() => ({
						items: isFirstLoad
							? allHistory.slice(0, limit)
							: allHistory.slice(0, endIndex),
						page: page + 1,
						hasMore: endIndex < allHistory.length,
						loading: false,
						isLoadingMore: false,
					}));
				}
			} catch (err) {
				console.error("Failed to fetch history", err);
				if (isFirstLoad)
					toast.add({
						title: t("history.sync_failed"),
						type: "error",
					});
				setHistory((prev) => ({
					...prev,
					loading: false,
					isLoadingMore: false,
				}));
			} finally {
				isHistoryFetching.current = false;
			}
		},
		[user, t], // removed history.page
	);

	const loadProfile = useCallback(
		async (isFirstLoad = false) => {
			if (isProfileFetching.current) return;

			const currentState = profileStateRef.current;
			if (
				!isFirstLoad &&
				(!currentState.hasMore || currentState.isLoadingMore)
			) {
				return;
			}

			isProfileFetching.current = true;
			setProfile((prev) => ({
				...prev,
				loading: isFirstLoad,
				isLoadingMore: !isFirstLoad,
			}));

			try {
				if (user) {
					const limit = isFirstLoad ? 20 : 10;
					const data = await getUserPastes(
						isFirstLoad ? 1 : profileStateRef.current.page,
						limit,
					);

					setProfile((prev) => ({
						items: isFirstLoad
							? data.pastes
							: [...prev.items, ...data.pastes],
						page: isFirstLoad ? 2 : prev.page + 1,
						hasMore: data.hasMore,
						loading: false,
						isLoadingMore: false,
					}));
				} else {
					// Guest Pagination for Created
					const allCreated = guestStorage.getCreated();
					const limit = 10;
					const page = isFirstLoad ? 1 : profileStateRef.current.page;
					const startIndex = (page - 1) * limit;
					const endIndex = startIndex + limit;

					setProfile(() => ({
						items: isFirstLoad
							? allCreated.slice(0, limit)
							: allCreated.slice(0, endIndex),
						page: page + 1,
						hasMore: endIndex < allCreated.length,
						loading: false,
						isLoadingMore: false,
					}));
				}
			} catch (err) {
				console.error("Failed to fetch profile pastes", err);
				if (isFirstLoad)
					toast.add({
						title: t("profile.loading_failed"),
						type: "error",
					});
				setProfile((prev) => ({
					...prev,
					loading: false,
					isLoadingMore: false,
				}));
			} finally {
				isProfileFetching.current = false;
			}
		},
		[user, t], // removed profile.page
	);

	const loadStats = useCallback(async () => {
		if (!user) return;
		try {
			const data = await getUserStats();
			setStats(data);
		} catch (err) {
			console.error("Failed to fetch user stats", err);
		}
	}, [user]);

	const clearHistoryState = useCallback(() => {
		setHistory(initialState);
		setProfile(initialState);
		setStats(null);
	}, []);

	const refreshSnippets = useCallback(() => {
		loadHistory(true);
		if (user) {
			loadProfile(true);
			loadStats();
		}
	}, [loadHistory, loadProfile, loadStats, user]);

	const deleteSnippet = useCallback(
		async (id: string) => {
			const toastId = toast.add({
				title: t("messages.loading.deleting"),
				type: "info",
			});
			try {
				const itemInHistory = historyStateRef.current.items.find(
					(p) => p.id === id,
				);

				if (user && itemInHistory && itemInHistory.owner) {
					await deletePaste(id);
				}

				// Update Local State
				setHistory((prev) => ({
					...prev,
					items: prev.items.filter((p) => p.id !== id),
				}));
				setProfile((prev) => ({
					...prev,
					items: prev.items.filter((p) => p.id !== id),
				}));

				// Update Local Storage
				guestStorage.removeSnippetEverywhere(id);

				toast.update(toastId, {
					title: t("messages.success.snippet_deleted_id", {
						id: `/${id}`,
					}),
					type: "success",
				});
			} catch (err) {
				console.error("Failed to delete snippet", err);
				toast.update(toastId, {
					title: t("messages.error.delete_failed"),
					type: "error",
				});
			}
		},
		[user, t],
	);

	// Load history and stats when user changes or on mount
	useEffect(() => {
		clearHistoryState();
		loadHistory(true);
		if (user) {
			loadProfile(true);
			loadStats();
		}
	}, [user, clearHistoryState, loadHistory, loadProfile, loadStats]);

	return (
		<SnippetContext.Provider
			value={{
				history,
				profile,
				stats,
				loadHistory,
				loadProfile,
				loadStats,
				clearHistoryState,
				refreshSnippets,
				deleteSnippet,
			}}
		>
			{children}
		</SnippetContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSnippets = () => {
	const context = useContext(SnippetContext);
	if (!context) {
		throw new Error("useSnippets must be used within a SnippetProvider");
	}
	return context;
};
