import React from "react";
import { Volume2, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTts } from "@/hooks/use-tts";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface TtsButtonProps {
	content: string;
	contentType: string;
	className?: string;
}

export const TtsButton: React.FC<TtsButtonProps> = ({
	content,
	contentType,
	className,
}) => {
	const { t } = useTranslation();
	const { speak, stop, isPlaying, isPreparing } = useTts();

	const handleToggle = () => {
		if (isPlaying || isPreparing) {
			stop();
		} else {
			speak(content, contentType);
		}
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={handleToggle}
						className={cn(
							"relative transition-all duration-300",
							isPlaying &&
								"border-primary text-primary bg-primary/5",
							className,
						)}
					>
						{isPreparing ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : isPlaying ? (
							<Square className="h-4 w-4 fill-current" />
						) : (
							<Volume2 className="h-4.5 w-4.5" />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>
						{isPlaying || isPreparing
							? t("editor.stop_speaking")
							: t("editor.start_speaking")}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
