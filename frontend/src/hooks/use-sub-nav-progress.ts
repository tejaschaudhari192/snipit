import { useState, useCallback, useRef } from "react";

export function useSubNavProgress() {
	const [isLoading, setIsLoading] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const startProgress = useCallback(() => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		setIsLoading(true);
	}, []);

	const completeProgress = useCallback(() => {
		setIsLoading(false);
	}, []);

	const withProgress = useCallback(
		async <T>(fn: () => Promise<T>): Promise<T> => {
			startProgress();
			try {
				return await fn();
			} finally {
				completeProgress();
			}
		},
		[startProgress, completeProgress],
	);

	return {
		isLoading,
		startProgress,
		completeProgress,
		withProgress,
	};
}
