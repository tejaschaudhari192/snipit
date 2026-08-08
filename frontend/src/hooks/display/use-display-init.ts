import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPaste } from "@/lib/api/pastes";
import { guestStorage } from "@/utils/guest-storage";
import { detectContentMode } from "@/utils";
import type { PasteData, User } from "@/types";
import type { DisplayState } from "@/hooks/use-display-state";

interface UseDisplayInitProps {
	id: string | undefined;
	state: DisplayState;
	user: User | null;
}

export const useDisplayInit = ({ id, state, user }: UseDisplayInitProps) => {
	const location = useLocation();

	const {
		updateAllFromData,
		setContentType,
		setLoading,
		setIsEdit,
		setPaste,
	} = state;

	useEffect(() => {
		async function loadData() {
			try {
				if (location.state?.pasteData) {
					const data = location.state.pasteData as PasteData;
					updateAllFromData(data);
					setContentType(detectContentMode(data));
					setLoading(false);
					if (location.state.isCollaborative) setIsEdit(true);
					window.history.replaceState({}, document.title);
					return;
				}

				if (!id) return;

				const data = await getPaste(id);
				if (data) {
					updateAllFromData(data);
					setContentType(detectContentMode(data));
					if (!user) guestStorage.addToHistory(data);
				}
			} catch (err) {
				console.error("Failed to load snippet", err);
				setPaste(undefined);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, [
		id,
		location.state,
		user,
		updateAllFromData,
		setContentType,
		setLoading,
		setIsEdit,
		setPaste,
	]);
};
