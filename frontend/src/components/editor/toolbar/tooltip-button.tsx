import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

export function TooltipButton({
	onClick,
	className,
	title,
	shortcut,
	children,
}: {
	onClick?: () => void;
	className?: string;
	title: string;
	shortcut?: string;
	children: React.ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button onClick={onClick} className={className}>
					{children}
				</button>
			</TooltipTrigger>
			<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
				<span className="font-semibold text-white">{title}</span>
				{shortcut && (
					<span className="text-[9px] text-zinc-400 mt-0.5">
						{shortcut}
					</span>
				)}
			</TooltipContent>
		</Tooltip>
	);
}
