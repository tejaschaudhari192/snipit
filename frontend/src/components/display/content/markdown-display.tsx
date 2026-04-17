/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useDebounce } from "@/hooks/use-debounce";
import { useMemo, memo } from "react";

interface MarkdownDisplayProps {
	content: string;
	fontSize: number;
	contentRef: (node: HTMLElement | null) => void;
}

export const MarkdownDisplay = memo(
	({ content, fontSize, contentRef }: MarkdownDisplayProps) => {
		const debouncedContent = useDebounce(content, 300);

		const components: Components = useMemo(
			() => ({
				h1: ({ node, ...props }) => (
					<h1
						className="text-[1.5em] font-black mb-3 pb-1 border-b border-border/50"
						{...props}
					/>
				),
				h2: ({ node, ...props }) => (
					<h2
						className="text-[1.25em] font-bold mb-2 pb-0.5 border-b border-border/30"
						{...props}
					/>
				),
				h3: ({ node, ...props }) => (
					<h3 className="text-[1.1em] font-bold mb-2" {...props} />
				),
				ul: ({ node, ...props }) => (
					<ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
				),
				ol: ({ node, ...props }) => (
					<ol
						className="list-decimal pl-5 mb-3 space-y-1"
						{...props}
					/>
				),
				blockquote: ({ node, ...props }) => (
					<blockquote
						className="border-l-4 border-primary/50 bg-primary/5 px-4 py-1.5 my-3 italic rounded-lg"
						{...props}
					/>
				),
				a: ({ node, ...props }) => (
					<a
						className="text-primary hover:underline font-medium transition-all"
						target="_blank"
						rel="noopener noreferrer"
						{...props}
					/>
				),
				code: ({ node, className, children, ...props }) => {
					const match = /language-(\w+)/.exec(className || "");
					return !match ? (
						<code
							className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-[0.85em] border border-border/50"
							{...props}
						>
							{children}
						</code>
					) : (
						<code
							className="block bg-muted/50 p-3 rounded-xl font-mono text-[0.85em] border border-border/50 overflow-x-auto my-3"
							{...props}
						>
							{children}
						</code>
					);
				},
				p: ({ node, ...props }) => (
					<p className="mb-2 leading-relaxed" {...props} />
				),
			}),
			[],
		);

		const remarkPlugins = useMemo(() => [remarkGfm, remarkMath], []);
		const rehypePlugins = useMemo(() => [rehypeKatex], []);

		return (
			<div
				ref={contentRef}
				className="prose prose-sm md:prose-base max-w-none dark:prose-invert break-words p-3 md:p-10 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-500 md:max-w-7xl w-full mx-auto"
				style={{ fontSize: `${fontSize}px` }}
			>
				<ReactMarkdown
					remarkPlugins={remarkPlugins}
					rehypePlugins={rehypePlugins}
					components={components}
				>
					{debouncedContent}
				</ReactMarkdown>
			</div>
		);
	},
);
