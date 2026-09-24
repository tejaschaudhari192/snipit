import { Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import AnimatedBorderButton from "../ui/animated-border-button";

interface Props {
	onClick: () => void;
}

export const AiWriterButton = ({ onClick }: Props) => {
	const { t } = useTranslation();

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					render={
						<AnimatedBorderButton
							variant="outline"
							size="icon-sm"
							onClick={onClick}
							className="h-9 w-9 shrink-0 bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary shadow-lg shadow-primary/5 transition-all active:scale-95 group rounded-md"
						>
							<Wand2 className="h-4.5 w-4.5 group-hover:scale-110 transition-transform duration-300" />
						</AnimatedBorderButton>
					}
				/>
				<TooltipContent side="top">
					<p>{t("editor.ai_writer")}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
