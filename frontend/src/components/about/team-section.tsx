import { useTranslation } from "react-i18next";
import { Mail, Github, Linkedin, Users } from "lucide-react";
import app from "@/constants/data";

export const TeamSection = () => {
	const { t } = useTranslation();

	return (
		<section className="py-16 md:py-24 px-4 relative z-10">
			<div className="max-w-5xl mx-auto">
				<h2 className="text-2xl md:text-4xl font-bold mb-12 text-center text-foreground">
					{t("about_page.team.title")}
				</h2>
				<div className="flex flex-col items-center justify-center">
					{app.team.map((member) => (
						<div
							key={member.name}
							className="w-full max-w-md p-6 md:p-8 rounded-3xl bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl ring-1 ring-white/5 hover:border-primary/30 transition-all duration-300 group"
						>
							<div className="flex flex-col items-center text-center gap-6">
								<div className="relative shrink-0">
									<div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
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

								<div className="space-y-1">
									<h3 className="text-xl font-bold tracking-tight text-foreground">
										{member.name}
									</h3>
									<p className="text-sm font-medium text-primary mb-4">
										{member.roleKey && t(member.roleKey)}
									</p>

									<div className="flex items-center justify-center gap-2 pt-2">
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
	);
};
