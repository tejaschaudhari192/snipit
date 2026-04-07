import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Home, Plus, FileQuestion } from "lucide-react";
import { playBruhSound } from "@/lib/utils";

const Error = () => {
	const { t } = useTranslation();

	useEffect(() => {
		document.body.classList.add("is-404");
		const timer = setTimeout(() => {
			playBruhSound();
		}, 3000);

		return () => {
			clearTimeout(timer);
			document.body.classList.remove("is-404");
		};
	}, []);

	return (
		<div className="relative min-h-[90vh] flex items-center justify-center px-4 bg-background overflow-hidden">
			<div className="max-w-2xl w-full text-center relative z-10 animate-in fade-in zoom-in duration-700">
				<div className="relative mb-8">
					<div className="relative">
						<h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/70 to-primary/20 leading-none select-none">
							404
						</h1>
					</div>
				</div>

				<div className="mb-6">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/80 backdrop-blur-sm">
						<FileQuestion className="w-8 h-8 text-muted-foreground" />
					</div>
				</div>

				<div className="space-y-4 mb-10">
					<h2 className="text-2xl md:text-3xl font-bold text-foreground">
						{t("error_page.title")}
					</h2>
					<p className="text-lg text-muted-foreground max-w-md mx-auto">
						{t("error_page.subtitle")}
					</p>
					<p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">
						{t("error_page.description")}
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link to="/">
						<Button
							size="lg"
							className="gap-2 px-8 w-full sm:w-auto"
						>
							<Home className="w-4 h-4" />
							{t("error_page.go_home")}
						</Button>
					</Link>
					<Link to="/">
						<Button
							size="lg"
							variant="outline"
							className="gap-2 px-8 w-full sm:w-auto backdrop-blur-sm"
						>
							<Plus className="w-4 h-4" />
							{t("error_page.create_new")}
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Error;
