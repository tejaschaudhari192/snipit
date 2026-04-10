import { useState, useEffect } from "react";
import type { MarkdownLayoutMode } from "@/components/common/markdown-layout-toggles";

export const useMarkdownLayout = () => {
	const [mode, setMode] = useState<MarkdownLayoutMode>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("markdown-layout-mode");
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
		localStorage.setItem("markdown-layout-mode", mode);
	}, [mode]);

	return [mode, setMode] as const;
};
