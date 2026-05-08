import { useState, useEffect } from "react";
import { useMarkdownLayout } from "@/hooks/use-markdown-layout";

interface UseEditorLayoutProps {
	isFullscreen: boolean;
	setIsFullscreen: (val: boolean | ((p: boolean) => boolean)) => void;
	containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useEditorLayout = ({
	isFullscreen,
	setIsFullscreen,
	containerRef,
}: UseEditorLayoutProps) => {
	const [isWindowFullscreen, setIsWindowFullscreen] = useState(false);
	const [mdLayoutMode, setMdLayoutMode] = useMarkdownLayout();

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsWindowFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () =>
			document.removeEventListener(
				"fullscreenchange",
				handleFullscreenChange,
			);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (isWindowFullscreen) {
					document
						.exitFullscreen()
						.catch((err) => console.error(err));
				} else if (isFullscreen) {
					setIsFullscreen(false);
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isFullscreen, isWindowFullscreen, setIsFullscreen]);

	const toggleFullscreen = () => {
		setIsFullscreen((prev) => !prev);
	};

	const toggleWindowFullscreen = () => {
		if (!document.fullscreenElement) {
			containerRef.current?.requestFullscreen().catch((err) => {
				console.error("Error attempting to enable fullscreen:", err);
			});
		} else {
			document.exitFullscreen().catch((err) => console.error(err));
		}
	};

	return {
		isWindowFullscreen,
		mdLayoutMode,
		setMdLayoutMode,
		toggleFullscreen,
		toggleWindowFullscreen,
	};
};
