import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { getTransliteratedSuggestions } from "@/utils/transliteration-utils";

export const Transliteration = Extension.create({
	name: "transliteration",

	addOptions() {
		return {
			transliterationRef: {
				current: { enabled: false, targetLanguage: "hi" },
			},
		};
	},

	addProseMirrorPlugins() {
		const transliterationRef = this.options.transliterationRef;
		return [
			new Plugin({
				key: new PluginKey("transliteration"),
				props: {
					handleKeyDown(view, event) {
						const config = transliterationRef?.current;
						if (!config || !config.enabled) return false;

						if (event.key === " " || event.key === "Enter") {
							const { state, dispatch } = view;
							const { selection } = state;
							const { $from } = selection;

							const textBefore = $from.parent.textBetween(
								0,
								$from.parentOffset,
								null,
								" ",
							);
							const words = textBefore.split(/\s+/);
							const lastWord = words[words.length - 1];

							if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
								const suggestions =
									getTransliteratedSuggestions(
										lastWord,
										config.targetLanguage,
									);
								if (suggestions && suggestions.length > 0) {
									const transliterated = suggestions[0];
									const startPos =
										$from.pos - lastWord.length;
									const endPos = $from.pos;

									const transaction = state.tr.insertText(
										transliterated,
										startPos,
										endPos,
									);
									dispatch(transaction);
									return false; // let default Space or Enter propagate
								}
							}
						}
						return false;
					},
				},
			}),
		];
	},
});
