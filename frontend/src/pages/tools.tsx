import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";

// Landing page for the Tools section. Shows a grid of available tools.
const ToolsPage = () => {
	const { t } = useTranslation();

	const toolsConfig = [
		{
			id: "cryptoSafe",
			titleKey: "tools.cryptoSafe_title",
			descriptionKey: "tools.cryptoSafe_description",
			icon: Shield,
			link: "/tools/cryptoSafe",
		},
		{
			id: "passwordManager",
			titleKey: "tools.password_manager_title",
			descriptionKey: "tools.password_manager_description",
			icon: Lock,
			link: "/tools/passwords",
		},
	];

	return (
		<div className="min-h-full bg-background text-foreground transition-colors duration-300">
			<section className="relative py-12 md:py-16 px-4 overflow-hidden">
				<div className="max-w-4xl mx-auto text-center relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
					<div className="flex flex-col items-center justify-center w-full">
						<div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-xs md:text-sm font-bold mb-6 ring-1 ring-primary/20 backdrop-blur-sm shadow-lg shadow-primary/5">
							<Shield className="w-4 h-4 fill-current" />
							{t("tools.badge")}
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-[1.1] text-foreground">
							{t("tools.title")}
						</h1>
						<p className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
							{t("tools.subtitle")}
						</p>
					</div>
				</div>
			</section>

			<section className="pb-16 px-4 md:px-8 max-w-4xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{toolsConfig.map((tool) => (
						<Card
							key={tool.id}
							className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl flex flex-col"
						>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<tool.icon className="h-5 w-5 text-primary" />
									{t(tool.titleKey)}
								</CardTitle>
								<CardDescription>
									{t(tool.descriptionKey)}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex justify-end mt-auto">
								<Button asChild>
									<Link to={tool.link}>Open</Link>
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
};

export default ToolsPage;
