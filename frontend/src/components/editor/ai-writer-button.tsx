import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
	onClick: () => void;
}

export const AiWriterButton = ({ onClick }: Props) => {
	const { t } = useTranslation();

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={onClick}
						className="h-9 w-9 shrink-0 bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary shadow-lg shadow-primary/5 transition-all active:scale-95 group rounded-md"
					>
						<Wand2 className="h-[18px] w-[18px] group-hover:scale-110 transition-transform duration-300" />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>{t("editor.ai_writer")}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
