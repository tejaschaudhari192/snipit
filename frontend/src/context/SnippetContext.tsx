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

interface SnippetState {
	items: PasteData[];
	page: number;
	hasMore: boolean;
	loading: boolean;
	isLoadingMore: boolean;
}

interface SnippetContextType {
	history: SnippetState;
	profile: SnippetState;
	loadHistory: (isFirstLoad?: boolean) => Promise<void>;
	loadProfile: (isFirstLoad?: boolean) => Promise<void>;
	clearHistoryState: () => void;
	refreshSnippets: () => void;
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
				const stored = localStorage.getItem("items");
				const localItems: Array<PasteData> = stored
					? JSON.parse(stored)
					: [];

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
				}

				setHistory((prev) => {
					let newItems = [];
					if (isFirstLoad) {
						const userPasteIds = new Set(
							fetchedPastes.map((p) => p.id),
						);
						const filteredLocal = localItems.filter(
							(p) => !userPasteIds.has(p.id),
						);
						newItems = [...fetchedPastes, ...filteredLocal].sort(
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
			if (!user || isProfileFetching.current) return;

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

	const clearHistoryState = useCallback(() => {
		setHistory(initialState);
		setProfile(initialState);
	}, []);

	const refreshSnippets = useCallback(() => {
		loadHistory(true);
		if (user) loadProfile(true);
	}, [loadHistory, loadProfile, user]);

	// Refresh items when user changes
	useEffect(() => {
		clearHistoryState();
		loadHistory(true);
		if (user) loadProfile(true);
	}, [user, clearHistoryState, loadHistory, loadProfile]);

	return (
		<SnippetContext.Provider
			value={{
				history,
				profile,
				loadHistory,
				loadProfile,
				clearHistoryState,
				refreshSnippets,
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
