import { Editor, type BeforeMount } from "@monaco-editor/react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";

import type { PasteData } from "@/types";

interface DisplayContentProps {
	isEdit: boolean;
	contentType: "text" | "code" | "link";
	language: string;
	content: string;
	onContentChange: (val: string) => void;
	theme: string;
	fontSize: number;
	contentRef: (node: HTMLElement | null) => void;
	handleEditorWillMount: BeforeMount;
	paste: PasteData;
}

export const DisplayContent = ({
	isEdit,
	contentType,
	language,
	content,
	onContentChange,
	theme,
	fontSize,
	contentRef,
	handleEditorWillMount,
	paste,
}: DisplayContentProps) => {
	const { t } = useTranslation();

	if (isEdit) {
		return (
			<div
				ref={contentRef}
				className="h-[70vh] border rounded-md overflow-hidden touch-none"
			>
				{contentType === "code" ? (
					<Editor
						height="100%"
						language={language}
						value={content}
						onChange={(value) => onContentChange(value || "")}
						theme={
							theme === "dark" ? "snipit-dark" : "snipit-light"
						}
						beforeMount={handleEditorWillMount}
						options={{
							minimap: { enabled: false },
							fontSize: fontSize,
							padding: { top: 16 },
							mouseWheelZoom: true,
							wordWrap: "on",
						}}
					/>
				) : contentType === "link" ? (
					<div className="h-full w-full bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center rounded-md">
						<div className="w-full max-w-2xl space-y-6 relative z-10 px-4">
							<div className="flex flex-col items-center gap-2 text-center">
								<div className="p-4 rounded-full bg-primary/10 text-primary backdrop-blur-sm border border-primary/20">
									<Link className="h-8 w-8" />
								</div>
							</div>
							<Input
								value={content}
								onChange={(e) =>
									onContentChange(e.target.value)
								}
								placeholder={t("home.link_placeholder")}
								className="h-14 text-lg px-6 rounded-xl border-border/50 focus-visible:ring-primary/30 shadow-lg bg-background/50 backdrop-blur-md"
							/>
						</div>
					</div>
				) : (
					<Textarea
						className="h-full w-full resize-none border-0 focus-visible:ring-0 font-mono"
						value={content}
						onChange={(e) => onContentChange(e.target.value)}
						style={{ fontSize: `${fontSize}px` }}
					/>
				)}
			</div>
		);
	}

	return (
		<div
			ref={contentRef}
			className="h-[70vh] border rounded-md overflow-hidden touch-none"
		>
			{paste.language === "markdown" ? (
				<Card className="h-full overflow-y-auto border-0 rounded-none bg-background">
					<CardContent className="h-fit">
						<div
							className={`prose dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-primary prose-code:text-primary prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border`}
						>
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
									// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
									h1: ({ node: _node, ...props }: any) => (
										<h1
											className="text-3xl font-bold tracking-tight mb-4"
											{...props}
										/>
									),
									// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
									h2: ({ node: _node, ...props }: any) => (
										<h2
											className="text-2xl font-semibold tracking-tight mt-8 mb-4 border-b pb-2"
											{...props}
										/>
									),
									// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
									h3: ({ node: _node, ...props }: any) => (
										<h3
											className="text-xl font-semibold tracking-tight mt-6 mb-3"
											{...props}
										/>
									),
									// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
									ul: ({ node: _node, ...props }: any) => (
										<ul
											className="list-disc pl-6 space-y-2 mb-4"
											{...props}
										/>
									),
									// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
									ol: ({ node: _node, ...props }: any) => (
										<ol
											className="list-decimal pl-6 space-y-2 mb-4"
											{...props}
										/>
									),
									// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
									blockquote: ({
										node: _node,
										...props
									}: any) => (
										<blockquote
											className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground bg-muted/20 p-2 rounded-r"
											{...props}
										/>
									),
									// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
									a: ({ node: _node, ...props }: any) => (
										<a
											className="text-primary hover:underline font-medium break-all"
											target="_blank"
											rel="noopener noreferrer"
											{...props}
										/>
									),
									// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
									code: ({
										node: _node,
										className,
										children,
										...props
									}: any) => {
										const match = /language-(\w+)/.exec(
											className || "",
										);
										const isInline =
											!match &&
											!String(children).includes("\n");
										return isInline ? (
											<code
												className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
												{...props}
											>
												{children}
											</code>
										) : (
											<code
												className={className}
												{...props}
											>
												{children}
											</code>
										);
									},
								}}
							>
								{paste.content}
							</ReactMarkdown>
						</div>
					</CardContent>
				</Card>
			) : paste.language && paste.language !== "text" ? (
				<Editor
					height="100%"
					language={paste.language}
					value={paste.content}
					theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
					beforeMount={handleEditorWillMount}
					options={{
						minimap: { enabled: false },
						fontSize: fontSize,
						padding: { top: 16 },
						readOnly: true,
						domReadOnly: true,
						mouseWheelZoom: true,
						wordWrap: "on",
					}}
				/>
			) : (
				<Card className="h-full overflow-y-auto border-0 rounded-none">
					<CardContent
						className="h-fit whitespace-pre-wrap py-4"
						style={{ fontSize: `${fontSize}px` }}
					>
						{paste.content}
					</CardContent>
				</Card>
			)}
		</div>
	);
};
