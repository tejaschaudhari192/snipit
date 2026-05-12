import { Sparkles } from "lucide-react";
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

export const AiEnhanceButton = ({ onClick }: Props) => {
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
						<Sparkles className="h-[18px] w-[18px] group-hover:scale-110 transition-transform duration-300" />
					</Button>
				</TooltipTrigger>
				<TooltipContent
					side="top"
					className="bg-background/95 backdrop-blur-xl border-border/50 p-2 shadow-xl"
				>
					<p className="text-[10px] font-black uppercase tracking-widest">
						{t("editor.ai_enhance")}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
