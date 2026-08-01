import { Extension } from "@tiptap/core";
import type { CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		indent: {
			indent: () => ReturnType;
			outdent: () => ReturnType;
		};
		lineHeight: {
			setLineHeight: (lineHeight: string) => ReturnType;
			unsetLineHeight: () => ReturnType;
		};
	}
}

export const Indent = Extension.create({
	name: "indent",

	addOptions() {
		return {
			types: [
				"paragraph",
				"heading",
				"blockquote",
				"bulletList",
				"orderedList",
				"taskItem",
			],
			minLevel: 0,
			maxLevel: 8,
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					indent: {
						default: 0,
						parseHTML: (element) => {
							const val = parseInt(element.style.paddingLeft, 10);
							return val ? val / 24 : 0;
						},
						renderHTML: (attributes) => {
							if (!attributes.indent) {
								return {};
							}
							return {
								style: `padding-left: ${attributes.indent * 24}px;`,
							};
						},
					},
				},
			},
		];
	},

	addCommands() {
		return {
			indent:
				() =>
				({ tr, state, dispatch }: CommandProps) => {
					const { selection } = state;
					tr.doc.nodesBetween(
						selection.from,
						selection.to,
						(node, pos) => {
							if (this.options.types.includes(node.type.name)) {
								const currentIndent = node.attrs.indent || 0;
								if (currentIndent < this.options.maxLevel) {
									tr.setNodeMarkup(pos, undefined, {
										...node.attrs,
										indent: currentIndent + 1,
									});
								}
							}
						},
					);
					if (dispatch) dispatch(tr);
					return true;
				},
			outdent:
				() =>
				({ tr, state, dispatch }: CommandProps) => {
					const { selection } = state;
					tr.doc.nodesBetween(
						selection.from,
						selection.to,
						(node, pos) => {
							if (this.options.types.includes(node.type.name)) {
								const currentIndent = node.attrs.indent || 0;
								if (currentIndent > this.options.minLevel) {
									tr.setNodeMarkup(pos, undefined, {
										...node.attrs,
										indent: currentIndent - 1,
									});
								}
							}
						},
					);
					if (dispatch) dispatch(tr);
					return true;
				},
		};
	},
});

export const LineHeight = Extension.create({
	name: "lineHeight",

	addOptions() {
		return {
			types: ["paragraph", "heading"],
			defaultLineHeight: "normal",
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					lineHeight: {
						default: this.options.defaultLineHeight,
						parseHTML: (element) =>
							element.style.lineHeight ||
							this.options.defaultLineHeight,
						renderHTML: (attributes) => {
							if (
								!attributes.lineHeight ||
								attributes.lineHeight ===
									this.options.defaultLineHeight
							) {
								return {};
							}
							return {
								style: `line-height: ${attributes.lineHeight};`,
							};
						},
					},
				},
			},
		];
	},

	addCommands() {
		return {
			setLineHeight:
				(lineHeight: string) =>
				({ tr, state, dispatch }: CommandProps) => {
					const { selection } = state;
					tr.doc.nodesBetween(
						selection.from,
						selection.to,
						(node, pos) => {
							if (this.options.types.includes(node.type.name)) {
								tr.setNodeMarkup(pos, undefined, {
									...node.attrs,
									lineHeight,
								});
							}
						},
					);
					if (dispatch) dispatch(tr);
					return true;
				},
			unsetLineHeight:
				() =>
				({ tr, state, dispatch }: CommandProps) => {
					const { selection } = state;
					tr.doc.nodesBetween(
						selection.from,
						selection.to,
						(node, pos) => {
							if (this.options.types.includes(node.type.name)) {
								tr.setNodeMarkup(pos, undefined, {
									...node.attrs,
									lineHeight: this.options.defaultLineHeight,
								});
							}
						},
					);
					if (dispatch) dispatch(tr);
					return true;
				},
		};
	},
});
