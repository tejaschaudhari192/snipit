import { memo, useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface HtmlDisplayProps {
	content: string;
}

export const HtmlDisplay = memo(({ content }: HtmlDisplayProps) => {
	const debouncedContent = useDebounce(content, 300);
	const [iframeSrcData, setIframeSrcData] = useState("");

	useEffect(() => {
		// Basic HTML template if content is just a snippet
		let html = debouncedContent;
		if (!html.toLowerCase().includes("<html")) {
			html = `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<style>
						body { 
							font-family: system-ui, -apple-system, sans-serif; 
							padding: 16px;
							margin: 0;
							color: inherit;
							background: transparent;
						}
						/* Optional: Provide a nice default styling mimicking the editor area */
					</style>
				</head>
				<body>
					${html}
				</body>
				</html>
			`;
		}
		setIframeSrcData(html);
	}, [debouncedContent]);

	return (
		<div className="w-full h-full relative p-2 md:p-4 bg-background">
			<iframe
				className="w-full h-full border-0 bg-white dark:bg-zinc-100 rounded-xl shadow-inner md:rounded-2xl overflow-auto"
				sandbox="allow-scripts allow-modals allow-popups"
				title="HTML Preview"
				srcDoc={iframeSrcData}
			/>
		</div>
	);
});
