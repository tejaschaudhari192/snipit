import { createSuggestionItems } from "novel";
import {
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	TextQuote,
	Code2,
	Minus,
} from "lucide-react";

export const suggestionItems = createSuggestionItems([
	{
		title: "Heading 1",
		description: "Big section heading.",
		icon: <Heading1 className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setHeading({ level: 1 })
				.run();
		},
	},
	{
		title: "Heading 2",
		description: "Medium section heading.",
		icon: <Heading2 className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setHeading({ level: 2 })
				.run();
		},
	},
	{
		title: "Heading 3",
		description: "Small section heading.",
		icon: <Heading3 className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setHeading({ level: 3 })
				.run();
		},
	},
	{
		title: "Bullet List",
		description: "Create a simple bulleted list.",
		icon: <List className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run();
		},
	},
	{
		title: "Numbered List",
		description: "Create a list with numbering.",
		icon: <ListOrdered className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run();
		},
	},
	{
		title: "Quote",
		description: "Capture a quote.",
		icon: <TextQuote className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBlockquote().run();
		},
	},
	{
		title: "Code Block",
		description: "Capture a code snippet.",
		icon: <Code2 className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
		},
	},
	{
		title: "Divider",
		description: "Insert a horizontal divider.",
		icon: <Minus className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setHorizontalRule().run();
		},
	},
]);
