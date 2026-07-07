import { localStore } from "@/utils/storage";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/utils";
import { GripHorizontal, GripVertical } from "lucide-react";

/** Direction of the split: "vertical" = top+bottom, "horizontal" = left+right */
type SplitDirection = "vertical" | "horizontal";

interface ResizablePanelsProps {
	/** First panel content */
	first: React.ReactNode;
	/** Second panel content */
	second: React.ReactNode;
	/** Which axis the divider is dragged along */
	direction?: SplitDirection;
	/**
	 * Initial size of the FIRST panel as a percentage of the container.
	 * Defaults to 60.
	 */
	initialSize?: number;
	/** Minimum first-panel size in percent. Defaults to 20. */
	minSize?: number;
	/** Maximum first-panel size in percent. Defaults to 85. */
	maxSize?: number;
	className?: string;
	/** Optional key to persist size in localStore */
	storageKey?: string;
}

/**
 * A two-panel container where the panels are separated by a draggable divider.
 * Works in both "vertical" (top / bottom) and "horizontal" (left / right) modes.
 */
export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
	first,
	second,
	direction = "vertical",
	initialSize = 60,
	minSize = 15,
	maxSize = 85,
	className,
	storageKey,
}) => {
	const [firstSize, setFirstSize] = useState(() => {
		if (storageKey) {
			const saved = localStore.getItem(storageKey);
			if (saved) return parseFloat(saved);
		}
		return initialSize;
	});
	const [isResizing, setIsResizing] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const isVertical = direction === "vertical";

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			setIsResizing(true);
			document.body.style.cursor = isVertical
				? "row-resize"
				: "col-resize";
			document.body.style.userSelect = "none";
		},
		[isVertical],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing || !containerRef.current) return;
			const rect = containerRef.current.getBoundingClientRect();

			const newSize = isVertical
				? ((e.clientY - rect.top) / rect.height) * 100
				: ((e.clientX - rect.left) / rect.width) * 100;

			if (newSize >= minSize && newSize <= maxSize) {
				setFirstSize(newSize);
			}
		},
		[isResizing, isVertical, minSize, maxSize],
	);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
		if (storageKey) {
			localStore.setItem(storageKey, firstSize.toString());
		}
	}, [storageKey, firstSize]);

	useEffect(() => {
		if (isResizing) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		} else {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing, handleMouseMove, handleMouseUp]);

	return (
		<div
			ref={containerRef}
			className={cn(
				"flex min-h-0 min-w-0 h-full w-full overflow-hidden",
				isVertical ? "flex-col" : "flex-row",
				className,
			)}
		>
			{/* First Panel */}
			<div
				className="min-h-0 min-w-0 overflow-hidden"
				style={
					isVertical
						? { height: `${firstSize}%` }
						: { width: `${firstSize}%` }
				}
			>
				{first}
			</div>

			{/* Divider */}
			<div
				onMouseDown={handleMouseDown}
				className={cn(
					"group relative shrink-0 flex items-center justify-center transition-colors z-30",
					isVertical
						? "h-1.5 w-full cursor-row-resize hover:bg-primary/40"
						: "w-1.5 h-full cursor-col-resize hover:bg-primary/40",
					isResizing ? "bg-primary/60" : "bg-border/30",
				)}
			>
				<div
					className={cn(
						"flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300",
						"p-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/20",
					)}
				>
					{isVertical ? (
						<GripHorizontal className="h-3.5 w-3.5 text-primary" />
					) : (
						<GripVertical className="h-3.5 w-3.5 text-primary" />
					)}
				</div>
			</div>

			{/* Second Panel */}
			<div className="flex-1 min-h-0 min-w-0 overflow-hidden">
				{second}
			</div>
		</div>
	);
};
