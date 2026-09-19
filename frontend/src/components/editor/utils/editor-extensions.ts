import {
	StarterKit,
	Placeholder,
	TextStyle,
	Color,
	TiptapUnderline,
	TiptapLink,
	HorizontalRule,
	TaskList,
	TaskItem,
	Mathematics,
	Twitter,
	Youtube,
	GlobalDragHandle,
} from "novel";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Mention from "@tiptap/extension-mention";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";

import {
	Indent,
	LineHeight,
	FontSize,
} from "../extensions/formatting-extensions";
import { Transliteration } from "../extensions/transliteration-extension";
import { CustomImage } from "../extensions/custom-image";
import { Attachment } from "../extensions/attachment";
import { mentionSuggestion } from "../extensions/mention-suggestion";
import type { AnyExtension } from "@tiptap/core";

export function createEditorExtensions({
	slashCommand,
	transliterationRef,
	readOnly = false,
}: {
	slashCommand: AnyExtension;
	transliterationRef: React.MutableRefObject<{
		enabled: boolean;
		targetLanguage: string;
	}>;
	readOnly?: boolean;
}): AnyExtension[] {
	return [
		StarterKit.configure({
			horizontalRule: false,
		}),
		Placeholder.configure({
			placeholder: ({ node }) => {
				if (node.type.name === "paragraph") {
					return "Press '/' for commands...";
				}
				return "";
			},
		}),
		TextStyle,
		Color,
		TiptapUnderline,
		TiptapLink,
		Highlight.configure({
			multicolor: true,
		}),
		Superscript,
		Subscript,
		Mention.configure({
			HTMLAttributes: {
				class: "mention bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium border border-primary/20",
			},
			suggestion: mentionSuggestion,
		}),
		HorizontalRule,
		TaskList,
		TaskItem,
		CustomImage,
		Attachment,
		FontFamily,
		Mathematics,
		Twitter,
		Youtube.configure({
			HTMLAttributes: {
				class: "rounded-lg border border-border shadow-sm max-w-full my-4",
			},
		}),
		...(!readOnly
			? [
					GlobalDragHandle.configure({
						dragHandleWidth: 20,
						scrollTreshold: 100,
					}),
					slashCommand,
				]
			: []),
		Transliteration.configure({
			transliterationRef,
		}),
		Table.configure({
			resizable: true,
			HTMLAttributes: {
				class: "border-collapse border border-border w-full my-4",
			},
		}),
		TableRow.configure({
			HTMLAttributes: {
				class: "border-b border-border/80",
			},
		}),
		TableHeader.configure({
			HTMLAttributes: {
				class: "border border-border/85 bg-muted/30 px-3 py-2 text-left font-bold text-xs select-none",
			},
		}),
		TableCell.configure({
			HTMLAttributes: {
				class: "border border-border/70 px-3 py-2 text-xs",
			},
		}),
		TextAlign.configure({
			types: ["heading", "paragraph"],
			alignments: ["left", "center", "right", "justify"],
		}),
		Indent,
		LineHeight,
		FontSize,
	];
}
