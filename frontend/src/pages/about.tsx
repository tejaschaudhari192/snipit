import Footer from "@/components/ui/footer";
import { Mail, Users, Github, Zap, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import appScreenshot from "@/assets/brand/app.png";
import app from "@/lib/data";

const AboutPage = () => {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
			<div className="flex-1 overflow-x-hidden">
				{/* Hero Section */}
				<section className="relative py-16 md:py-24 px-4 overflow-hidden">
					{/* Enhanced Background Glows for Dark Mode */}
					<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 dark:from-primary/20" />
					<div className="absolute top-10 left-10 w-48 h-48 md:w-72 md:h-72 bg-primary/20 rounded-full blur-[120px] opacity-50" />
					<div className="absolute bottom-10 right-10 w-64 h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[120px] opacity-50" />

					<div className="max-w-4xl mx-auto text-center relative z-10">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-xs md:text-sm font-medium mb-6 ring-1 ring-primary/20">
								<Zap className="w-4 h-4 fill-current" />
								{t("about_page.features_title")}
							</div>
							<h1 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
								{t("about_page.title")}{" "}
								<span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
									Snipit
								</span>
							</h1>
							<p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
								{t("about_page.subtitle")}
							</p>
						</motion.div>
					</div>
				</section>

				{/* App Screenshot Section - Improved for Dark Mode visibility */}
				<section className="pb-16 px-4 md:px-8">
					<div className="max-w-xl mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/20 bg-card"
						>
							<img
								src={appScreenshot}
								alt="Snipit App Screenshot"
								className="w-full h-auto transition-transform duration-700 hover:scale-[1.02] dark:brightness-90 dark:contrast-110"
							/>
							{/* Overlay gradient to blend bottom edge if needed */}
							<div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10" />
						</motion.div>
					</div>
				</section>

				{/* Features Grid */}
				<section className="py-16 md:py-24 px-4 bg-secondary/5 dark:bg-secondary/10">
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
							{app.features.map((feature, index) => (
								<motion.div
									key={feature.key}
									initial={{ opacity: 0, scale: 0.9 }}
									whileInView={{ opacity: 1, scale: 1 }}
									viewport={{ once: true }}
									transition={{
										duration: 0.4,
										delay: index * 0.05,
									}}
									className="group"
								>
									<div className="h-full p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 dark:hover:bg-accent/5">
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
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Story Section */}
				<section className="py-16 md:py-24 px-4">
					<div className="max-w-4xl mx-auto">
						<motion.div
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							className="space-y-8"
						>
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
						</motion.div>
					</div>
				</section>

				{/* Team Section */}
				<section className="py-16 md:py-24 px-4 bg-secondary/5">
					<div className="max-w-5xl mx-auto">
						<h2 className="text-2xl md:text-4xl font-bold mb-12 text-center text-foreground">
							{t("about_page.team.title")}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
							{app.team.map((member, index) => (
								<motion.div
									key={member.name}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{
										duration: 0.4,
										delay: index * 0.1,
									}}
									className="p-6 md:p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm group"
								>
									<div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
										{/* Avatar Container with Dark Mode Ring */}
										<div className="relative shrink-0">
											<div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
												<img
													src={member.avatar}
													alt={member.name}
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
											<p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
												{t("about_page.team.role")}
											</p>

											<div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
												<a
													href={`mailto:${member.email}`}
													className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
												>
													<Mail className="w-4 h-4" />
													<span className="text-xs font-bold">
														Email
													</span>
												</a>
												<a
													href={member.github}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
												>
													<Github className="w-4 h-4" />
													<span className="text-xs font-bold">
														GitHub
													</span>
												</a>
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 md:py-32 px-4">
					<div className="max-w-5xl mx-auto">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-primary p-8 md:p-20 text-center"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
							<div className="relative z-10 max-w-2xl mx-auto text-primary-foreground">
								<div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
									<Heart className="w-8 h-8 animate-pulse fill-white" />
								</div>
								<h3 className="text-2xl md:text-5xl font-black mb-6 tracking-tight">
									{t("about_page.contribute.title")}
								</h3>
								<p className="opacity-90 text-base md:text-xl mb-10 leading-relaxed font-medium">
									{t("about_page.contribute.desc")}
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
									<a
										href="https://github.com/durgeshkapade/snipit"
										target="_blank"
										rel="noopener noreferrer"
										className="w-full sm:w-auto"
									>
										<Button
											size="lg"
											variant="secondary"
											className="w-full sm:w-auto gap-3 px-10 h-14 text-base font-bold shadow-xl hover:scale-105 transition-transform"
										>
											<Github className="w-6 h-6" />
											{t(
												"about_page.contribute.github_button",
											)}
										</Button>
									</a>
									<a
										href="mailto:durgeshkapade26@gmail.com"
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
								</div>
							</div>
						</motion.div>
					</div>
				</section>
			</div>

			<Footer />
		</div>
	);
};

export default AboutPage;
