import type { Editor, Range } from "@tiptap/core";
import {
	List,
	ListOrdered,
	ListTodo,
	TextQuote,
	Code2,
	Image,
	Video,
	Table,
	Minus,
	Columns,
} from "lucide-react";

export interface CustomSuggestionItem {
	title: string;
	description: string;
	icon: React.ReactNode;
	category: "FORMAT" | "INSERT";
	command: (props: { editor: Editor; range: Range }) => void;
}

export const suggestionItems: CustomSuggestionItem[] = [
	{
		title: "Bullet List",
		description: "Create a simple bulleted list.",
		icon: <List className="w-4 h-4 text-foreground" />,
		category: "FORMAT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run();
		},
	},
	{
		title: "Ordered List",
		description: "Create a list with numbering.",
		icon: <ListOrdered className="w-4 h-4 text-foreground" />,
		category: "FORMAT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run();
		},
	},
	{
		title: "Task List",
		description: "Create a checklist.",
		icon: <ListTodo className="w-4 h-4 text-foreground" />,
		category: "FORMAT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleTaskList().run();
		},
	},
	{
		title: "Blockquote",
		description: "Capture a quote.",
		icon: <TextQuote className="w-4 h-4 text-foreground" />,
		category: "FORMAT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleBlockquote().run();
		},
	},
	{
		title: "Code Block",
		description: "Capture a code snippet.",
		icon: <Code2 className="w-4 h-4 text-foreground" />,
		category: "FORMAT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
		},
	},
	{
		title: "Image",
		description: "Upload or embed an image.",
		icon: <Image className="w-4 h-4 text-foreground" />,
		category: "INSERT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).run();
			window.dispatchEvent(
				new CustomEvent("open-media-modal", {
					detail: { type: "image" },
				}),
			);
		},
	},
	{
		title: "Video",
		description: "Upload or embed a video.",
		icon: <Video className="w-4 h-4 text-foreground" />,
		category: "INSERT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).run();
			window.dispatchEvent(
				new CustomEvent("open-media-modal", {
					detail: { type: "video" },
				}),
			);
		},
	},
	{
		title: "Table",
		description: "Insert a default 3x3 table.",
		icon: <Table className="w-4 h-4 text-foreground" />,
		category: "INSERT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
				.run();
		},
	},
	{
		title: "Horizontal Rule",
		description: "Insert a horizontal divider line.",
		icon: <Minus className="w-4 h-4 text-foreground" />,
		category: "INSERT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).setHorizontalRule().run();
		},
	},
	{
		title: "Columns",
		description: "Insert a two-column grid layout.",
		icon: <Columns className="w-4 h-4 text-foreground" />,
		category: "INSERT",
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.insertContent(
					'<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;"><div style="border: 1px dashed var(--border); padding: 0.5rem; min-height: 50px;"><p></p></div><div style="border: 1px dashed var(--border); padding: 0.5rem; min-height: 50px;"><p></p></div></div>',
				)
				.run();
		},
	},
];
