import { Editor, type BeforeMount } from "@monaco-editor/react";
import { Textarea } from "@/components/ui/textarea";

interface CodeEditorViewProps {
	isEdit: boolean;
	contentType: "text" | "code" | "link" | "file";
	language: string;
	content: string;
	onContentChange: (val: string) => void;
	theme: string;
	fontSize: number;
	handleEditorWillMount: BeforeMount;
	contentRef: (node: HTMLElement | null) => void;
}

export const CodeEditorView = ({
	isEdit,
	contentType,
	language,
	content,
	onContentChange,
	theme,
	fontSize,
	handleEditorWillMount,
	contentRef,
}: CodeEditorViewProps) => {
	return (
		<div ref={contentRef}>
			{isEdit ? (
				<Textarea
					value={content}
					onChange={(e) => onContentChange(e.target.value)}
					className="min-h-[500px] font-mono text-sm resize-none bg-muted/20 border-border/50 focus-visible:ring-primary/20 p-6 leading-relaxed shadow-inner"
					placeholder="Start typing your content here..."
				/>
			) : contentType === "code" ? (
				<div className="rounded-xl border border-border/50 shadow-2xl overflow-hidden bg-background/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
					<Editor
						height="70vh"
						language={language}
						value={content}
						beforeMount={handleEditorWillMount}
						theme={
							theme === "dark" ? "snipit-dark" : "snipit-light"
						}
						options={{
							readOnly: true,
							fontSize: fontSize,
							minimap: { enabled: true },
							scrollBeyondLastLine: false,
							lineNumbers: "on",
							roundedSelection: true,
							padding: { top: 20, bottom: 20 },
							fontFamily:
								"'JetBrains Mono', 'Fira Code', monospace",
							fontWeight: "500",
							cursorStyle: "block",
							renderLineHighlight: "all",
							scrollbar: {
								vertical: "visible",
								horizontal: "visible",
								useShadows: false,
								verticalScrollbarSize: 10,
								horizontalScrollbarSize: 10,
							},
						}}
					/>
				</div>
			) : (
				<Textarea
					readOnly
					value={content}
					className="min-h-[500px] font-mono text-sm resize-none bg-muted/20 border-border/50 p-6 leading-relaxed shadow-inner select-all"
					style={{ fontSize: `${fontSize}px` }}
				/>
			)}
		</div>
	);
};
