import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import type { ToolConfig } from "@/tools/config";

interface ToolCardProps {
	tool: ToolConfig;
}

export function ToolCard({ tool }: ToolCardProps) {
	const { t } = useTranslation();

	return (
		<Link
			to={tool.link}
			className={cn(
				"group flex flex-col border border-border rounded-xl p-6 bg-card/50",
				"hover:bg-card hover:shadow-md hover:border-primary/20",
				"transition-all duration-300 ease-in-out",
			)}
		>
			<div className="flex items-center gap-4 mb-4">
				<div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
					<tool.icon className="h-5 w-5" />
				</div>
				<h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
					{t(tool.titleKey)}
				</h2>
			</div>
			<p className="text-muted-foreground text-sm leading-relaxed flex-1">
				{t(tool.descriptionKey)}
			</p>
		</Link>
	);
}
