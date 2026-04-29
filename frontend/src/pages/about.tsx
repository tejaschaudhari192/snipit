import Footer from "@/components/ui/footer";
import { Mail, Users, Github, Zap, Linkedin, Gitlab, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import appScreenshot from "@/assets/brand/app.png";
import app from "@/constants/data";

const AboutPage = () => {
	const { t } = useTranslation();

	return (
		<div className="bg-background text-foreground transition-colors duration-300">
			<section className="relative min-h-[60vh] flex items-center justify-center py-16 md:py-24 px-4 overflow-hidden">
				<div className="max-w-4xl mx-auto text-center relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
					<div className="flex flex-col items-center justify-center w-full">
						<div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-xs md:text-sm font-bold mb-8 ring-1 ring-primary/20 backdrop-blur-sm shadow-lg shadow-primary/5">
							<Zap className="w-4 h-4 fill-current animate-pulse" />
							{t("about_page.features_title")}
						</div>
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tighter leading-[1.1] text-foreground">
							{t("about_page.title")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60 drop-shadow-sm">
								Snipit
							</span>
						</h1>
						<p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed px-4">
							{t("about_page.subtitle")}
						</p>
					</div>
				</div>
			</section>

			<section className="pb-16 px-4 md:px-8">
				<div className="max-w-xl mx-auto">
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
										className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/10`}
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

			<section className="py-16 md:py-24 px-4 relative z-10">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-2xl md:text-4xl font-bold mb-12 text-center text-foreground">
						{t("about_page.team.title")}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
						{app.team.map((member) => (
							<div
								key={member.name}
								className="p-6 md:p-8 rounded-3xl bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl ring-1 ring-white/5 hover:border-primary/30 transition-all duration-300 group"
							>
								<div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
									<div className="relative shrink-0">
										<div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
											<img
												src={member.avatar}
												alt={member.name}
												loading="lazy"
												className="w-full h-full object-cover"
											/>
										</div>
										<div className="absolute -bottom-2 -right-2 bg-background rounded-lg p-1.5 shadow-sm border border-border">
											<Users className="w-4 h-4 text-primary" />
										</div>
									</div>

									<div className="flex-1 space-y-1">
										<h3 className="text-xl font-bold tracking-tight text-foreground">
											{member.name}
										</h3>
										<p className="text-sm font-medium text-primary mb-4">
											{member.roleKey &&
												t(member.roleKey)}
										</p>

										<div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
											<a
												href={`mailto:${member.email}`}
												className="p-2.5 rounded-xl bg-secondary/50 hover:bg-[#EA4335] hover:text-white transition-all duration-300"
												title="Email"
											>
												<Mail className="w-5 h-5" />
											</a>
											<a
												href={member.github}
												target="_blank"
												rel="noopener noreferrer"
												className="p-2.5 rounded-xl bg-secondary/50 hover:bg-foreground hover:text-background transition-all duration-300"
												title="GitHub"
											>
												<Github className="w-5 h-5" />
											</a>
											{member.linkedin && (
												<a
													href={member.linkedin}
													target="_blank"
													rel="noopener noreferrer"
													className="p-2.5 rounded-xl bg-secondary/50 hover:bg-[#0077B5] hover:text-white transition-all duration-300"
													title="LinkedIn"
												>
													<Linkedin className="w-5 h-5" />
												</a>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

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
									{t(
										`about_page.faq.items.${item.key}.question`,
									)}
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									{t(
										`about_page.faq.items.${item.key}.answer`,
									)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-20 md:py-32 px-4">
				<div className="max-w-5xl mx-auto">
					<div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-primary p-8 md:p-20 text-center">
						<div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
						<div className="relative z-10 max-w-2xl mx-auto text-primary-foreground">
							<div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
								<Zap className="w-8 h-8 animate-pulse fill-white" />
							</div>
							<h3 className="text-2xl md:text-5xl font-black mb-6 tracking-tight">
								{t("about_page.contribute.title")}
							</h3>
							<p className="opacity-90 text-base md:text-xl mb-10 leading-relaxed font-medium">
								{t("about_page.contribute.desc")}
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
								<a
									href="https://gitlab.com/tejaschaudhari192/snipit"
									target="_blank"
									rel="noopener noreferrer"
									className="w-full sm:w-auto"
								>
									<Button
										size="lg"
										variant="secondary"
										className="w-full sm:w-auto gap-3 px-10 h-14 text-base font-bold shadow-xl hover:scale-105 transition-transform"
									>
										<Gitlab className="w-6 h-6" />
										{t(
											"about_page.contribute.gitlab_button",
										)}
									</Button>
								</a>
								<a
									href="mailto:jaybalaji192@gmail.com"
									className="w-full sm:w-auto"
								>
									<Button
										size="lg"
										variant="outline"
										className="w-full sm:w-auto gap-3 px-10 h-14 text-base font-bold bg-white/10 border-white/20 text-white hover:bg-white/20"
									>
										<Mail className="w-6 h-6" />
										{t(
											"about_page.contribute.contact_button",
										)}
									</Button>
								</a>
								<a
									href="https://t.me/jaybalaji192"
									target="_blank"
									rel="noopener noreferrer"
									className="w-full sm:w-auto"
								>
									<Button
										size="lg"
										variant="outline"
										className="w-full sm:w-auto gap-3 px-10 h-14 text-base font-bold bg-[#229ED9]/20 border-[#229ED9]/40 text-white hover:bg-[#229ED9]/40"
									>
										<Send className="w-6 h-6" />
										{t(
											"about_page.contribute.telegram_button",
										)}
									</Button>
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default AboutPage;
