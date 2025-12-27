import { useRef, useState, useEffect } from "react";

export function usePinchZoom(initialFontSize = 14) {
  const [fontSize, setFontSize] = useState(initialFontSize);
  const ref = useRef<HTMLDivElement>(null);
  const initialDistance = useRef<number | null>(null);
  const initialFontSizeRef = useRef(initialFontSize);

  useEffect(() => {
    const element = ref.current;
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
        initialFontSizeRef.current = fontSize;
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

    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [fontSize]);

  return { fontSize, ref, setFontSize };
}
