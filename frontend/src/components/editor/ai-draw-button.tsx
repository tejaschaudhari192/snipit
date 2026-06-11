import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface Props {
	onClick: () => void;
}

export const AiDrawButton = ({ onClick }: Props) => {
	const { t } = useTranslation();

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={onClick}
			className="gap-2 h-9 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 shadow-lg shadow-primary/5 shrink-0 transition-all active:scale-95 group rounded-md"
		>
			<Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
			<span>{t("ai.draw_title")}</span>
			<Badge
				variant="glass"
				className="text-[9px] px-1 py-0 h-4 font-black uppercase tracking-wider scale-90 border-primary/20 text-primary bg-primary/10"
			>
				Beta
			</Badge>
		</Button>
	);
};
