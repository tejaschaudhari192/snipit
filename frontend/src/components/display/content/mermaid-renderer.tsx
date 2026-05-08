import { useEffect, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { Loader2, AlertCircle } from "lucide-react";

interface MermaidRendererProps {
	content: string;
}

export const MermaidRenderer = ({ content }: MermaidRendererProps) => {
	const { theme } = useTheme();
	// const containerRef = useRef<HTMLDivElement>(null);
	const [svg, setSvg] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		mermaid.initialize({
			startOnLoad: false,
			theme: theme === "dark" ? "dark" : "base",
			themeVariables: {
				fontFamily: "Inter, sans-serif",
				primaryColor: theme === "dark" ? "#3b82f6" : "#2563eb",
				primaryTextColor: theme === "dark" ? "#f8fafc" : "#1e293b",
				primaryBorderColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
				lineColor: theme === "dark" ? "#475569" : "#94a3b8",
				secondaryColor: theme === "dark" ? "#1e293b" : "#f1f5f9",
				tertiaryColor: theme === "dark" ? "#0f172a" : "#ffffff",
			},
			securityLevel: "loose",
		});
	}, [theme]);

	useEffect(() => {
		const renderDiagram = async () => {
			if (!content.trim()) return;

			setIsLoading(true);
			setError(null);

			try {
				// Re-initialize before render to ensure theme is applied
				mermaid.initialize({
					startOnLoad: false,
					theme: theme === "dark" ? "dark" : "base",
					themeVariables: {
						fontFamily: "Inter, sans-serif",
						primaryColor: theme === "dark" ? "#3b82f6" : "#2563eb",
						primaryTextColor:
							theme === "dark" ? "#f8fafc" : "#1e293b",
					},
				});

				const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
				const { svg } = await mermaid.render(id, content);
				setSvg(svg);
			} catch (err) {
				console.error("Mermaid render error:", err);
				setError(
					"Failed to render diagram. Please check your Mermaid syntax.",
				);
			} finally {
				setIsLoading(false);
			}
		};

		renderDiagram();
	}, [content, theme]);

	if (error) {
		return (
			<div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm my-4">
				<AlertCircle className="w-5 h-5 shrink-0" />
				<span className="font-medium">{error}</span>
			</div>
		);
	}

	return (
		<div className="mermaid-wrapper my-6 p-6 bg-muted/5 dark:bg-white/5 rounded-2xl border border-border/40 flex justify-center overflow-x-auto min-h-[120px] items-center relative group">
			<style
				dangerouslySetInnerHTML={{
					__html: `
				.mermaid-content svg {
					max-width: 100%;
					height: auto;
				}
				.mermaid-content .node rect,
				.mermaid-content .node circle,
				.mermaid-content .node polygon,
				.mermaid-content .node path {
					stroke-width: 1.5px !important;
				}
				.mermaid-content .edgePath .path {
					stroke-width: 1.5px !important;
				}
				.mermaid-content .label {
					color: var(--foreground) !important;
					font-weight: 500 !important;
				}
				.dark .mermaid-content .label {
					color: #f8fafc !important;
				}
			`,
				}}
			/>
			{isLoading ? (
				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
			) : (
				<div
					className="mermaid-content w-full flex justify-center transition-opacity duration-300"
					dangerouslySetInnerHTML={{ __html: svg }}
				/>
			)}
		</div>
	);
};
