import { useTranslation } from "react-i18next";
import app from "@/constants/data";

export const FAQSection = () => {
	const { t } = useTranslation();

	return (
		<section className="py-16 md:py-24 px-4 relative z-10">
			<div className="max-w-4xl mx-auto">
				<h2 className="text-2xl md:text-4xl font-bold mb-12 text-center">
					{t("about_page.faq.title")}
				</h2>
				<div className="grid gap-6">
					{app.faq.map((item) => (
						<div
							key={item.key}
							className="p-6 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl ring-1 ring-white/5 hover:border-primary/30 transition-all duration-300"
						>
							<h3 className="text-lg font-bold mb-2">
								{t(`about_page.faq.items.${item.key}.question`)}
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								{t(`about_page.faq.items.${item.key}.answer`)}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
