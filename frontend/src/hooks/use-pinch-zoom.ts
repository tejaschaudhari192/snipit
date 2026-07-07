import { localStore } from "@/utils/storage";
import { useRef, useState, useEffect, useCallback } from "react";
import { CONFIG } from "@/configurations";

export function usePinchZoom(initialFontSize = CONFIG.defaults.fontSize) {
	const [fontSize, setFontSizeState] = useState(() => {
		if (typeof window !== "undefined") {
			const saved = localStore.getItem(CONFIG.storageKeys.fontSize);
			const parsed = saved ? parseInt(saved, 10) : initialFontSize;
			return isNaN(parsed) ? initialFontSize : parsed;
		}
		return initialFontSize;
	});

	const setFontSize = useCallback(
		(value: number | ((prev: number) => number)) => {
			setFontSizeState((prev) => {
				const newValue =
					typeof value === "function" ? value(prev) : value;
				const validValue = Math.min(
					Math.max(newValue, CONFIG.defaults.minFontSize),
					CONFIG.defaults.maxFontSize,
				);
				localStore.setItem(
					CONFIG.storageKeys.fontSize,
					validValue.toString(),
				);
				return validValue;
			});
		},
		[],
	);

	const [element, setElement] = useState<HTMLElement | null>(null);
	const initialDistance = useRef<number | null>(null);
	const initialFontSizeRef = useRef(fontSize);
	const fontSizeRef = useRef(fontSize);

	useEffect(() => {
		fontSizeRef.current = fontSize;
	}, [fontSize]);

	// Sync with other tabs
	useEffect(() => {
		const handleStorage = (e: StorageEvent) => {
			if (e.key === CONFIG.storageKeys.fontSize && e.newValue) {
				const newSize = parseInt(e.newValue, 10);
				if (!isNaN(newSize)) {
					setFontSizeState(newSize);
				}
			}
		};
		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, []);

	useEffect(() => {
		if (!element) return;

		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length === 2) {
				e.preventDefault();
				const touch1 = e.touches[0];
				const touch2 = e.touches[1];
				initialDistance.current = Math.hypot(
					touch1.clientX - touch2.clientX,
					touch1.clientY - touch2.clientY,
				);
				initialFontSizeRef.current = fontSizeRef.current;
			}
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (e.touches.length === 2 && initialDistance.current !== null) {
				e.preventDefault();
				const touch1 = e.touches[0];
				const touch2 = e.touches[1];
				const currentDistance = Math.hypot(
					touch1.clientX - touch2.clientX,
					touch1.clientY - touch2.clientY,
				);

				const ratio = currentDistance / initialDistance.current;
				const newFontSize = Math.min(
					Math.max(Math.round(initialFontSizeRef.current * ratio), 8),
					48,
				);

				setFontSize(newFontSize);
			}
		};

		const handleTouchEnd = () => {
			initialDistance.current = null;
		};

		const handleWheel = (e: WheelEvent) => {
			if (e.ctrlKey) {
				e.preventDefault();
				e.stopPropagation();
				const delta = e.deltaY > 0 ? -1 : 1;
				setFontSize((prev) => prev + delta);
			}
		};

		element.addEventListener("touchstart", handleTouchStart, {
			passive: false,
		});
		element.addEventListener("touchmove", handleTouchMove, {
			passive: false,
		});
		element.addEventListener("touchend", handleTouchEnd);
		// Use capture to intercept events before monaco editor
		element.addEventListener("wheel", handleWheel, {
			passive: false,
			capture: true,
		});

		return () => {
			element.removeEventListener("touchstart", handleTouchStart);
			element.removeEventListener("touchmove", handleTouchMove);
			element.removeEventListener("touchend", handleTouchEnd);
			element.removeEventListener("wheel", handleWheel, {
				capture: true,
			});
		};
	}, [element, setFontSize]);

	return { fontSize, ref: setElement, setFontSize };
}
