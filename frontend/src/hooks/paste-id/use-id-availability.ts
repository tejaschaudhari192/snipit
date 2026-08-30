import { useState, useEffect } from "react";
import { checkIdAvailability } from "@/lib/api/pastes";

export const useIdAvailability = (
	customId: string,
	idTypeTab: string,
	originalId?: string,
) => {
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
	const [isChecking, setIsChecking] = useState(false);

	const isCurrentId = Boolean(
		originalId && customId.trim() && customId.trim() === originalId.trim(),
	);

	useEffect(() => {
		const id = customId.trim();
		if (!id || (idTypeTab !== "dynamic" && idTypeTab !== "semantic")) {
			setIsAvailable(null);
			return;
		}

		if (originalId && id === originalId.trim()) {
			setIsAvailable(true);
			setIsChecking(false);
			return;
		}

		const timer = setTimeout(async () => {
			setIsChecking(true);
			try {
				const { available } = await checkIdAvailability(id);
				setIsAvailable(available);
			} catch (error) {
				console.error("Failed to check ID availability:", error);
				setIsAvailable(null);
			} finally {
				setIsChecking(false);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [customId, idTypeTab, originalId]);

	return { isAvailable, isChecking, isCurrentId };
};
