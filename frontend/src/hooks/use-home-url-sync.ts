import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { CONFIG } from "@/configurations";
import type { ContentMode } from "@/types";

interface UseHomeUrlSyncProps {
	contentType: ContentMode;
	isFullscreen: boolean;
	onContentTypeChange: (mode: ContentMode) => void;
	setIsFullscreen: (v: boolean) => void;
}

export const useHomeUrlSync = ({
	contentType,
	isFullscreen,
	onContentTypeChange,
	setIsFullscreen,
}: UseHomeUrlSyncProps) => {
	const location = useLocation();
	const onContentTypeChangeRef = useRef(onContentTypeChange);

	useEffect(() => {
		onContentTypeChangeRef.current = onContentTypeChange;
	}, [onContentTypeChange]);

	// Initial sync from URL
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const tab = params.get("tab");
		const fs = params.get("fullscreen");

		if (tab && ["text", "code", "draw", "link", "file"].includes(tab)) {
			onContentTypeChangeRef.current(tab as ContentMode);
		}

		if (fs === "true") {
			setIsFullscreen(true);
		}
	}, [location.search, setIsFullscreen]);

	// Push state changes to URL
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		let changed = false;

		if (contentType !== params.get("tab")) {
			if (contentType === CONFIG.defaults.contentMode) {
				params.delete("tab");
			} else {
				params.set("tab", contentType);
			}
			changed = true;
		}

		if (isFullscreen.toString() !== (params.get("fullscreen") || "false")) {
			if (isFullscreen) params.set("fullscreen");
			else params.delete("fullscreen");
			changed = true;
		}

		if (changed) {
			const newRelativePathQuery =
				location.pathname +
				(params.toString() ? "?" + params.toString() : "") +
				location.hash;
			window.history.replaceState(null, "", newRelativePathQuery);
		}
	}, [
		contentType,
		isFullscreen,
		location.pathname,
		location.search,
		location.hash,
	]);
};
