import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/utils";
import { GripHorizontal, GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ResizableSplitPaneProps {
	left: React.ReactNode;
	right: React.ReactNode;
	initialWidth?: number; // percentage
	minWidth?: number; // percentage
	maxWidth?: number; // percentage
	className?: string;
	showHint?: boolean;
	mode?: "split" | "editor" | "preview";
	direction?: "horizontal" | "vertical";
	storageKey?: string;
}

export const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
	left,
	right,
	initialWidth = 50,
	minWidth = 20,
	maxWidth = 80,
	className,
	showHint = false,
	mode = "split",
	direction = "horizontal",
	storageKey,
}) => {
	const { t } = useTranslation();
	const [leftWidth, setLeftWidth] = useState(() => {
		if (storageKey) {
			const saved = localStorage.getItem(storageKey);
			if (saved) return parseFloat(saved);
		}
		return initialWidth;
	});
	const [isResizing, setIsResizing] = useState(false);
	const [hintVisible, setHintVisible] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Reset width when changing mode
	useEffect(() => {
		if (mode === "editor") setLeftWidth(100);
		else if (mode === "preview") setLeftWidth(0);
		else if (mode === "split") setLeftWidth(initialWidth);
	}, [mode, initialWidth]);

	useEffect(() => {
		if (showHint) {
			setHintVisible(true);
			const timer = setTimeout(() => setHintVisible(false), 3000);
			return () => clearTimeout(timer);
		}
	}, [showHint]);

	const handleMouseDown = useCallback(() => {
		setIsResizing(true);
		document.body.style.cursor =
			direction === "horizontal" ? "col-resize" : "row-resize";
		document.body.style.userSelect = "none";
	}, [direction]);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing || !containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			const newLeftWidth =
				direction === "horizontal"
					? ((e.clientX - containerRect.left) / containerRect.width) *
						100
					: ((e.clientY - containerRect.top) / containerRect.height) *
						100;

			if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
				setLeftWidth(newLeftWidth);
			}
		},
		[isResizing, minWidth, maxWidth, direction],
	);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
		if (storageKey) {
			localStorage.setItem(storageKey, leftWidth.toString());
		}
	}, [storageKey, leftWidth]);

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
				direction === "vertical" ? "flex-col" : "flex-row",
				className,
			)}
		>
			{/* Left Pane (Editor) */}
			{mode !== "preview" && (
				<div
					className={cn(
						"overflow-hidden relative min-h-0 min-w-0",
						direction === "horizontal" ? "h-full" : "w-full",
					)}
					style={{
						[direction === "horizontal" ? "width" : "height"]:
							mode === "editor"
								? "100%"
								: mode === "split"
									? "var(--left-width, 50%)"
									: "0%",
					}}
				>
					{/* Custom CSS variable for dynamic width to handle mobile hidden preview */}
					<style
						dangerouslySetInnerHTML={{
							__html: `
						:root { --left-width: ${leftWidth}%; }
						@media (max-width: 768px) {
							:root { --left-width: ${mode === "split" ? "100%" : leftWidth + "%"}; }
						}
					`,
						}}
					/>
					{left}
				</div>
			)}

			{/* Divider (Desktop Only) */}
			{mode === "split" && (
				<div
					onMouseDown={handleMouseDown}
					className={cn(
						"hover:bg-primary/40 transition-colors relative group z-30 hidden md:block",
						direction === "horizontal"
							? "w-1 h-full cursor-col-resize"
							: "h-1 w-full cursor-row-resize",
						isResizing ? "bg-primary/60" : "bg-border/30",
					)}
				>
					{/* Sticky Container for Handle UI */}
					<div
						className={cn(
							"pointer-events-none flex items-center justify-center",
							direction === "horizontal"
								? "sticky top-0 h-screen w-full flex-col"
								: "absolute left-0 w-full h-full flex-row",
						)}
					>
						{/* The Hint Overlay */}
						{hintVisible && (
							<div className="absolute -translate-y-16 group-z-50">
								<div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-full shadow-2xl animate-bounce whitespace-nowrap tracking-tighter flex items-center gap-2 border border-white/20">
									<GripVertical className="h-3 w-3" />
									{mode === "split"
										? t("common.drag_to_resize")
										: ""}
								</div>
								<div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45 -mt-1 shadow-sm" />
							</div>
						)}

						{/* Visual handle indicator */}
						<div
							className={cn(
								"flex items-center justify-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300",
								direction === "horizontal"
									? "flex-col w-4 h-12"
									: "flex-row h-4 w-12",
							)}
						>
							<div className="p-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/20 scale-125">
								{direction === "horizontal" ? (
									<GripVertical className="h-4 w-4 text-primary" />
								) : (
									<GripHorizontal className="h-4 w-4 text-primary" />
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Right Pane (Preview) */}
			{mode !== "editor" && (
				<div
					className={cn(
						"overflow-auto flex-1 min-h-0 min-w-0",
						direction === "horizontal" ? "h-full" : "w-full",
						mode === "split" ? "hidden md:block" : "block",
					)}
					style={{
						[direction === "horizontal" ? "width" : "height"]:
							mode === "preview" ? "100%" : `${100 - leftWidth}%`,
					}}
				>
					{right}
				</div>
			)}
		</div>
	);
};
