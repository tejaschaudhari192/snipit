import Footer from "@/components/ui/footer";
import { Mail, Github, Zap, Linkedin, Send } from "lucide-react";
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
				<div className="max-w-xs mx-auto">
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

			<section className="py-16 md:py-28 px-4 relative z-10 overflow-hidden">
				{/* Ambient background orbs */}
				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					<div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
					<div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
				</div>

				<div className="max-w-5xl mx-auto relative">
					{/* Section label */}
					<div className="flex items-center justify-center mb-12">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 text-xs font-bold uppercase tracking-widest">
							{t("about_page.team.title")}
						</div>
					</div>

					{app.team.map((member) => (
						<div
							key={member.name}
							className="relative rounded-[2rem] border border-border/60 bg-background/70 backdrop-blur-2xl shadow-2xl overflow-hidden group"
						>
							{/* Animated top-edge glow */}
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

							<div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-0">
								{/* ── Left column: avatar + info ── */}
								<div className="relative flex flex-col items-center justify-center gap-5 px-8 py-10 lg:py-14 lg:border-r border-border/40 shrink-0 lg:w-80">
									{/* Subtle mesh dot pattern */}
									<div
										className="absolute inset-0 opacity-[0.03]"
										style={{
											backgroundImage:
												"radial-gradient(circle, currentColor 1px, transparent 1px)",
											backgroundSize: "20px 20px",
										}}
									/>

									{/* Avatar with animated pulse rings */}
									<div className="relative z-10">
										<div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30 scale-110" />
										<div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary/40 via-primary/20 to-transparent blur-sm" />
										<div className="relative w-28 h-28 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-xl shadow-primary/20">
											<img
												src={member.avatar}
												alt={member.name}
												loading="lazy"
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
											/>
										</div>
									</div>

									{/* Name + role + socials grouped */}
									<div className="relative z-10 flex flex-col items-center gap-3">
										<div className="text-center">
											<h3 className="text-xl font-black tracking-tight text-foreground">
												{member.name}
											</h3>
											<p className="mt-0.5 text-xs font-semibold text-primary/80 uppercase tracking-widest">
												{member.roleKey &&
													t(member.roleKey)}
											</p>
										</div>

										<div className="flex items-center gap-2 flex-wrap justify-center">
											<a
												href={`mailto:${member.email}`}
												title="Email"
												className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/60 hover:bg-[#EA4335] hover:text-white border border-border/50 hover:border-[#EA4335] transition-all duration-300"
											>
												<Mail className="w-3.5 h-3.5" />
												{t(
													"about_page.team.socials.email",
												)}
											</a>
											<a
												href={member.github}
												target="_blank"
												rel="noopener noreferrer"
												title="GitHub"
												className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/60 hover:bg-foreground hover:text-background border border-border/50 hover:border-foreground transition-all duration-300"
											>
												<Github className="w-3.5 h-3.5" />
												GitHub
											</a>
											{member.linkedin && (
												<a
													href={member.linkedin}
													target="_blank"
													rel="noopener noreferrer"
													title="LinkedIn"
													className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/60 hover:bg-[#0077B5] hover:text-white border border-border/50 hover:border-[#0077B5] transition-all duration-300"
												>
													<Linkedin className="w-3.5 h-3.5" />
													LinkedIn
												</a>
											)}
										</div>
									</div>
								</div>

								{/* ── Right column: bio quote + stat chips ── */}
								<div className="flex-1 flex flex-col justify-center gap-8 px-8 md:px-12 py-10 lg:py-14">
									<blockquote className="relative">
										<div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-primary to-primary/20" />
										<p className="pl-6 text-lg md:text-xl text-foreground/80 leading-relaxed italic font-medium">
											{t("about_page.team.quote")}
										</p>
										<footer className="pl-6 mt-3 text-sm text-muted-foreground font-semibold not-italic">
											— {member.name}
										</footer>
									</blockquote>

									<div className="flex flex-wrap gap-3">
										<div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/8 border border-primary/15 text-sm font-semibold text-foreground">
											<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
											{t(
												"about_page.team.badges.founder",
											)}
										</div>
										<div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/60 border border-border/50 text-sm font-semibold text-foreground">
											<Github className="w-4 h-4 text-muted-foreground" />
											{t(
												"about_page.team.badges.open_source",
											)}
										</div>
										<div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/60 border border-border/50 text-sm font-semibold text-foreground">
											<Zap className="w-4 h-4 text-primary" />
											{t(
												"about_page.team.badges.full_stack",
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Bottom-edge glow */}
							<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
						</div>
					))}
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
