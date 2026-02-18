/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownDisplayProps {
	content: string;
	fontSize: number;
	contentRef: (node: HTMLElement | null) => void;
}

export const MarkdownDisplay = ({
	content,
	fontSize,
	contentRef,
}: MarkdownDisplayProps) => {
	const components: Components = {
		h1: ({ node, ...props }) => (
			<h1
				className="text-3xl font-black mb-6 pb-2 border-b border-border/50"
				{...props}
			/>
		),
		h2: ({ node, ...props }) => (
			<h2
				className="text-2xl font-bold mb-4 pb-1 border-b border-border/30"
				{...props}
			/>
		),
		h3: ({ node, ...props }) => (
			<h3 className="text-xl font-bold mb-3" {...props} />
		),
		ul: ({ node, ...props }) => (
			<ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
		),
		ol: ({ node, ...props }) => (
			<ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
		),
		blockquote: ({ node, ...props }) => (
			<blockquote
				className="border-l-4 border-primary/50 bg-primary/5 px-4 py-2 my-4 italic rounded-r-lg"
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
					className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm border border-border/50"
					{...props}
				>
					{children}
				</code>
			) : (
				<code
					className="block bg-muted/50 p-4 rounded-xl font-mono text-sm border border-border/50 overflow-x-auto my-4"
					{...props}
				>
					{children}
				</code>
			);
		},
		p: ({ node, ...props }) => (
			<p className="mb-4 leading-relaxed" {...props} />
		),
	};

	return (
		<div
			ref={contentRef}
			className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words"
			style={{ fontSize: `${fontSize}px` }}
		>
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
				{content}
			</ReactMarkdown>
		</div>
	);
};
