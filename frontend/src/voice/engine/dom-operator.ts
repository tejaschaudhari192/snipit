export class DOMOperator {
	/**
	 * Waits for an element to appear in DOM via MutationObserver.
	 */
	public static waitForElement<T extends HTMLElement>(
		selector: string,
		timeoutMs = 4000,
	): Promise<T | null> {
		const existing = document.querySelector<T>(selector);
		if (existing) return Promise.resolve(existing);

		return new Promise((resolve) => {
			let observer: MutationObserver | null = null;
			const timer = setTimeout(() => {
				if (observer) observer.disconnect();
				resolve(null);
			}, timeoutMs);

			observer = new MutationObserver(() => {
				const el = document.querySelector<T>(selector);
				if (el) {
					clearTimeout(timer);
					observer?.disconnect();
					resolve(el);
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		});
	}

	/**
	 * Sets the value of an input or textarea in a React-safe manner,
	 * bypassing React 16+ synthetic event overrides.
	 */
	public static safeSetInputValue(
		el: HTMLInputElement | HTMLTextAreaElement,
		value: string,
	): void {
		const prototype = Object.getPrototypeOf(el);
		const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

		if (descriptor && descriptor.set) {
			descriptor.set.call(el, value);
		} else {
			el.value = value;
		}

		el.dispatchEvent(new Event("input", { bubbles: true }));
		el.dispatchEvent(new Event("change", { bubbles: true }));
	}

	/**
	 * Smoothly scrolls element into view, flashes an interaction highlight, and clicks.
	 */
	public static safeClick(el: HTMLElement): void {
		el.scrollIntoView({ behavior: "smooth", block: "center" });

		const originalRing = el.className;
		el.classList.add(
			"ring-4",
			"ring-primary",
			"transition-all",
			"duration-300",
		);

		setTimeout(() => {
			el.className = originalRing;
			el.click();
		}, 250);
	}
}
