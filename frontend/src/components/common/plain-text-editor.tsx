import { useRef, useCallback, type RefObject, memo } from "react";
import { Textarea } from "@/components/ui/textarea";

const EDITOR_FONT_FAMILY =
	"'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";
const LINE_HEIGHT_MULTIPLIER = 1.6;

export interface PlainTextEditorProps {
	content: string;
	onContentChange: (val: string) => void;
	isEdit?: boolean;
	fontSize?: number;
	placeholder?: string;
	textareaRef?: RefObject<HTMLTextAreaElement | null>;
	onPaste?: React.ClipboardEventHandler<HTMLTextAreaElement>;
	className?: string;
	showLineNumbers?: boolean;
}

/**
 * High-performance mobile-friendly native code/text editor.
 * Provides 100% native mobile touch selection, copy/paste, and magnifier loupe
 * with synchronized line numbers.
 */
export const PlainTextEditor = memo(
	({
		content,
		onContentChange,
		isEdit = true,
		fontSize = 14,
		placeholder = "Start typing your content here...",
		textareaRef: externalRef,
		onPaste,
		className = "",
		showLineNumbers = true,
	}: PlainTextEditorProps) => {
		const internalRef = useRef<HTMLTextAreaElement>(null);
		const textareaRef = externalRef ?? internalRef;
		const lineNumRef = useRef<HTMLDivElement>(null);

		const lineCount = Math.max(1, (content || "").split("\n").length);
		const lineHeight = `${fontSize * LINE_HEIGHT_MULTIPLIER}px`;
		const gutterWidth = `${Math.max(2, String(lineCount).length) * fontSize * 0.65 + 20}px`;

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
						"  " +
						ta.value.substring(end);
					onContentChange(newVal);
					requestAnimationFrame(() => {
						ta.selectionStart = ta.selectionEnd = start + 2;
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
			<div
				className={`flex h-full w-full overflow-hidden bg-background/50 rounded-xl border border-border/40 ${className}`}
			>
				{/* Line-number gutter */}
				{showLineNumbers && (
					<div
						ref={lineNumRef}
						aria-hidden="true"
						className="shrink-0 overflow-hidden select-none text-right pr-2.5 pl-2 pt-4 pb-4 text-muted-foreground/40 border-r border-border/30 bg-muted/10 font-mono"
						style={{
							...sharedTypography,
							fontWeight: 400,
							minWidth: gutterWidth,
						}}
					>
						{Array.from({ length: lineCount }, (_, i) => (
							<div key={i} className="leading-[1.6]">
								{i + 1}
							</div>
						))}
					</div>
				)}

				{/* Editable textarea */}
				<Textarea
					ref={textareaRef}
					readOnly={!isEdit}
					value={content}
					onChange={
						isEdit
							? (e) => onContentChange(e.target.value)
							: undefined
					}
					onScroll={syncScroll}
					onKeyDown={isEdit ? handleKeyDown : undefined}
					onPaste={onPaste}
					spellCheck={false}
					autoCapitalize="off"
					autoComplete="off"
					autoCorrect="off"
					className="flex-1 h-full resize-none bg-transparent border-0 outline-none p-4 text-foreground caret-primary focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none rounded-none font-mono overflow-y-auto custom-scrollbar"
					style={{
						...sharedTypography,
						fontWeight: 500,
						tabSize: 2,
					}}
					placeholder={placeholder}
				/>
			</div>
		);
	},
);
