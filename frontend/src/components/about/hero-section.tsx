import { useTranslation } from "react-i18next";

export const Hero = () => {
	const { t } = useTranslation();

	return (
		<section className="relative min-h-[50vh] flex items-center justify-center py-12 md:py-16 px-4 overflow-hidden">
			<div className="max-w-4xl mx-auto text-center relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
				<div className="flex flex-col items-center justify-center w-full">
					<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[1.1] text-foreground">
						{t("about_page.title")}{" "}
						<span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-primary/80 to-primary/60 drop-shadow-sm">
							Snipit
						</span>
					</h1>
					<p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed px-4">
						{t("about_page.subtitle")}
					</p>
				</div>
			</div>
		</section>
	);
};
