/**
 * ScreenPerceiver: Generic DOM and Screen Observation Engine.
 * Watches the active viewport or result containers for loaders to finish
 * and extracts semantic content for the LLM summarizer without requiring page-specific code.
 */
export class ScreenPerceiver {
	private static LOADER_SELECTORS = [
		"[class*='animate-spin']",
		"[class*='loader']",
		"[class*='skeleton']",
		"[role='status']",
		"[aria-busy='true']",
		".gif-loader",
		"svg.animate-spin",
	];

	/**
	 * Waits for active loading spinners to disappear and DOM mutations to stabilize.
	 * @param timeoutMs Max time to wait for data (default 7500ms)
	 */
	public static async waitForSettlement(timeoutMs = 7500): Promise<boolean> {
		const startTime = Date.now();

		// 1. Wait brief period (250ms) for newly initiated loaders to mount
		await new Promise((r) => setTimeout(r, 250));

		return new Promise((resolve) => {
			let mutationTimer: ReturnType<typeof setTimeout> | null = null;
			let observer: MutationObserver | null = null;

			const checkLoadersDone = () => {
				const hasActiveLoaders = ScreenPerceiver.LOADER_SELECTORS.some(
					(selector) => {
						const els = document.querySelectorAll(selector);
						return Array.from(els).some((el) => {
							const rect = (
								el as HTMLElement
							).getBoundingClientRect();
							// True if element is visible and displayed
							return rect.width > 0 && rect.height > 0;
						});
					},
				);

				return !hasActiveLoaders;
			};

			const cleanup = (result: boolean) => {
				if (mutationTimer) clearTimeout(mutationTimer);
				if (observer) observer.disconnect();
				resolve(result);
			};

			// Timeout watchdog
			const timeoutTimer = setTimeout(() => {
				cleanup(true);
			}, timeoutMs);

			// Settle watchdog: triggers when DOM has had no mutations for 600ms AND no loaders
			const onPotentialSettle = () => {
				if (mutationTimer) clearTimeout(mutationTimer);

				if (checkLoadersDone()) {
					mutationTimer = setTimeout(() => {
						clearTimeout(timeoutTimer);
						cleanup(true);
					}, 600);
				}
			};

			observer = new MutationObserver(() => {
				// If elapsed time exceeded, resolve
				if (Date.now() - startTime > timeoutMs) {
					clearTimeout(timeoutTimer);
					cleanup(true);
					return;
				}
				onPotentialSettle();
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
				characterData: true,
			});

			// Initial check
			onPotentialSettle();
		});
	}

	/**
	 * Extracts clean semantic text from the primary content area.
	 * Strips navigational headers, footer clutter, SVGs, and hidden elements.
	 */
	public static extractSemanticText(): string {
		// Prefer main or active cards
		const mainEl =
			document.querySelector("main") ||
			document.querySelector("[role='main']") ||
			document.body;

		if (!mainEl) return "";

		// Clone element to sanitize without affecting DOM
		const clone = mainEl.cloneNode(true) as HTMLElement;

		// Remove unwanted non-semantic elements
		const unwantedSelectors = [
			"header",
			"nav",
			"footer",
			"svg",
			"script",
			"style",
			"button",
			"[aria-hidden='true']",
			".voice-orb",
			"[class*='voice-']",
			".fixed",
		];

		unwantedSelectors.forEach((sel) => {
			clone.querySelectorAll(sel).forEach((el) => el.remove());
		});

		// Extract text content and normalize whitespace
		const rawText = clone.innerText || clone.textContent || "";
		const cleanText = rawText
			.replace(/\s+/g, " ")
			.replace(/(\n\s*){2,}/g, "\n")
			.trim();

		// Keep token footprint lightweight (max 1500 chars)
		return cleanText.length > 1500
			? cleanText.substring(0, 1500) + "..."
			: cleanText;
	}
}
