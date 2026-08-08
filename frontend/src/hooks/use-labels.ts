import { useState, useCallback, useEffect, useMemo } from "react";
import {
	getAllLabels,
	getLabels,
	updateLabels as apiUpdateLabels,
} from "@/lib/api/labels";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";

export const useLabels = (pasteId?: string) => {
	const [labels, setLabels] = useState<string[]>([]);
	const [allLabels, setAllLabels] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const { user } = useAuth();

	const fetchAllLabels = useCallback(async () => {
		if (!user) return;
		try {
			const res = await getAllLabels();
			setAllLabels(res.labels || []);
		} catch (error) {
			console.error("Failed to fetch all labels", error);
		}
	}, [user]);

	const fetchLabels = useCallback(async () => {
		if (!pasteId || !user) return;
		setIsLoading(true);
		try {
			const res = await getLabels(pasteId);
			setLabels(res.labels || []);
		} catch {
			console.error("Failed to fetch snippet labels");
		} finally {
			setIsLoading(false);
		}
	}, [pasteId, user]);

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
				await apiUpdateLabels(pasteId, newLabels);
				fetchAllLabels();
				return true;
			} catch {
				toast.add({ title: "Failed to update labels", type: "error" });
				setLabels(previousLabels);
				return false;
			}
		},
		[pasteId, user, labels, fetchAllLabels],
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
