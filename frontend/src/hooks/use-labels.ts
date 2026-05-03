import { useState, useCallback, useEffect, useMemo } from "react";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const useLabels = (pasteId?: string) => {
	const [labels, setLabels] = useState<string[]>([]);
	const [allLabels, setAllLabels] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const apiHelpers = useApiHelpers();
	const { user } = useAuth();

	const fetchAllLabels = useCallback(async () => {
		if (!user) return;
		try {
			const res = await apiHelpers.getAllLabels();
			setAllLabels(res.labels || []);
		} catch (error) {
			console.error("Failed to fetch all labels", error);
		}
	}, [apiHelpers, user]);

	const fetchLabels = useCallback(async () => {
		if (!pasteId || !user) return;
		setIsLoading(true);
		try {
			const res = await apiHelpers.getLabels(pasteId);
			setLabels(res.labels || []);
		} catch {
			console.error("Failed to fetch snippet labels");
		} finally {
			setIsLoading(false);
		}
	}, [pasteId, apiHelpers, user]);

	useEffect(() => {
		fetchLabels();
		fetchAllLabels();
	}, [fetchLabels, fetchAllLabels]);

	const updateLabels = useCallback(
		async (newLabels: string[]) => {
			if (!pasteId || !user) return false;

			const previousLabels = [...labels];
			setLabels(newLabels);

			try {
				await apiHelpers.updateLabels(pasteId, newLabels);
				fetchAllLabels();
				return true;
			} catch {
				toast.error("Failed to update labels");
				setLabels(previousLabels);
				return false;
			}
		},
		[pasteId, user, labels, apiHelpers, fetchAllLabels],
	);

	return useMemo(
		() => ({
			labels,
			allLabels,
			isLoading,
			updateLabels,
			fetchLabels,
		}),
		[labels, allLabels, isLoading, updateLabels, fetchLabels],
	);
};
