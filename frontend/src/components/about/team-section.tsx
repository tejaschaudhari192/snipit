import { useState } from "react";
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
	Copy,
	Check,
	Code2,
	Terminal,
	Sparkles,
	ShieldCheck,
	CheckCircle2,
	HeartHandshake,
} from "lucide-react";
import app from "@/constants/data";
import { useGithubData } from "@/services/github";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export const TeamSection = () => {
	const { t } = useTranslation();
	const { repo, contributors } = useGithubData();
	const [hasCopiedClone, setHasCopiedClone] = useState(false);
	const [hasCopiedSnippet, setHasCopiedSnippet] = useState(false);

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
	const cloneCommand = `git clone ${repoBaseUrl}.git`;

	const handleCopyClone = async () => {
		try {
			await navigator.clipboard.writeText(cloneCommand);
			setHasCopiedClone(true);
			setTimeout(() => setHasCopiedClone(false), 2200);
		} catch {
			// Fallback if clipboard fails
		}
	};

	const codeSnippet = `// Snipit Creator & Architecture
export const architect = {
  name: "Tejas Chaudhari",
  role: "Creator & Lead Developer",
  mission: "Fast, beautiful & privacy-first dev tools",
  stack: ["TypeScript", "React 19", "Tailwind CSS", "AES-GCM", "LiveKit"],
  license: "MIT",
  status: "🚀 Shipping continuous updates"
};`;

	const handleCopySnippet = async () => {
		try {
			await navigator.clipboard.writeText(codeSnippet);
			setHasCopiedSnippet(true);
			setTimeout(() => setHasCopiedSnippet(false), 2200);
		} catch {
			// Fallback
		}
	};

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

	return (
		<TooltipProvider>
			<section className="py-16 md:py-24 px-4 relative z-10 overflow-hidden">
				{/* Ambient background glow */}
				<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

				<div className="max-w-6xl mx-auto space-y-12">
					{/* Section Header */}
					<div className="flex flex-col items-center justify-center gap-3 text-center">
						<Badge
							variant="outline"
							className="px-3.5 py-1 gap-1.5 text-xs font-semibold bg-primary/10 text-primary border-primary/25 shadow-xs"
						>
							<Sparkles className="w-3.5 h-3.5 animate-pulse" />
							<span>{t("about_page.team.title")}</span>
						</Badge>

						<h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
							Meet the{" "}
							<span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-indigo-500">
								Creator & Community
							</span>
						</h2>

						<p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
							{t("about_page.team.subtitle")}
						</p>

						{/* Dynamic GitHub Repo Pill */}
						{repo && (
							<Button
								variant="outline"
								size="sm"
								className="mt-2 rounded-full h-8 px-4 font-normal bg-secondary/50 hover:bg-secondary border-border/70 group"
								onClick={() =>
									window.open(
										repo.html_url,
										"_blank",
										"noopener,noreferrer",
									)
								}
							>
								<Github className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
								<span className="font-mono text-xs text-foreground">
									{repo.full_name}
								</span>
								<span className="w-1 h-1 rounded-full bg-border" />
								<span className="flex items-center gap-1 text-xs font-semibold text-foreground">
									<Star className="w-3 h-3 text-amber-500 fill-amber-500" />
									{repo.stargazers_count}
								</span>
								<span className="w-1 h-1 rounded-full bg-border" />
								<span className="flex items-center gap-1 text-xs text-muted-foreground">
									<GitFork className="w-3 h-3" />
									{repo.forks_count}
								</span>
							</Button>
						)}
					</div>

					{/* LEVEL 1: Modern Bento Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
						{/* Card 1: Lead Architect Profile (5 Columns) */}
						<Card className="lg:col-span-5 rounded-3xl bg-background/60 backdrop-blur-xl border-border/70 shadow-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
							{/* Subtle top corner gradient */}
							<div className="absolute -top-16 -left-16 w-36 h-36 bg-primary/15 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/25 transition-all duration-500" />

							<div className="space-y-6 relative z-10">
								{/* Profile Header */}
								<div className="flex items-start gap-4 sm:gap-5">
									<div className="relative shrink-0">
										<Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-300 shadow-md">
											<AvatarImage
												src={creator.avatar}
												alt={creator.name}
												className="rounded-2xl object-cover group-hover:scale-105 transition-transform duration-500"
											/>
											<AvatarFallback className="rounded-2xl text-lg font-bold">
												TC
											</AvatarFallback>
										</Avatar>
										<div className="absolute -bottom-2 -right-2 bg-background rounded-xl p-1.5 shadow-md border border-border">
											<Crown className="w-4 h-4 text-amber-500 fill-amber-500/20" />
										</div>
									</div>

									<div className="space-y-1.5 min-w-0">
										<div className="flex items-center gap-2">
											<h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
												{creator.name}
											</h3>
											<span title="Verified Creator">
												<CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
											</span>
										</div>

										<Badge
											variant="secondary"
											className="text-[11px] font-semibold text-primary uppercase tracking-wider py-0.5"
										>
											{creator.roleKey
												? t(creator.roleKey)
												: "Creator & Lead Developer"}
										</Badge>

										<div>
											<a
												href={creator.github}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
											>
												<span>
													@
													{creator.handle ||
														"tejaschaudhari192"}
												</span>
												<ExternalLink className="w-3 h-3 opacity-60" />
											</a>
										</div>
									</div>
								</div>

								{/* Status Badge */}
								<Badge
									variant="outline"
									className="px-3 py-1 gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-medium"
								>
									<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
									<span>
										{t("about_page.team.shipping_status") ||
											"Shipping Snipit v2.0"}
									</span>
								</Badge>

								{/* Personal Mission Quote */}
								<div className="relative pl-4 border-l-2 border-primary/40 py-1 text-xs sm:text-sm text-muted-foreground leading-relaxed italic bg-primary/5 rounded-r-xl pr-3">
									&ldquo;{creator.quote || creator.bio}&rdquo;
								</div>

								{/* Commit Counter Pill if available */}
								{leadContributor && (
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
										<Badge
											variant="secondary"
											className="gap-1.5 px-2.5 py-1 text-foreground"
										>
											<GitCommit className="w-3.5 h-3.5 text-primary" />
											<span className="font-semibold">
												{leadContributor.contributions}
											</span>
											<span className="text-muted-foreground text-[11px]">
												{t(
													"about_page.team.contributors.contributions",
												)}
											</span>
										</Badge>
										<span className="text-xs text-muted-foreground">
											in Snipit repository
										</span>
									</div>
								)}
							</div>

							{/* Interactive Social & Quick Copy Actions */}
							<div className="pt-6 mt-6 border-t border-border/50 space-y-3 relative z-10">
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										className="flex-1 gap-2 rounded-xl bg-secondary/40 hover:bg-foreground hover:text-background"
										onClick={() =>
											window.open(
												creator.github,
												"_blank",
												"noopener,noreferrer",
											)
										}
									>
										<Github className="w-4 h-4" />
										<span>GitHub</span>
									</Button>

									{creator.linkedin && (
										<Button
											variant="outline"
											size="sm"
											className="flex-1 gap-2 rounded-xl bg-secondary/40 hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5]"
											onClick={() =>
												window.open(
													creator.linkedin,
													"_blank",
													"noopener,noreferrer",
												)
											}
										>
											<Linkedin className="w-4 h-4" />
											<span>LinkedIn</span>
										</Button>
									)}

									<Tooltip>
										<TooltipTrigger
											render={
												<Button
													variant="outline"
													size="icon"
													className="rounded-xl bg-secondary/40 hover:bg-[#EA4335] hover:text-white hover:border-[#EA4335]"
													onClick={() => {
														window.location.href = `mailto:${creator.email}`;
													}}
												>
													<Mail className="w-4 h-4" />
												</Button>
											}
										/>
										<TooltipContent>
											Send Email
										</TooltipContent>
									</Tooltip>
								</div>

								{/* Quick 1-Click Clone Button */}
								<button
									type="button"
									onClick={handleCopyClone}
									className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/40 text-xs font-mono transition-all duration-200 cursor-pointer"
								>
									<div className="flex items-center gap-2 truncate">
										<Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
										<span className="truncate">
											{cloneCommand}
										</span>
									</div>
									<span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-primary shrink-0 ml-2">
										{hasCopiedClone ? (
											<>
												<Check className="w-3.5 h-3.5 text-emerald-500" />
												<span className="text-emerald-500">
													Copied
												</span>
											</>
										) : (
											<>
												<Copy className="w-3.5 h-3.5" />
												<span>Copy</span>
											</>
										)}
									</span>
								</button>
							</div>
						</Card>

						{/* Right Column: Code Window & Impact Stats (7 Columns) */}
						<div className="lg:col-span-7 flex flex-col gap-6">
							{/* Card 2: Interactive IDE / Code Terminal Window */}
							<div className="rounded-3xl bg-[#0d1117] text-[#c9d1d9] border border-border/60 shadow-xl overflow-hidden flex flex-col">
								{/* Window Title Bar */}
								<div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
									<div className="flex items-center gap-2">
										{/* Traffic light dots */}
										<div className="flex items-center gap-1.5">
											<span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
											<span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
											<span className="w-3 h-3 rounded-full bg-[#27c93f]" />
										</div>

										{/* File Tab */}
										<div className="ml-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0d1117] text-xs font-mono text-[#f0f6fc] border border-[#30363d]">
											<Code2 className="w-3.5 h-3.5 text-[#58a6ff]" />
											<span>architect.config.ts</span>
										</div>
									</div>

									{/* Copy snippet button */}
									<Button
										variant="ghost"
										size="xs"
										onClick={handleCopySnippet}
										className="font-mono text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] gap-1.5"
									>
										{hasCopiedSnippet ? (
											<>
												<Check className="w-3 h-3 text-emerald-400" />
												<span className="text-emerald-400 text-[11px]">
													Copied
												</span>
											</>
										) : (
											<>
												<Copy className="w-3 h-3" />
												<span className="text-[11px]">
													Copy
												</span>
											</>
										)}
									</Button>
								</div>

								{/* Code Editor Body */}
								<div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto space-y-1">
									<div className="text-[#8b949e]">
										<span className="text-[#6e7681] mr-3 select-none">
											1
										</span>
										<span className="text-[#ff7b72]">
											export
										</span>{" "}
										<span className="text-[#ff7b72]">
											const
										</span>{" "}
										<span className="text-[#d2a8ff]">
											architect
										</span>{" "}
										= {"{"}
									</div>
									<div>
										<span className="text-[#6e7681] mr-3 select-none">
											2
										</span>
										&nbsp;&nbsp;name:{" "}
										<span className="text-[#a5d6ff]">
											&quot;Tejas Chaudhari&quot;
										</span>
										,
									</div>
									<div>
										<span className="text-[#6e7681] mr-3 select-none">
											3
										</span>
										&nbsp;&nbsp;role:{" "}
										<span className="text-[#a5d6ff]">
											&quot;Creator & Lead Developer&quot;
										</span>
										,
									</div>
									<div>
										<span className="text-[#6e7681] mr-3 select-none">
											4
										</span>
										&nbsp;&nbsp;mission:{" "}
										<span className="text-[#a5d6ff]">
											&quot;Fast, beautiful &
											privacy-first dev tools&quot;
										</span>
										,
									</div>
									<div>
										<span className="text-[#6e7681] mr-3 select-none">
											5
										</span>
										&nbsp;&nbsp;stack: [
										<span className="text-[#79c0ff]">
											&quot;TypeScript&quot;
										</span>
										,{" "}
										<span className="text-[#79c0ff]">
											&quot;React 19&quot;
										</span>
										,{" "}
										<span className="text-[#79c0ff]">
											&quot;Tailwind&quot;
										</span>
										,{" "}
										<span className="text-[#79c0ff]">
											&quot;AES-GCM&quot;
										</span>
										,{" "}
										<span className="text-[#79c0ff]">
											&quot;LiveKit&quot;
										</span>
										],
									</div>
									<div>
										<span className="text-[#6e7681] mr-3 select-none">
											6
										</span>
										&nbsp;&nbsp;openSource:{" "}
										<span className="text-[#ff7b72]">
											true
										</span>
										,
									</div>
									<div>
										<span className="text-[#6e7681] mr-3 select-none">
											7
										</span>
										&nbsp;&nbsp;status:{" "}
										<span className="text-[#7ee787]">
											&quot;🚀 Shipping continuous
											updates&quot;
										</span>
									</div>
									<div>
										<span className="text-[#6e7681] mr-3 select-none">
											8
										</span>
										{"}"};
									</div>
								</div>
							</div>

							{/* Card 3: Metrics & Core Stack Bento Card */}
							<Card className="rounded-3xl bg-background/60 backdrop-blur-xl border-border/70 shadow-xl p-6 flex flex-col justify-between gap-6 hover:border-primary/40 transition-all duration-300">
								<CardContent className="p-0 space-y-6">
									{/* Live Stats Row */}
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
										<div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
											<div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg">
												<Star className="w-4 h-4 fill-amber-500" />
												<span>
													{repo?.stargazers_count ??
														0}
												</span>
											</div>
											<div className="text-[11px] text-muted-foreground font-medium mt-0.5">
												{t(
													"about_page.team.repo_stats.stars",
												)}
											</div>
										</div>

										<div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
											<div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
												<GitFork className="w-4 h-4 text-primary" />
												<span>
													{repo?.forks_count ?? 0}
												</span>
											</div>
											<div className="text-[11px] text-muted-foreground font-medium mt-0.5">
												{t(
													"about_page.team.repo_stats.forks",
												)}
											</div>
										</div>

										<div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
											<div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
												<GitCommit className="w-4 h-4 text-purple-500" />
												<span>
													{leadContributor?.contributions ??
														36}
													+
												</span>
											</div>
											<div className="text-[11px] text-muted-foreground font-medium mt-0.5">
												Commits
											</div>
										</div>

										<div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
											<div className="flex items-center justify-center gap-1 text-emerald-500 font-bold text-lg">
												<ShieldCheck className="w-4 h-4" />
												<span>MIT</span>
											</div>
											<div className="text-[11px] text-muted-foreground font-medium mt-0.5">
												Open Source
											</div>
										</div>
									</div>

									{/* Tech Stack Pills & Star Repo CTA */}
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
										<div className="space-y-2">
											<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
												Core Architecture
											</span>
											<div className="flex flex-wrap items-center gap-1.5">
												{[
													"TypeScript",
													"React 19",
													"Tailwind CSS",
													"AES-GCM PBKDF2",
													"LiveKit WebRTC",
												].map((tech) => (
													<Badge
														key={tech}
														variant="outline"
														className="text-[11px] font-medium bg-primary/10 text-primary border-primary/20 py-0.5"
													>
														{tech}
													</Badge>
												))}
											</div>
										</div>

										<Button
											className="gap-2 rounded-xl shadow-md hover:shadow-primary/20 shrink-0 font-semibold"
											onClick={() =>
												window.open(
													repoBaseUrl,
													"_blank",
													"noopener,noreferrer",
												)
											}
										>
											<Star className="w-3.5 h-3.5 fill-current" />
											<span>
												{t(
													"about_page.team.repo_stats.star_repo",
												)}
											</span>
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* LEVEL 2: Community Contributors */}
					<div className="pt-8 space-y-6 max-w-4xl mx-auto">
						<div className="flex flex-col items-center justify-center gap-1.5 text-center">
							<Badge
								variant="secondary"
								className="gap-1.5 px-3 py-1 text-xs font-medium"
							>
								<Users className="w-3.5 h-3.5 text-primary" />
								<span>
									{t("about_page.team.contributors.title")}
								</span>
							</Badge>
							<p className="text-xs text-muted-foreground max-w-md">
								{t("about_page.team.contributors.subtitle")}
							</p>
						</div>

						{otherContributors.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{otherContributors.map((contributor) => {
									const repoCommitsUrl = `${repoBaseUrl}/commits?author=${contributor.login}`;

									return (
										<Card
											key={
												contributor.id ||
												contributor.login
											}
											className="p-3.5 rounded-2xl bg-background/60 backdrop-blur-xl border-border/60 shadow-sm hover:border-primary/40 transition-all duration-200 group"
										>
											<CardContent className="p-0 flex items-center justify-between gap-3">
												<div className="flex items-center gap-3 min-w-0">
													<Avatar className="w-10 h-10 rounded-xl ring-1 ring-border group-hover:ring-primary/40 transition-all shrink-0">
														<AvatarImage
															src={
																contributor.avatar_url
															}
															alt={
																contributor.login
															}
															className="rounded-xl object-cover"
														/>
														<AvatarFallback className="rounded-xl text-xs">
															{contributor.login.slice(
																0,
																2,
															)}
														</AvatarFallback>
													</Avatar>
													<div className="min-w-0">
														<h4 className="font-semibold text-xs text-foreground truncate">
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

												<Button
													variant="secondary"
													size="icon-sm"
													className="rounded-xl shrink-0 hover:bg-primary hover:text-primary-foreground"
													onClick={() =>
														window.open(
															repoCommitsUrl,
															"_blank",
															"noopener,noreferrer",
														)
													}
												>
													<ExternalLink className="w-3.5 h-3.5" />
												</Button>
											</CardContent>
										</Card>
									);
								})}
							</div>
						) : (
							/* Open Source Invitation Card when no external contributors are cached */
							<Card className="p-6 rounded-2xl bg-secondary/30 border-border/50 text-center space-y-3 max-w-xl mx-auto">
								<CardContent className="p-0 flex flex-col items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
										<HeartHandshake className="w-5 h-5" />
									</div>
									<div className="space-y-1">
										<h4 className="text-sm font-semibold text-foreground">
											{t(
												"about_page.team.contributors.become_contributor",
											) || "Become a Contributor"}
										</h4>
										<p className="text-xs text-muted-foreground">
											{t(
												"about_page.team.contributors.become_contributor_desc",
											) ||
												"Want to improve Snipit? Join our open-source community and contribute code, features, or bug fixes."}
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										className="gap-1.5 rounded-xl bg-secondary"
										onClick={() =>
											window.open(
												repoBaseUrl,
												"_blank",
												"noopener,noreferrer",
											)
										}
									>
										<Github className="w-3.5 h-3.5" />
										<span>
											{t(
												"about_page.team.contributors.contribute_btn",
											) || "Contribute on GitHub"}
										</span>
									</Button>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</section>
		</TooltipProvider>
	);
};
