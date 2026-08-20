import { useTranslation } from "react-i18next";
import app from "@/constants/data";

export const Features = () => {
	const { t } = useTranslation();

	return (
		<section className="py-16 md:py-24 px-4 relative z-10">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-12 md:mb-16">
					<h2 className="text-2xl md:text-4xl font-bold mb-4">
						{t("about_page.features_title")}
					</h2>
					<p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
						{t("about_page.features_subtitle")}
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
					{app.features.map((feature) => (
						<div key={feature.key} className="group">
							<div className="h-full p-6 md:p-8 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 hover:border-primary/40 transition-all duration-300 hover:shadow-primary/10 dark:hover:bg-accent/5">
								<div
									className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/10`}
								>
									<feature.icon className="w-6 h-6 text-white" />
								</div>
								<h3 className="text-lg font-bold mb-3">
									{t(
										`about_page.features.${feature.key}.title`,
									)}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{t(
										`about_page.features.${feature.key}.desc`,
									)}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
