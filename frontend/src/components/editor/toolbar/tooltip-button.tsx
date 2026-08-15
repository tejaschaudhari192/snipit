import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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
			<TooltipTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						onClick={onClick}
						className={className}
					>
						{children}
					</Button>
				}
			/>
			<TooltipContent className="kbd-badge">
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
