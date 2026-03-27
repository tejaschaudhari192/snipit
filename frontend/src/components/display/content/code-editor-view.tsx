import { Editor, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Textarea } from "@/components/ui/textarea";
import type { ContentMode } from "@/types";

interface CodeEditorViewProps {
	id: string;
	isEdit: boolean;
	contentType: ContentMode;
	language: string;
	content: string;
	onContentChange: (val: string) => void;
	theme: string;
	fontSize: number;
	handleEditorWillMount: BeforeMount;
	contentRef: (node: HTMLElement | null) => void;
	onMount?: OnMount;
}

export const CodeEditorView = ({
	id,
	isEdit,
	contentType,
	language,
	content,
	onContentChange,
	theme,
	fontSize,
	handleEditorWillMount,
	contentRef,
	onMount,
}: CodeEditorViewProps) => {
	if (contentType === "code" || contentType === "text") {
		return (
			<div
				ref={contentRef}
				className="rounded-2xl border border-border/50 shadow-2xl overflow-hidden bg-background/60 backdrop-blur-xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-500"
			>
				<Editor
					key={id}
					height="70vh"
					language={contentType === "text" ? "text" : language}
					defaultValue={content}
					onChange={
						isEdit ? (val) => onContentChange(val ?? "") : undefined
					}
					onMount={onMount}
					beforeMount={handleEditorWillMount}
					theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
					options={{
						readOnly: !isEdit,
						fontSize,
						minimap: { enabled: true },
						scrollBeyondLastLine: false,
						lineNumbers: "on",
						roundedSelection: true,
						padding: { top: 20, bottom: 20 },
						fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
						fontWeight: "500",
						cursorStyle: isEdit ? "line" : "block",
						renderLineHighlight: "all",
						scrollbar: {
							vertical: "visible",
							horizontal: "visible",
							useShadows: false,
							verticalScrollbarSize: 10,
							horizontalScrollbarSize: 10,
						},
						wordWrap: "on",
						automaticLayout: true,
						unicodeHighlight: {
							ambiguousCharacters: false,
							invisibleCharacters: false,
						},
					}}
				/>
			</div>
		);
	}

	return (
		<div ref={contentRef} className="relative z-10">
			<Textarea
				readOnly={!isEdit}
				value={content}
				onChange={
					isEdit ? (e) => onContentChange(e.target.value) : undefined
				}
				className={`min-h-[500px] font-mono text-sm resize-none bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 leading-relaxed shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-500 ${
					!isEdit
						? "select-all cursor-text"
						: "focus-visible:ring-primary/20"
				}`}
				style={{ fontSize: `${fontSize}px` }}
				placeholder="Start typing your content here..."
			/>
		</div>
	);
};
