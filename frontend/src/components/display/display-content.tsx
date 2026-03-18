import { type BeforeMount } from "@monaco-editor/react";
import { Link } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { PasteData } from "@/types";
import { MarkdownDisplay } from "./content/markdown-display";
import { FileDisplay } from "./content/file-display";
import { CodeEditorView } from "./content/code-editor-view";

interface DisplayContentProps {
	isEdit: boolean;
	contentType: "text" | "code" | "link" | "file";
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

	if (contentType === "file") {
		return <FileDisplay paste={paste} contentRef={contentRef} />;
	}

	if (contentType === "link" && !isEdit) {
		return (
			<div
				ref={contentRef}
				className="flex flex-col items-center justify-center py-24 px-4 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-700 max-w-[600px] mx-auto mt-10"
			>
				<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
					<Link className="w-10 h-10 text-primary" />
				</div>
				<h3 className="text-2xl font-black mb-3">
					{t("common.redirect_ready", "Redirect Ready")}
				</h3>
				<p className="text-muted-foreground mb-8 text-center max-w-md font-medium">
					{t(
						"common.redirect_desc",
						"Click the button below to visit the shared destination link.",
					)}
				</p>
				<a
					href={
						/^https?:\/\//i.test(content)
							? content
							: `https://${content}`
					}
					target="_blank"
					rel="noopener noreferrer"
					className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-200 bg-primary rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95"
				>
					{t("common.visit_link", "Visit Destination")}
					<div className="ml-2 group-hover:translate-x-1 transition-transform">
						🚀
					</div>
				</a>
			</div>
		);
	}

	if (language === "markdown" && !isEdit) {
		return (
			<MarkdownDisplay
				content={content}
				fontSize={fontSize}
				contentRef={contentRef}
			/>
		);
	}

	return (
		<CodeEditorView
			isEdit={isEdit}
			contentType={contentType}
			language={language}
			content={content}
			onContentChange={onContentChange}
			theme={theme}
			fontSize={fontSize}
			handleEditorWillMount={handleEditorWillMount}
			contentRef={contentRef}
		/>
	);
};
