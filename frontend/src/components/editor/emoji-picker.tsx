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
import { Button } from "@/components/ui/button";
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
						<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md border-transparent">
							<Smile className="h-4 w-4" />
						</Button>
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
									<Button
										key={emoji}
										variant="ghost"
										onClick={() => {
											editor
												.chain()
												.focus()
												.insertContent(emoji)
												.run();
										}}
										className="h-6 w-6 p-0 text-sm hover:bg-accent rounded transition-colors cursor-pointer"
									>
										{emoji}
									</Button>
								))}
							</div>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
