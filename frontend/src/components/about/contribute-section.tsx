import { useTranslation } from "react-i18next";
import { Mail, Send } from "lucide-react";

export const ContributeSection = () => {
	const { t } = useTranslation();

	return (
		<section className="py-16 md:py-24 px-4 relative z-10">
			<div className="max-w-2xl mx-auto text-center">
				<h2 className="text-2xl md:text-4xl font-bold mb-4">
					{t("about_page.contribute.title")}
				</h2>
				<p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
					{t("about_page.contribute.desc")}
				</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					<a
						href="mailto:tejaschaudhari2004@gmail.com"
						className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25"
					>
						<Mail className="w-5 h-5" />
						{t("about_page.contribute.email")}
					</a>
					<a
						href="https://t.me/snipit_official"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-background/60 backdrop-blur-xl text-foreground font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
					>
						<Send className="w-5 h-5" />
						{t("about_page.contribute.telegram")}
					</a>
				</div>
			</div>
		</section>
	);
};
