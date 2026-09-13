import { useTranslation } from "react-i18next";
import {
	Mail,
	Github,
	Linkedin,
	Users,
	Star,
	GitFork,
	GitCommit,
	ExternalLink,
	Crown,
} from "lucide-react";
import app from "@/constants/data";
import { useGithubData } from "@/services/github";

export const TeamSection = () => {
	const { t } = useTranslation();
	const { repo, contributors } = useGithubData();

	// Find the creator in contributors for live commit count
	const leadContributor = contributors.find(
		(c) => c.login.toLowerCase() === "tejaschaudhari192",
	);

	// Other repo contributors (Level 2 hierarchy)
	const otherContributors = contributors.filter(
		(c) => c.login.toLowerCase() !== "tejaschaudhari192",
	);

	const repoBaseUrl =
		repo?.html_url || "https://github.com/tejaschaudhari192/snipit";

	return (
		<section className="py-16 md:py-24 px-4 relative z-10">
			<div className="max-w-5xl mx-auto space-y-12">
				{/* Section Header */}
				<div className="flex flex-col items-center justify-center gap-3 text-center">
					<h2 className="text-2xl md:text-4xl font-bold text-foreground">
						{t("about_page.team.title")}
					</h2>

					{/* Subtle GitHub Repo Pill */}
					{repo && (
						<a
							href={repo.html_url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50 transition-colors"
							title="View repository on GitHub"
						>
							<Github className="w-3.5 h-3.5" />
							<span>{repo.full_name}</span>
							<span className="w-1 h-1 rounded-full bg-border" />
							<span className="flex items-center gap-1">
								<Star className="w-3 h-3 text-amber-500 fill-amber-500" />
								{repo.stargazers_count}
							</span>
							<span className="w-1 h-1 rounded-full bg-border" />
							<span className="flex items-center gap-1">
								<GitFork className="w-3 h-3" />
								{repo.forks_count}
							</span>
						</a>
					)}
				</div>

				{/* LEVEL 1: Creator & Lead Developer (Centered, Featured) */}
				<div className="flex flex-col items-center justify-center">
					{app.team.map((member) => (
						<div
							key={member.name}
							className="w-full max-w-sm p-6 sm:p-7 rounded-3xl bg-background/60 backdrop-blur-xl border border-border/60 shadow-xl ring-1 ring-white/5 hover:border-primary/40 transition-all duration-300 group flex flex-col justify-between"
						>
							<div className="flex flex-col items-center text-center gap-4">
								<div className="relative shrink-0">
									<div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 shadow-md">
										<img
											src={member.avatar}
											alt={member.name}
											loading="lazy"
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="absolute -bottom-2 -right-2 bg-background rounded-lg p-1.5 shadow-sm border border-border">
										<Crown className="w-3.5 h-3.5 text-primary" />
									</div>
								</div>

								<div className="space-y-1.5 w-full">
									<h3 className="text-xl font-bold tracking-tight text-foreground">
										{member.name}
									</h3>
									<p className="text-xs font-semibold text-primary uppercase tracking-wider">
										{member.roleKey
											? t(member.roleKey)
											: "Creator & Lead Developer"}
									</p>

									{/* Dynamic GitHub Contributions Badge */}
									{leadContributor && (
										<div className="pt-1">
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
												<GitCommit className="w-3 h-3" />
												<span>
													{
														leadContributor.contributions
													}{" "}
													{t(
														"about_page.team.contributors.contributions",
													)}
												</span>
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Social Links */}
							<div className="flex items-center justify-center gap-2 pt-4 mt-4 border-t border-border/40">
								<a
									href={`mailto:${member.email}`}
									className="p-2.5 rounded-xl bg-secondary/50 hover:bg-[#EA4335] hover:text-white transition-all duration-300"
									title="Email"
								>
									<Mail className="w-4 h-4" />
								</a>
								<a
									href={member.github}
									target="_blank"
									rel="noopener noreferrer"
									className="p-2.5 rounded-xl bg-secondary/50 hover:bg-foreground hover:text-background transition-all duration-300"
									title="GitHub Profile"
								>
									<Github className="w-4 h-4" />
								</a>
								{member.linkedin && (
									<a
										href={member.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2.5 rounded-xl bg-secondary/50 hover:bg-[#0077B5] hover:text-white transition-all duration-300"
										title="LinkedIn"
									>
										<Linkedin className="w-4 h-4" />
									</a>
								)}
							</div>
						</div>
					))}
				</div>

				{/* LEVEL 2: Contributors (Separate section below, showing their repo contributions) */}
				{otherContributors.length > 0 && (
					<div className="pt-4 space-y-6 max-w-2xl mx-auto">
						<div className="text-center space-y-1">
							<div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary/60 text-muted-foreground border border-border/50 text-xs font-medium mb-1">
								<Users className="w-3 h-3" />
								<span>
									{t("about_page.team.contributors.title")}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								{t("about_page.team.contributors.subtitle")}
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{otherContributors.map((contributor) => {
								const repoCommitsUrl = `${repoBaseUrl}/commits?author=${contributor.login}`;

								return (
									<div
										key={
											contributor.id || contributor.login
										}
										className="p-4 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/50 shadow-md ring-1 ring-white/5 hover:border-primary/30 transition-all duration-300 flex items-center justify-between gap-3 group"
									>
										<div className="flex items-center gap-3 min-w-0">
											<div className="w-11 h-11 rounded-xl overflow-hidden ring-1 ring-border group-hover:ring-primary/30 transition-all shrink-0">
												<img
													src={contributor.avatar_url}
													alt={contributor.login}
													loading="lazy"
													className="w-full h-full object-cover"
												/>
											</div>
											<div className="min-w-0">
												<h4 className="font-bold text-sm text-foreground truncate">
													{contributor.login}
												</h4>
												<div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
													<GitCommit className="w-3 h-3 text-primary" />
													<span>
														{
															contributor.contributions
														}{" "}
														{t(
															"about_page.team.contributors.contributions",
														)}
													</span>
												</div>
											</div>
										</div>

										{/* Link to repository contributions (NOT personal profile) */}
										<a
											href={repoCommitsUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary/50 hover:bg-primary hover:text-primary-foreground text-xs font-medium transition-all duration-200 shrink-0"
											title={`View ${contributor.login}'s contributions to Snipit`}
										>
											<span>
												{t(
													"about_page.team.contributors.view_contributions",
												) || "Contributions"}
											</span>
											<ExternalLink className="w-3 h-3" />
										</a>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</section>
	);
};
