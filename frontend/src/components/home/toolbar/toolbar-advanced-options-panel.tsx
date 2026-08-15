import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { AdvancedOptions } from "../advanced-options";

interface ToolbarAdvancedOptionsPanelProps {
	isOptionsOpen: boolean;
	setIsOptionsOpen: (val: boolean) => void;
	handleCollaborative: () => void;
}

export function ToolbarAdvancedOptionsPanel({
	isOptionsOpen,
	setIsOptionsOpen,
	handleCollaborative,
}: ToolbarAdvancedOptionsPanelProps) {
	const { t } = useTranslation();

	return (
		<Collapsible
			open={isOptionsOpen}
			onOpenChange={setIsOptionsOpen}
			className="mt-1"
		>
			<CollapsibleContent>
				<div className="border-t border-border/10 pt-2 mt-1.5 px-1.5 sm:px-2">
					<div className="flex items-center gap-2 mb-3 px-1 py-1 group">
						<div className="w-1.5 h-5 bg-primary/30 group-hover:bg-primary transition-colors rounded-full" />
						<h3 className="font-bold text-sm text-primary/70 group-hover:text-primary transition-colors">
							{t("home.misc.advanced_config")}
						</h3>
						<Separator className="flex-1 ml-2 bg-border/5" />
						<Button
							variant="outline"
							size="sm"
							onClick={handleCollaborative}
							className="gap-2 h-8 text-xs font-bold bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all shadow-sm rounded-md ml-2"
						>
							<Users className="h-3.5 w-3.5" />
							{t("home.actions.start_collaboration")}
						</Button>
					</div>

					<ScrollArea className="max-h-112.5 pr-2">
						<AdvancedOptions />
					</ScrollArea>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
