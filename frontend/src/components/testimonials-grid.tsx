import { useTranslation } from "react-i18next";
import { Quote, Sparkles, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/cn";

import type { Testimonial } from "@/types";
import { TESTIMONIALS } from "@/constants";

export type { Testimonial };
export { TESTIMONIALS };

const getLinkedInAvatar = (linkedinUrl?: string) => {
	if (!linkedinUrl) return undefined;
	const match = linkedinUrl.match(/linkedin\.com\/in\/([^/?#]+)/i);
	return match ? `https://unavatar.io/linkedin/${match[1]}` : undefined;
};

interface TestimonialCardProps {
	testimonial: Testimonial;
	className?: string;
}

export const TestimonialCard = ({
	testimonial,
	className,
}: TestimonialCardProps) => {
	const { t } = useTranslation();
	const { content, author, highlight, verified } = testimonial;
	const avatarSrc = author.avatar || getLinkedInAvatar(author.linkedin);

	return (
		<Card
			className={cn(
				"group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300",
				"hover:-translate-y-1 hover:border-primary/40 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/5",
				"ring-1 ring-foreground/5",
				className,
			)}
		>
			<div
				className="pointer-events-none absolute -top-12 -right-12 size-28 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0"
				aria-hidden="true"
			/>

			<CardContent className="flex h-full flex-col justify-between gap-4 p-0">
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between gap-3">
						<div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Quote className="size-3.5" />
						</div>
						{verified && (
							<span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80 bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/40">
								<CheckCircle2 className="size-3 text-emerald-500" />
								{t(
									"about_page.testimonials.verified",
									"Verified",
								)}
							</span>
						)}
					</div>

					{highlight && (
						<div className="text-sm font-semibold text-foreground tracking-tight line-clamp-1 min-h-5">
							<span>{highlight}</span>
						</div>
					)}

					<blockquote className="text-sm leading-relaxed text-muted-foreground">
						<p className="selection:bg-primary/20">"{content}"</p>
					</blockquote>
				</div>

				<footer className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<Avatar className="size-10 border border-border/60 shrink-0">
							{avatarSrc && (
								<AvatarImage
									src={avatarSrc}
									alt={author.name}
									loading="lazy"
								/>
							)}
							<AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
								{author.initials}
							</AvatarFallback>
						</Avatar>

						<div className="flex flex-col min-w-0 text-left">
							{author.linkedin ? (
								<a
									href={author.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									className="group/link inline-flex items-center gap-1.5 hover:text-primary transition-colors min-w-0"
									title={t(
										"about_page.testimonials.view_linkedin",
										{
											name: author.name,
											defaultValue: `View ${author.name}'s LinkedIn profile`,
										},
									)}
								>
									<cite className="not-italic text-sm font-semibold text-foreground group-hover/link:text-primary transition-colors truncate">
										{author.name}
									</cite>
									<ExternalLink className="size-3 text-muted-foreground/60 group-hover/link:text-primary transition-colors shrink-0" />
								</a>
							) : (
								<cite className="not-italic text-sm font-semibold text-foreground truncate">
									{author.name}
								</cite>
							)}
							<span className="text-xs text-muted-foreground truncate">
								{author.role}
								{author.company ? ` · ${author.company}` : ""}
							</span>
						</div>
					</div>
				</footer>
			</CardContent>
		</Card>
	);
};

export interface TestimonialsGridProps {
	testimonials?: Testimonial[];
	title?: string;
	subtitle?: string;
	badgeText?: string;
	className?: string;
}

export const TestimonialsGrid = ({
	testimonials = TESTIMONIALS,
	title: customTitle,
	subtitle: customSubtitle,
	badgeText: customBadgeText,
	className,
}: TestimonialsGridProps) => {
	const { t } = useTranslation();

	const title =
		customTitle ??
		t(
			"about_page.testimonials.title",
			"Loved by developers & fast-moving teams",
		);
	const subtitle =
		customSubtitle ??
		t(
			"about_page.testimonials.subtitle",
			"See how developers use Snipit to share snippets effortlessly with a smooth, intuitive experience.",
		);
	const badgeText =
		customBadgeText ?? t("about_page.testimonials.badge", "Wall of Love");

	return (
		<section
			aria-labelledby="testimonials-heading"
			className={cn(
				"relative py-16 md:py-24 px-4 overflow-hidden z-10",
				className,
			)}
		>
			<div
				className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden"
				aria-hidden="true"
			>
				<div className="h-62.5 w-125 bg-linear-to-b from-primary/10 via-primary/5 to-transparent blur-3xl opacity-50" />
			</div>

			<div className="max-w-6xl mx-auto">
				<header className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
					{badgeText && (
						<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4 backdrop-blur-md shadow-xs">
							<Sparkles className="size-3.5" />
							<span>{badgeText}</span>
						</div>
					)}

					<h2
						id="testimonials-heading"
						className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.15] mb-4"
					>
						{title}
					</h2>

					<p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
						{subtitle}
					</p>

					<div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-muted-foreground">
						<div className="flex -space-x-2 overflow-hidden">
							{testimonials.slice(0, 4).map((tItem) => {
								const itemAvatar =
									tItem.author.avatar ||
									getLinkedInAvatar(tItem.author.linkedin);

								return (
									<Avatar
										key={tItem.id}
										className="size-7 border-2 border-background ring-1 ring-border/50"
									>
										{itemAvatar && (
											<AvatarImage
												src={itemAvatar}
												alt={tItem.author.name}
											/>
										)}
										<AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
											{tItem.author.initials}
										</AvatarFallback>
									</Avatar>
								);
							})}
						</div>
						<span className="font-medium text-foreground">
							{t(
								"about_page.testimonials.rating_summary",
								"From verified community reviews",
							)}
						</span>
					</div>
				</header>

				{/* Single row scrolling left to right */}
				<div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
					{/* Gradient fade edges for smooth transition */}
					<div
						className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 sm:w-24 bg-linear-to-r from-background to-transparent"
						aria-hidden="true"
					/>
					<div
						className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 sm:w-24 bg-linear-to-l from-background to-transparent"
						aria-hidden="true"
					/>

					<div className="group/marquee flex overflow-x-auto no-scrollbar py-4 mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
						<div className="flex shrink-0 items-stretch gap-6 pr-6 animate-marquee group-hover/marquee:[animation-play-state:paused]">
							{testimonials.map((testimonial) => (
								<TestimonialCard
									key={testimonial.id}
									testimonial={testimonial}
									className="w-[320px] sm:w-95 shrink-0"
								/>
							))}
						</div>
						<div
							className="flex shrink-0 items-stretch gap-6 pr-6 animate-marquee group-hover/marquee:[animation-play-state:paused]"
							aria-hidden="true"
						>
							{testimonials.map((testimonial) => (
								<TestimonialCard
									key={`duplicate-${testimonial.id}`}
									testimonial={testimonial}
									className="w-[320px] sm:w-95 shrink-0"
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default TestimonialsGrid;
