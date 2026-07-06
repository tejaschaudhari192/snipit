import { useRef, useCallback, type RefObject } from "react";

const EDITOR_FONT_FAMILY = "'JetBrains Mono', 'Fira Code', monospace";
const LINE_HEIGHT_MULTIPLIER = 1.6;

interface PlainTextEditorProps {
	content: string;
	onContentChange: (val: string) => void;
	isEdit?: boolean;
	fontSize: number;
	placeholder?: string;
	textareaRef?: RefObject<HTMLTextAreaElement | null>;
	onPaste?: React.ClipboardEventHandler<HTMLTextAreaElement>;
}

/**
 * Lightweight plaintext editor with synced line-number gutter.
 * Designed to replace Monaco for plain-text content where syntax highlighting
 * is unnecessary, saving ~2 MB of bundle weight.
 */
export const PlainTextEditor = ({
	content,
	onContentChange,
	isEdit = true,
	fontSize,
	placeholder = "Start typing your content here...",
	textareaRef: externalRef,
	onPaste,
}: PlainTextEditorProps) => {
	const internalRef = useRef<HTMLTextAreaElement>(null);
	const textareaRef = externalRef ?? internalRef;
	const lineNumRef = useRef<HTMLDivElement>(null);

	const lineCount = content.split("\n").length;
	const lineHeight = `${fontSize * LINE_HEIGHT_MULTIPLIER}px`;
	const gutterWidth = `${Math.max(3, String(lineCount).length + 1) * fontSize * 0.62 + 24}px`;

	const syncScroll = useCallback(() => {
		if (textareaRef.current && lineNumRef.current) {
			lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
		}
	}, [textareaRef]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Tab") {
				e.preventDefault();
				const ta = e.currentTarget;
				const start = ta.selectionStart;
				const end = ta.selectionEnd;
				const newVal =
					ta.value.substring(0, start) +
					"\t" +
					ta.value.substring(end);
				onContentChange(newVal);
				requestAnimationFrame(() => {
					ta.selectionStart = ta.selectionEnd = start + 1;
				});
			}
		},
		[onContentChange],
	);

	const sharedTypography = {
		fontSize: `${fontSize}px`,
		lineHeight,
		fontFamily: EDITOR_FONT_FAMILY,
	} as const;

	return (
		<div className="flex h-full w-full overflow-hidden bg-transparent">
			{/* Line-number gutter */}
			<div
				ref={lineNumRef}
				aria-hidden
				className="shrink-0 overflow-hidden select-none text-right pr-3 pl-3 pt-5 pb-5 text-muted-foreground/40 border-r border-border/30 bg-muted/5"
				style={{
					...sharedTypography,
					fontWeight: 400,
					minWidth: gutterWidth,
				}}
			>
				{Array.from({ length: lineCount }, (_, i) => (
					<div key={i}>{i + 1}</div>
				))}
			</div>

			{/* Editable textarea */}
			<textarea
				ref={textareaRef}
				readOnly={!isEdit}
				value={content}
				onChange={
					isEdit ? (e) => onContentChange(e.target.value) : undefined
				}
				onScroll={syncScroll}
				onKeyDown={isEdit ? handleKeyDown : undefined}
				onPaste={onPaste}
				spellCheck={false}
				className="flex-1 h-full resize-none bg-transparent border-0 outline-none p-5 text-foreground caret-primary focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
				style={{
					...sharedTypography,
					fontWeight: 500,
					tabSize: 4,
				}}
				placeholder={placeholder}
			/>
		</div>
	);
};
