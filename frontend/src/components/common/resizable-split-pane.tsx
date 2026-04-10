import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
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
}) => {
	const { t } = useTranslation();
	const [leftWidth, setLeftWidth] = useState(initialWidth);
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
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}, []);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing || !containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			const newLeftWidth =
				((e.clientX - containerRect.left) / containerRect.width) * 100;

			if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
				setLeftWidth(newLeftWidth);
			}
		},
		[isResizing, minWidth, maxWidth],
	);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	}, []);

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
			className={cn("flex h-full w-full overflow-hidden", className)}
		>
			{/* Left Pane (Editor) */}
			{mode !== "preview" && (
				<div
					className="h-full overflow-hidden relative"
					style={{
						width:
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
						"w-1 h-full cursor-col-resize hover:bg-primary/40 transition-colors relative group z-30 hidden md:block",
						isResizing ? "bg-primary/60" : "bg-border/30",
					)}
				>
					{/* Sticky Container for Handle UI */}
					<div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pointer-events-none">
						{/* The Hint Overlay */}
						{hintVisible && (
							<div className="absolute -translate-y-16 group-z-50">
								<div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-full shadow-2xl animate-bounce whitespace-nowrap tracking-tighter flex items-center gap-2 border border-white/20">
									<GripVertical className="h-3 w-3" />
									{mode === "split"
										? t(
												"common.drag_to_resize",
												"Drag to resize",
											)
										: ""}
								</div>
								<div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45 -mt-1 shadow-sm" />
							</div>
						)}

						{/* Visual handle indicator */}
						<div className="w-4 h-12 flex flex-col items-center justify-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
							<div className="p-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/20 scale-125">
								<GripVertical className="h-4 w-4 text-primary" />
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Right Pane (Preview) */}
			{mode !== "editor" && (
				<div
					className={cn(
						"h-full overflow-hidden",
						mode === "split" ? "hidden md:block" : "block",
					)}
					style={{
						width:
							mode === "preview" ? "100%" : `${100 - leftWidth}%`,
					}}
				>
					{right}
				</div>
			)}
		</div>
	);
};
