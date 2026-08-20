import appScreenshot from "@/assets/brand/app.png";

export const AppScreenshot = () => {
	return (
		<section className="pb-12 px-4 md:px-8">
			<div className="max-w-sm mx-auto">
				<div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-border/50 shadow-2xl shadow-black/5 bg-card animate-in fade-in slide-in-from-bottom-12 duration-1000">
					<img
						src={appScreenshot}
						alt="Snipit App Screenshot"
						loading="lazy"
						className="w-full h-auto transition-transform duration-700 hover:scale-[1.02] dark:brightness-90 dark:contrast-110"
					/>
					<div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10" />
				</div>
			</div>
		</section>
	);
};
