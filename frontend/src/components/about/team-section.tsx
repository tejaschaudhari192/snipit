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
	HeartHandshake,
} from "lucide-react";
import app from "@/constants/data";
import { useGithubData } from "@/services/github";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const TeamSection = () => {
	const { t } = useTranslation();
	const { repo, contributors } = useGithubData();

	const creator = app.team[0] || {
		name: "Tejas Chaudhari",
		handle: "tejaschaudhari192",
		email: "jaybalaji192@gmail.com",
		github: "https://github.com/tejaschaudhari192",
		linkedin: "https://www.linkedin.com/in/tejaschaudhari192/",
		avatar: "https://avatars.githubusercontent.com/u/104405128?s=400&u=1285d0293657159a9e85e0709ee549c37198667e&v=4",
		roleKey: "about_page.team.roles.developer",
		bio: "Full-stack engineer passionate about building high-performance developer tooling, zero-knowledge privacy vaults, and real-time web applications.",
		quote: "Building tools that make code sharing, zero-knowledge encryption, and developer workflows fast, private, and effortless.",
	};

	const otherContributors = contributors.filter(
		(c) => c.login.toLowerCase() !== "tejaschaudhari192",
	);

	const repoBaseUrl =
		repo?.html_url || "https://github.com/tejaschaudhari192/snipit";

	return (
		<section className="py-16 md:py-24 px-4 relative z-10">
			<div className="max-w-6xl mx-auto">
				{/* Section Header matching Features & FAQ */}
				<div className="text-center mb-12 md:mb-16">
					<h2 className="text-2xl md:text-4xl font-bold mb-4">
						{t("about_page.team.title")}
					</h2>
					<p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
						{t("about_page.team.subtitle")}
					</p>
				</div>

				{/* Creator Card */}
				<div className="max-w-3xl mx-auto mb-16">
					<div className="p-6 md:p-10 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 hover:border-primary/40 transition-all duration-300">
						<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 text-center sm:text-left">
							<Avatar className="w-24 h-24 md:w-28 md:h-28 rounded-2xl ring-2 ring-primary/20 shadow-lg shrink-0">
								<AvatarImage
									src={creator.avatar}
									alt={creator.name}
									className="rounded-2xl object-cover"
								/>
								<AvatarFallback className="rounded-2xl text-xl font-bold">
									TC
								</AvatarFallback>
							</Avatar>

							<div className="space-y-4 flex-1">
								<div>
									<h3 className="text-xl md:text-2xl font-bold text-foreground">
										{creator.name}
									</h3>
									<p className="text-sm font-medium text-primary mt-1">
										{creator.roleKey
											? t(creator.roleKey)
											: "Creator & Lead Developer"}
									</p>
								</div>

								<p className="text-sm md:text-base text-muted-foreground leading-relaxed">
									{creator.bio}
								</p>

								{/* Social Links */}
								<div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
									<a
										href={creator.github}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-medium border border-border/50 transition-colors"
									>
										<Github className="w-4 h-4" />
										<span>GitHub</span>
									</a>

									{creator.linkedin && (
										<a
											href={creator.linkedin}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-medium border border-border/50 transition-colors"
										>
											<Linkedin className="w-4 h-4" />
											<span>LinkedIn</span>
										</a>
									)}

									<a
										href={`mailto:${creator.email}`}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-medium border border-border/50 transition-colors"
									>
										<Mail className="w-4 h-4" />
										<span>Email</span>
									</a>

									{repo && (
										<a
											href={repo.html_url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 transition-colors ml-auto"
										>
											<Star className="w-3.5 h-3.5 fill-primary" />
											<span>
												{repo.stargazers_count} Stars
											</span>
											<span className="opacity-40">
												•
											</span>
											<GitFork className="w-3.5 h-3.5" />
											<span>
												{repo.forks_count} Forks
											</span>
										</a>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Contributors Section */}
				<div className="space-y-6 max-w-4xl mx-auto">
					<div className="text-center space-y-1">
						<h3 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2">
							<Users className="w-5 h-5 text-primary" />
							<span>
								{t("about_page.team.contributors.title")}
							</span>
						</h3>
						<p className="text-sm text-muted-foreground">
							{t("about_page.team.contributors.subtitle")}
						</p>
					</div>

					{otherContributors.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{otherContributors.map((contributor) => {
								const repoCommitsUrl = `${repoBaseUrl}/commits?author=${contributor.login}`;

								return (
									<div
										key={
											contributor.id || contributor.login
										}
										className="p-4 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg ring-1 ring-white/5 hover:border-primary/40 transition-all duration-300 flex items-center justify-between gap-3 group"
									>
										<div className="flex items-center gap-3 min-w-0">
											<Avatar className="w-10 h-10 rounded-xl ring-1 ring-border group-hover:ring-primary/40 transition-all shrink-0">
												<AvatarImage
													src={contributor.avatar_url}
													alt={contributor.login}
													className="rounded-xl object-cover"
												/>
												<AvatarFallback className="rounded-xl text-xs font-semibold">
													{contributor.login
														.slice(0, 2)
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0">
												<h4 className="font-semibold text-sm text-foreground truncate">
													{contributor.login}
												</h4>
												<div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
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

										<a
											href={repoCommitsUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
											title="View commits"
										>
											<ExternalLink className="w-4 h-4" />
										</a>
									</div>
								);
							})}
						</div>
					) : (
						<div className="p-8 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg text-center space-y-4 max-w-lg mx-auto">
							<div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
								<HeartHandshake className="w-6 h-6" />
							</div>
							<div className="space-y-1">
								<h4 className="text-base font-semibold text-foreground">
									{t(
										"about_page.team.contributors.become_contributor",
									) || "Become a Contributor"}
								</h4>
								<p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
									{t(
										"about_page.team.contributors.become_contributor_desc",
									) ||
										"Want to improve Snipit? Join our open-source community and contribute code, features, or bug fixes."}
								</p>
							</div>
							<a
								href={repoBaseUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all text-sm shadow-md shadow-primary/20"
							>
								<Github className="w-4 h-4" />
								<span>
									{t(
										"about_page.team.contributors.contribute_btn",
									) || "Contribute on GitHub"}
								</span>
							</a>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};
