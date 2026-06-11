import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { useApiHelpers } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { PasteData } from "@/types";
import { toast } from "sonner";
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
	savedProfile: SnippetState;
	filteredPastes: PasteData[] | null;
	stats: UserStats | null;
	loadHistory: (isFirstLoad?: boolean) => Promise<void>;
	loadProfile: (isFirstLoad?: boolean) => Promise<void>;
	loadSavedProfile: (isFirstLoad?: boolean) => Promise<void>;
	loadFilteredPastes: (label: string) => Promise<void>;
	clearFilter: () => void;
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
	const apiHelpers = useApiHelpers();

	const [history, setHistory] = useState<SnippetState>(initialState);
	const [profile, setProfile] = useState<SnippetState>(initialState);
	const [savedProfile, setSavedProfile] =
		useState<SnippetState>(initialState);
	const [filteredPastes, setFilteredPastes] = useState<PasteData[] | null>(
		null,
	);
	const [stats, setStats] = useState<UserStats | null>(null);

	const isHistoryFetching = useRef(false);
	const isProfileFetching = useRef(false);
	const isSavedProfileFetching = useRef(false);
	const historyStateRef = useRef(history);
	const profileStateRef = useRef(profile);
	const savedProfileStateRef = useRef(savedProfile);

	// Update refs when state changes
	useEffect(() => {
		historyStateRef.current = history;
	}, [history]);

	useEffect(() => {
		profileStateRef.current = profile;
	}, [profile]);

	useEffect(() => {
		savedProfileStateRef.current = savedProfile;
	}, [savedProfile]);

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
					const backendData = await apiHelpers.getUserPastes(
						isFirstLoad ? 1 : historyStateRef.current.page,
						10,
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
				if (isFirstLoad) toast.error(t("history.sync_failed"));
				setHistory((prev) => ({
					...prev,
					loading: false,
					isLoadingMore: false,
				}));
			} finally {
				isHistoryFetching.current = false;
			}
		},
		[user, apiHelpers, t], // removed history.page
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
					const data = await apiHelpers.getUserPastes(
						isFirstLoad ? 1 : profileStateRef.current.page,
						10,
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
				if (isFirstLoad) toast.error(t("profile.loading_failed"));
				setProfile((prev) => ({
					...prev,
					loading: false,
					isLoadingMore: false,
				}));
			} finally {
				isProfileFetching.current = false;
			}
		},
		[user, apiHelpers, t], // removed profile.page
	);

	const loadSavedProfile = useCallback(
		async (isFirstLoad = false) => {
			if (isSavedProfileFetching.current) return;

			isSavedProfileFetching.current = true;
			setSavedProfile((prev) => ({
				...prev,
				loading: isFirstLoad,
			}));

			try {
				if (user) {
					const data = await apiHelpers.getSavedPastes();
					setSavedProfile({
						items: data.snippets,
						page: 1,
						hasMore: false,
						loading: false,
						isLoadingMore: false,
					});
				} else {
					// Guest Pagination for Saved
					const allSaved = guestStorage.getSaved();
					const limit = 10;
					const page = isFirstLoad
						? 1
						: savedProfileStateRef.current.page;
					const startIndex = (page - 1) * limit;
					const endIndex = startIndex + limit;

					setSavedProfile(() => ({
						items: isFirstLoad
							? allSaved.slice(0, limit)
							: allSaved.slice(0, endIndex),
						page: page + 1,
						hasMore: endIndex < allSaved.length,
						loading: false,
						isLoadingMore: false,
					}));
				}
			} catch (err) {
				console.error("Failed to fetch saved pastes", err);
				setSavedProfile((prev) => ({
					...prev,
					loading: false,
				}));
			} finally {
				isSavedProfileFetching.current = false;
			}
		},
		[user, apiHelpers],
	);

	const loadFilteredPastes = useCallback(
		async (label: string) => {
			if (!user) return;
			try {
				const data = await apiHelpers.getSnippetsByLabel(label);
				setFilteredPastes(data.snippets);
			} catch (err) {
				console.error("Failed to fetch filtered pastes", err);
			}
		},
		[user, apiHelpers],
	);

	const clearFilter = useCallback(() => {
		setFilteredPastes(null);
	}, []);

	const loadStats = useCallback(async () => {
		if (!user) return;
		try {
			const data = await apiHelpers.getUserStats();
			setStats(data);
		} catch (err) {
			console.error("Failed to fetch user stats", err);
		}
	}, [user, apiHelpers]);

	const clearHistoryState = useCallback(() => {
		setHistory(initialState);
		setProfile(initialState);
		setSavedProfile(initialState);
		setFilteredPastes(null);
		setStats(null);
	}, []);

	const refreshSnippets = useCallback(() => {
		loadHistory(true);
		if (user) {
			loadProfile(true);
			loadSavedProfile(true);
			loadStats();
		}
	}, [loadHistory, loadProfile, loadSavedProfile, loadStats, user]);

	const deleteSnippet = useCallback(
		async (id: string) => {
			try {
				const itemInHistory = historyStateRef.current.items.find(
					(p) => p.id === id,
				);

				if (user && itemInHistory && itemInHistory.owner) {
					await apiHelpers.deletePaste(id);
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
				setSavedProfile((prev) => ({
					...prev,
					items: prev.items.filter((p) => p.id !== id),
				}));
				setFilteredPastes((prev) =>
					prev ? prev.filter((p) => p.id !== id) : null,
				);

				// Update Local Storage
				guestStorage.removeSnippetEverywhere(id);

				toast.success(
					t("messages.snippet_deleted_id", {
						id: `/${id}`,
					}),
				);
			} catch (err) {
				console.error("Failed to delete snippet", err);
				toast.error(t("messages.delete_failed"));
			}
		},
		[user, apiHelpers, t],
	);

	// Clear states when user changes/logs out
	useEffect(() => {
		clearHistoryState();
	}, [user, clearHistoryState]);

	return (
		<SnippetContext.Provider
			value={{
				history,
				profile,
				savedProfile,
				filteredPastes,
				stats,
				loadHistory,
				loadProfile,
				loadSavedProfile,
				loadFilteredPastes,
				clearFilter,
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
