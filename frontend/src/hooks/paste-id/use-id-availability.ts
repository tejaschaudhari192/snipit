import { useState, useEffect } from "react";
import { useApiHelpers } from "@/lib/api";

export const useIdAvailability = (customId: string, idTypeTab: string) => {
	const { checkIdAvailability } = useApiHelpers();
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
	const [isChecking, setIsChecking] = useState(false);

	useEffect(() => {
		const id = customId.trim();
		if (!id || (idTypeTab !== "dynamic" && idTypeTab !== "semantic")) {
			setIsAvailable(null);
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
	}, [customId, idTypeTab, checkIdAvailability]);

	return { isAvailable, isChecking };
};
