import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
	hasMore: boolean;
	isLoading: boolean;
	loadMore: () => void;
	threshold?: number;
}

/**
 * A reusable hook for implementing infinite scroll using Intersection Observer.
 * @param options configuration options for the hook
 * @returns a ref to be attached to the loader element
 */
export const useInfiniteScroll = ({
	hasMore,
	isLoading,
	loadMore,
	threshold = 0.1,
}: UseInfiniteScrollOptions) => {
	const loaderRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const target = entries[0];
				if (target && target.isIntersecting && hasMore && !isLoading) {
					loadMore();
				}
			},
			{ threshold },
		);

		const currentLoader = loaderRef.current;
		if (currentLoader) {
			observer.observe(currentLoader);
		}

		return () => {
			if (currentLoader) {
				observer.unobserve(currentLoader);
			}
		};
	}, [hasMore, isLoading, loadMore, threshold]);

	return loaderRef;
};
