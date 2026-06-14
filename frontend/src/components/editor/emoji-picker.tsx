import { Smile } from "lucide-react";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import type { Editor } from "@tiptap/core";

const EMOJI_CATEGORIES = [
	{
		name: "Smileys",
		emojis: [
			"😀",
			"😃",
			"😄",
			"😁",
			"😆",
			"😅",
			"😂",
			"🤣",
			"😊",
			"😇",
			"🙂",
			"🙃",
			"😉",
			"😌",
			"😍",
			"🥰",
			"😘",
			"😗",
			"😙",
			"😚",
			"😋",
			"😛",
			"😝",
			"😜",
			"🤪",
			"🤨",
			"🧐",
			"🤓",
			"😎",
			"🥸",
			"🤩",
			"🥳",
			"😏",
			"😒",
			"😞",
			"😔",
			"😟",
			"😕",
			"🙁",
			"☹️",
		],
	},
	{
		name: "Gestures",
		emojis: [
			"👋",
			"🤚",
			"🖐️",
			"✋",
			"🖖",
			"👌",
			"🤌",
			"🤏",
			"✌️",
			"🤞",
			"🤟",
			"🤘",
			"🤙",
			"👈",
			"👉",
			"👆",
			"🖕",
			"👇",
			"☝️",
			"👍",
			"👎",
			"✊",
			"👊",
			"🤛",
			"🤜",
			"👏",
			"🙌",
			"👐",
			"🤲",
			"🤝",
			"🙏",
			"✍️",
			"💅",
			"🤳",
			"💪",
		],
	},
	{
		name: "Nature",
		emojis: [
			"🐶",
			"🐱",
			"🐭",
			"🐹",
			"🐰",
			"🦊",
			"🐻",
			"🐼",
			"🐨",
			"🐯",
			"🦁",
			"🐮",
			"🐷",
			"🐽",
			"🐸",
			"🐵",
			"🙈",
			"🙉",
			"🙊",
			"🐒",
			"🐔",
			"🐧",
			"🐦",
			"🐤",
			"🐣",
			"🐥",
			"🦆",
			"🦅",
			"🦉",
			"🦇",
			"🐺",
			"🐗",
			"🐴",
			"🦄",
			"🐝",
		],
	},
	{
		name: "Food",
		emojis: [
			"🍏",
			"🍎",
			"🍊",
			"🍋",
			"🍌",
			"🍉",
			"🍇",
			"🍓",
			"🍒",
			"🍑",
			"🍍",
			"🥥",
			"🥝",
			"🍅",
			"🍆",
			"🥑",
			"🥦",
			"🥬",
			"🥒",
			"🌶️",
			"🌽",
			"🥕",
			"🥔",
			"🍠",
			"🥐",
			"🥯",
			"🍞",
			"🥖",
			"🥨",
			"🧀",
			"🥚",
			"🍳",
			"🥞",
			"🧇",
			"🥓",
		],
	},
	{
		name: "Symbols",
		emojis: [
			"❤️",
			"🧡",
			"💛",
			"💚",
			"💙",
			"💜",
			"🖤",
			"🤍",
			"🤎",
			"💔",
			"❣️",
			"💕",
			"💞",
			"💓",
			"💗",
			"💖",
			"💘",
			"💝",
			"💟",
			"☮️",
			"✝️",
			"☪️",
			"🕉️",
			"☸️",
			"✡️",
			"🔯",
			"🕎",
			"☯️",
			"☦️",
			"🛐",
			"⛎",
			"♈",
			"♉",
			"♊",
		],
	},
];

interface EmojiPickerProps {
	editor: Editor;
}

export function EmojiPicker({ editor }: EmojiPickerProps) {
	return (
		<Popover>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer">
							<Smile className="h-4 w-4" />
						</button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
					<span className="font-semibold text-white">
						Insert Emoji
					</span>
				</TooltipContent>
			</Tooltip>
			<PopoverContent
				align="end"
				className="w-64 p-3 bg-popover border border-border shadow-xl rounded-lg"
			>
				<div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto custom-scrollbar">
					{EMOJI_CATEGORIES.map((category) => (
						<div
							key={category.name}
							className="flex flex-col gap-1"
						>
							<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
								{category.name}
							</span>
							<div className="grid grid-cols-8 gap-1">
								{category.emojis.map((emoji) => (
									<button
										key={emoji}
										onClick={() => {
											editor
												.chain()
												.focus()
												.insertContent(emoji)
												.run();
										}}
										className="h-6 w-6 flex items-center justify-center text-sm hover:bg-accent rounded transition-colors cursor-pointer"
									>
										{emoji}
									</button>
								))}
							</div>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
