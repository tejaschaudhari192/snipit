import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import type { Instance } from "tippy.js";
import { MentionList } from "./mention-list";
import type {
	MentionItem,
	MentionListRef,
	MentionListProps,
} from "./mention-list";
import type { SuggestionProps } from "@tiptap/suggestion";

export const mentionSuggestion = {
	items: ({ query }: { query: string }): MentionItem[] => {
		const users = [
			{ id: "alice", label: "Alice Smith" },
			{ id: "bob", label: "Bob Jones" },
			{ id: "charlie", label: "Charlie Brown" },
			{ id: "david", label: "David Miller" },
			{ id: "emma", label: "Emma Watson" },
		];
		return users
			.filter((item) =>
				item.label.toLowerCase().includes(query.toLowerCase()),
			)
			.slice(0, 5);
	},

	render: () => {
		let component: ReactRenderer<MentionListRef, MentionListProps> | null =
			null;
		let popup: Instance[] | null = null;

		return {
			onStart: (props: SuggestionProps<MentionItem>) => {
				component = new ReactRenderer(MentionList, {
					props: props as unknown as MentionListProps,
					editor: props.editor,
				});

				if (
					!props.clientRect ||
					typeof props.clientRect !== "function"
				) {
					return;
				}

				const rect = props.clientRect();
				if (!rect) return;

				popup = tippy("body", {
					getReferenceClientRect: () => rect,
					appendTo: () => document.body,
					content: component.element,
					showOnCreate: true,
					interactive: true,
					trigger: "manual",
					placement: "bottom-start",
				});
			},

			onUpdate(props: SuggestionProps<MentionItem>) {
				if (component) {
					component.updateProps(props as unknown as MentionListProps);
				}

				if (
					!props.clientRect ||
					typeof props.clientRect !== "function" ||
					!popup ||
					!popup[0]
				) {
					return;
				}

				const rect = props.clientRect();
				if (!rect) return;

				popup[0].setProps({
					getReferenceClientRect: () => rect,
				});
			},

			onKeyDown(props: { event: KeyboardEvent }) {
				if (props.event.key === "Escape" && popup && popup[0]) {
					popup[0].hide();
					return true;
				}

				return component?.ref?.onKeyDown(props) ?? false;
			},

			onExit() {
				if (popup && popup[0]) {
					popup[0].destroy();
				}
				if (component) {
					component.destroy();
				}
			},
		};
	},
};
