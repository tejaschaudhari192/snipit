import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";
import { ToolCard } from "@/tools/components/tool-card";
import { TOOLS_CONFIG } from "@/tools/config";

// Landing page for the Tools section. Shows a grid of available tools.
const ToolsPage = () => {
	const { t } = useTranslation();

	return (
		<div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
			<div className="mb-8 space-y-4">
				<div className="flex items-center gap-2">
					<Shield className="w-6 h-6 text-primary" />
					<h1 className="text-3xl font-black tracking-tighter text-foreground">
						{t("tools.title")}
					</h1>
				</div>
				<p className="text-lg text-muted-foreground font-medium max-w-2xl">
					{t("tools.subtitle")}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{TOOLS_CONFIG.map((tool) => (
					<ToolCard key={tool.id} tool={tool} />
				))}
			</div>
		</div>
	);
};

export default ToolsPage;
