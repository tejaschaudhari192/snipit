import { lazy, type ComponentType } from "react";

/**
 * Enhanced lazy loader that automatically retries when a chunk fails to load
 * (e.g. temporary network drop, deployment cache invalidation).
 *
 * If retries fail, it triggers a page refresh once per session to fetch fresh assets.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
	componentImport: () => Promise<{ default: T }>,
	retriesLeft = 2,
	interval = 1000,
): ReturnType<typeof lazy<T>> {
	return lazy(
		() =>
			new Promise<{ default: T }>((resolve, reject) => {
				componentImport()
					.then(resolve)
					.catch((error: unknown) => {
						if (retriesLeft > 0) {
							setTimeout(() => {
								lazyWithRetry(
									componentImport,
									retriesLeft - 1,
									interval * 1.5,
								);
							}, interval);
						} else {
							// Check if we already reloaded to prevent infinite refresh loops
							const hasReloaded = window.sessionStorage.getItem(
								"chunk_retry_reloaded",
							);
							const isChunkError =
								error instanceof Error &&
								(/Loading chunk [\d]+ failed/i.test(
									error.message,
								) ||
									/Failed to fetch dynamically imported module/i.test(
										error.message,
									) ||
									/Importing a module script failed/i.test(
										error.message,
									));

							if (isChunkError && !hasReloaded) {
								window.sessionStorage.setItem(
									"chunk_retry_reloaded",
									"true",
								);
								window.location.reload();
								return;
							}

							reject(error);
						}
					});
			}),
	);
}
