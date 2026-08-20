import { useTranslation } from "react-i18next";

export const Story = () => {
	const { t } = useTranslation();

	return (
		<section className="py-16 md:py-24 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="space-y-8">
					<h2 className="text-2xl md:text-4xl font-bold mb-8 italic border-l-4 border-primary pl-4">
						{t("about_page.story.title")}
					</h2>
					<div className="space-y-6 md:space-y-8">
						<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
							{t("about_page.story.p1")}
						</p>
						<div className="pl-4 md:pl-6 border-l border-primary/20 bg-primary/5 py-4 rounded-r-lg">
							<p className="text-base md:text-lg text-foreground/80 leading-relaxed italic">
								{t("about_page.story.p2")}
							</p>
						</div>
						<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
							{t("about_page.story.p3")}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};
