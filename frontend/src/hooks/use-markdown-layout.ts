import { localStore } from "@/utils/storage";
import { useState, useEffect } from "react";
import { CONFIG } from "@/configurations";
import type { MarkdownLayoutMode } from "@/types";

export const useMarkdownLayout = () => {
	const [mode, setMode] = useState<MarkdownLayoutMode>(() => {
		if (typeof window !== "undefined") {
			const saved = localStore.getItem(
				CONFIG.storageKeys.markdownLayoutMode,
			);
			if (
				saved === "split" ||
				saved === "editor" ||
				saved === "preview"
			) {
				return saved;
			}
		}
		return "split";
	});

	useEffect(() => {
		localStore.setItem(CONFIG.storageKeys.markdownLayoutMode, mode);
	}, [mode]);

	return [mode, setMode] as const;
};
