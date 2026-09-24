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
	 * Checks active snippet context, editor models, and DOM content.
	 */
	public static extractSemanticText(): string {
		const parts: string[] = [];

		if (typeof window !== "undefined" && typeof document !== "undefined") {
			// 1. Page Title
			if (document.title) {
				parts.push(`Page Title: ${document.title}`);
			}

			// 2. Active Snippet Context (registered by Display page)
			const activePaste = (
				window as unknown as {
					__SNIPIT_ACTIVE_PASTE?: {
						id?: string;
						title?: string;
						language?: string;
						contentType?: string;
						content?: string;
					};
				}
			).__SNIPIT_ACTIVE_PASTE;

			if (activePaste) {
				const pasteLines = [
					`Current Opened Paste ID: ${activePaste.id || "unknown"}`,
					`Title: ${activePaste.title || "Untitled"}`,
					`Format / Type: ${activePaste.contentType || "code"}`,
					`Language: ${activePaste.language || "text"}`,
				];
				if (activePaste.content) {
					const truncated =
						activePaste.content.length > 2000
							? activePaste.content.substring(0, 2000) +
								"\n...[truncated]"
							: activePaste.content;
					pasteLines.push(`Snippet Content:\n${truncated}`);
				}
				parts.push(pasteLines.join("\n"));
			} else {
				// 3. Monaco Editor Fallback (if mounted on page without registered paste)
				const win = window as unknown as {
					monaco?: {
						editor?: {
							getModels?: () => Array<{
								getValue?: () => string;
								getModeId?: () => string;
							}>;
						};
					};
				};
				const models = win.monaco?.editor?.getModels?.();
				if (models && models.length > 0 && models[0].getValue) {
					const val = models[0].getValue();
					if (val && val.trim().length > 0) {
						const truncated =
							val.length > 1500
								? val.substring(0, 1500) + "\n...[truncated]"
								: val;
						parts.push(
							`Editor Code (${models[0].getModeId?.() || "code"}):\n${truncated}`,
						);
					}
				}
			}
		}

		// 4. Primary DOM Content Area
		const mainEl =
			document.querySelector("main") ||
			document.querySelector("[role='main']") ||
			document.body;

		if (mainEl) {
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

			if (cleanText) {
				const truncatedDom =
					cleanText.length > 1200
						? cleanText.substring(0, 1200) + "..."
						: cleanText;
				parts.push(`Screen Text:\n${truncatedDom}`);
			}
		}

		return parts.join("\n\n").trim();
	}
}
