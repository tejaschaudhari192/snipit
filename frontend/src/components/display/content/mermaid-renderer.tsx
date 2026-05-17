import { useEffect, useState, useCallback } from "react";
import mermaid, { type MermaidConfig } from "mermaid";
import { useTheme } from "next-themes";
import { Loader2, AlertCircle } from "lucide-react";

interface MermaidRendererProps {
	content: string;
}

export const MermaidRenderer = ({ content }: MermaidRendererProps) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const theme = isDark ? "dark" : "light";
	const [svg, setSvg] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const getMermaidConfig = useCallback(
		(): MermaidConfig => ({
			startOnLoad: false,
			theme: isDark ? "dark" : "default",
			securityLevel: "loose",
			fontFamily: "Inter, sans-serif",
		}),
		[isDark],
	);

	useEffect(() => {
		mermaid.initialize(getMermaidConfig());
	}, [theme, getMermaidConfig]);

	useEffect(() => {
		const renderDiagram = async () => {
			if (!content.trim()) return;

			setIsLoading(true);
			setError(null);

			try {
				mermaid.initialize(getMermaidConfig());
				const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
				const { svg } = await mermaid.render(id, content);
				setSvg(svg);
			} catch (err) {
				console.error("Mermaid render error:", err);
				setError("Failed to render diagram.");
			} finally {
				setIsLoading(false);
			}
		};

		renderDiagram();
	}, [content, theme, getMermaidConfig]);

	if (error) {
		return (
			<div className="p-4 bg-rose-500/10 text-rose-500 rounded-md flex items-center gap-2 text-sm my-4">
				<AlertCircle className="w-4 h-4" />
				<span>{error}</span>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex justify-center p-8">
				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="mermaid-content w-full flex justify-center my-6 overflow-x-auto">
			<div
				dangerouslySetInnerHTML={{ __html: svg }}
				className="w-full flex justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-none"
			/>
		</div>
	);
};
