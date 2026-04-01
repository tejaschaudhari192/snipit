import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface FontSizeControlsProps {
	fontSize: number;
	setFontSize: (value: number | ((prev: number) => number)) => void;
	className?: string;
}

export const FontSizeControls = memo(
	({ fontSize, setFontSize, className }: FontSizeControlsProps) => {
		return (
			<div
				className={cn(
					"flex items-center gap-2 w-full sm:w-auto",
					className,
				)}
			>
				<ButtonGroup className="w-full sm:w-auto">
					<Button
						variant="outline"
						size="icon"
						onClick={() =>
							setFontSize((prev: number) => Math.max(prev - 1, 8))
						}
						className="h-10 w-10 px-0 shrink-0"
					>
						<Minus className="h-4 w-4" />
					</Button>
					<div className="flex items-center justify-center px-4 bg-muted/30 text-xs font-bold min-w-[44px]">
						{fontSize}
					</div>
					<Button
						variant="outline"
						size="icon"
						onClick={() =>
							setFontSize((prev: number) =>
								Math.min(prev + 1, 48),
							)
						}
						className="h-10 w-10 px-0 shrink-0"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</ButtonGroup>
			</div>
		);
	},
);
