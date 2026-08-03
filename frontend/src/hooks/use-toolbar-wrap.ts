import { useState, useRef, useLayoutEffect } from "react";

export function useToolbarWrap(deps: React.DependencyList) {
	const [needsSecondRow, setNeedsSecondRow] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const leftRef = useRef<HTMLDivElement>(null);
	const rightRef = useRef<HTMLDivElement>(null);
	const middleRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const checkOverflow = () => {
			if (
				!containerRef.current ||
				!leftRef.current ||
				!rightRef.current ||
				!middleRef.current
			)
				return;

			const containerWidth = containerRef.current.clientWidth;
			const leftWidth = leftRef.current.clientWidth;
			const rightWidth = rightRef.current.clientWidth;

			// Calculate the TRUE width of the contextual children
			let trueMiddleWidth = 0;
			const childrenElements = Array.from(middleRef.current.children);
			for (let i = 0; i < childrenElements.length; i++) {
				trueMiddleWidth += (childrenElements[i] as HTMLElement)
					.offsetWidth;
				// Add 8px gap for each item after the first
				if (i > 0) trueMiddleWidth += 8;
			}

			// 32px for safe margins/padding around the sections
			const totalRequired = leftWidth + rightWidth + trueMiddleWidth + 32;

			if (totalRequired > containerWidth) {
				setNeedsSecondRow(true);
			} else {
				setNeedsSecondRow(false);
			}
		};

		checkOverflow();
		const ro = new ResizeObserver(checkOverflow);
		if (containerRef.current) ro.observe(containerRef.current);
		if (middleRef.current) ro.observe(middleRef.current);

		return () => ro.disconnect();
	}, deps);

	return {
		needsSecondRow,
		containerRef,
		leftRef,
		rightRef,
		middleRef,
	};
}
