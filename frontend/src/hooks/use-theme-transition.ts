import { useCallback } from "react";

export const useThemeTransition = () => {
	const startTransition = useCallback((updateFn: () => void) => {
		if ("startViewTransition" in document) {
			document.startViewTransition(updateFn);
		} else {
			updateFn();
		}
	}, []);

	return { startTransition };
};
