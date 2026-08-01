import { forwardRef, useImperativeHandle, useState, useEffect } from "react";

export interface MentionItem {
	id: string;
	label: string;
}

export interface MentionListProps {
	items: MentionItem[];
	command: (attrs: { id: string }) => void;
}

export interface MentionListRef {
	onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
	(props, ref) => {
		const [selectedIndex, setSelectedIndex] = useState(0);

		const selectItem = (index: number) => {
			const item = props.items[index];
			if (item) {
				props.command({ id: item.label });
			}
		};

		const upHandler = () => {
			setSelectedIndex(
				(selectedIndex + props.items.length - 1) % props.items.length,
			);
		};

		const downHandler = () => {
			setSelectedIndex((selectedIndex + 1) % props.items.length);
		};

		const enterHandler = () => {
			selectItem(selectedIndex);
		};

		useEffect(() => setSelectedIndex(0), [props.items]);

		useImperativeHandle(ref, () => ({
			onKeyDown: ({ event }: { event: KeyboardEvent }) => {
				if (event.key === "ArrowUp") {
					upHandler();
					return true;
				}
				if (event.key === "ArrowDown") {
					downHandler();
					return true;
				}
				if (event.key === "Enter") {
					enterHandler();
					return true;
				}
				return false;
			},
		}));

		if (!props.items.length) {
			return null;
		}

		return (
			<div className="z-50 h-auto max-h-82.5 w-48 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md text-foreground flex flex-col custom-scrollbar">
				{props.items.map((item: MentionItem, index: number) => (
					<button
						key={item.id}
						onClick={() => selectItem(index)}
						className={`flex w-full items-center rounded px-2 py-1.5 text-left text-xs transition-colors cursor-pointer ${
							index === selectedIndex
								? "bg-accent text-accent-foreground font-medium"
								: "hover:bg-accent/50"
						}`}
					>
						{item.label}
					</button>
				))}
			</div>
		);
	},
);

MentionList.displayName = "MentionList";
